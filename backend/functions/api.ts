import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, DeleteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createUser, hasPermission, PERMISSIONS, Role } from './rbac';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.MAIN_TABLE!;

interface Resource {
  pk: string;
  sk: string;
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  [key: string]: any;
}

function createResponse(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(body)
  };
}

function getUserFromEvent(event: APIGatewayProxyEvent) {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) {
    throw new Error('Authorization header missing');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const [userId, role] = token.split(':');
  
  if (!userId || !role || !['admin', 'operator', 'viewer'].includes(role)) {
    throw new Error('Invalid token format');
  }
  
  return createUser(userId, role as Role);
}

async function createAuditLog(action: string, resourceType: string, resourceId: string, userId: string, details?: any) {
  const auditLog = {
    pk: 'AUDIT',
    sk: `${Date.now()}_${randomUUID()}`,
    id: randomUUID(),
    action,
    resourceType,
    resourceId,
    userId,
    details: details || {},
    timestamp: new Date().toISOString()
  };
  
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: auditLog
  }));
}

function getTableConfig(tableIndex: string) {
  const configs = {
    '0': { type: 'USER', pk: 'USER', permissions: { read: PERMISSIONS.USERS_READ, write: PERMISSIONS.USERS_WRITE } },
    '1': { type: 'APPLICATION', pk: 'APPLICATION', permissions: { read: PERMISSIONS.APPLICATIONS_READ, write: PERMISSIONS.APPLICATIONS_WRITE } },
    '2': { type: 'DOCUMENT_TYPE', pk: 'DOCUMENT_TYPE', permissions: { read: PERMISSIONS.DOCUMENT_TYPES_READ, write: PERMISSIONS.DOCUMENT_TYPES_WRITE } },
    '3': { type: 'APPROVAL_FLOW', pk: 'APPROVAL_FLOW', permissions: { read: PERMISSIONS.APPROVAL_FLOWS_READ, write: PERMISSIONS.APPROVAL_FLOWS_WRITE } },
    '4': { type: 'APPROVAL_STEP', pk: 'APPROVAL_STEP', permissions: { read: PERMISSIONS.APPROVAL_STEPS_READ, write: PERMISSIONS.APPROVAL_STEPS_WRITE } },
    '5': { type: 'APPROVAL_HISTORY', pk: 'APPROVAL_HISTORY', permissions: { read: PERMISSIONS.APPROVAL_HISTORY_READ, write: PERMISSIONS.APPROVAL_HISTORY_WRITE } },
    '6': { type: 'NOTIFICATION_HISTORY', pk: 'NOTIFICATION_HISTORY', permissions: { read: PERMISSIONS.NOTIFICATION_HISTORY_READ, write: PERMISSIONS.NOTIFICATION_HISTORY_WRITE } },
    '7': { type: 'PROCESSING_ROUTE', pk: 'PROCESSING_ROUTE', permissions: { read: PERMISSIONS.PROCESSING_ROUTES_READ, write: PERMISSIONS.PROCESSING_ROUTES_WRITE } },
    '8': { type: 'DELAY_DETECTION', pk: 'DELAY_DETECTION', permissions: { read: PERMISSIONS.DELAY_DETECTION_READ, write: PERMISSIONS.DELAY_DETECTION_WRITE } },
    '9': { type: 'SUBSIDY_RELATION', pk: 'SUBSIDY_RELATION', permissions: { read: PERMISSIONS.SUBSIDY_RELATION_READ, write: PERMISSIONS.SUBSIDY_RELATION_WRITE } }
  };
  return configs[tableIndex as keyof typeof configs];
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const path = event.path;
    const method = event.httpMethod;
    
    if (method === 'OPTIONS') {
      return createResponse(200, {});
    }
    
    let user;
    try {
      user = getUserFromEvent(event);
    } catch (error) {
      return createResponse(401, { error: 'Unauthorized' });
    }
    
    // GET /resources - 全リソース取得
    if (path === '/resources' && method === 'GET') {
      if (!hasPermission(user, PERMISSIONS.USERS_READ)) {
        return createResponse(403, { error: 'Forbidden' });
      }
      
      try {
        const result = await docClient.send(new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: '#pk <> :auditPk',
          ExpressionAttributeNames: { '#pk': 'pk' },
          ExpressionAttributeValues: { ':auditPk': 'AUDIT' }
        }));
        
        return createResponse(200, {
          resources: result.Items || [],
          count: result.Count || 0
        });
      } catch (error) {
        console.error('Error fetching resources:', error);
        return createResponse(500, { error: 'Internal server error' });
      }
    }
    
    // テーブル別API処理
    const tableMatch = path.match(/^\/api\/(\d+)(?:\/(\w+))?(?:\/(\w+))?$/);
    if (tableMatch) {
      const [, tableIndex, action, id] = tableMatch;
      const config = getTableConfig(tableIndex);
      
      if (!config) {
        return createResponse(404, { error: 'Table not found' });
      }
      
      // 一括インポート
      if (action === 'bulk' && method === 'POST') {
        if (!hasPermission(user, PERMISSIONS.BULK_IMPORT)) {
          return createResponse(403, { error: 'Forbidden' });
        }
        
        try {
          const body = JSON.parse(event.body || '{}');
          const items = body.items || [];
          
          if (!Array.isArray(items)) {
            return createResponse(400, { error: 'Items must be an array' });
          }
          
          let imported = 0;
          let failed = 0;
          const errors: string[] = [];
          
          // 25件ずつに分割してバッチ処理
          for (let i = 0; i < items.length; i += 25) {
            const batch = items.slice(i, i + 25);
            const putRequests = batch.map(item => {
              const id = item.id || randomUUID();
              const now = new Date().toISOString();
              
              return {
                PutRequest: {
                  Item: {
                    ...item,
                    pk: config.pk,
                    sk: id,
                    id,
                    type: config.type,
                    createdAt: item.createdAt || now,
                    updatedAt: now,
                    createdBy: item.createdBy || user.id
                  }
                }
              };
            });
            
            try {
              await docClient.send(new BatchWriteCommand({
                RequestItems: {
                  [TABLE_NAME]: putRequests
                }
              }));
              imported += batch.length;
            } catch (error) {
              failed += batch.length;
              errors.push(`Batch ${Math.floor(i/25) + 1}: ${error}`);
            }
          }
          
          await createAuditLog('BULK_IMPORT', config.type, 'multiple', user.id, {
            imported,
            failed,
            totalItems: items.length
          });
          
          return createResponse(200, { imported, failed, errors });
        } catch (error) {
          console.error('Bulk import error:', error);
          return createResponse(500, { error: 'Internal server error' });
        }
      }
      
      // 一覧取得
      if (!action && method === 'GET') {
        if (!hasPermission(user, config.permissions.read)) {
          return createResponse(403, { error: 'Forbidden' });
        }
        
        try {
          const result = await docClient.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: '#pk = :pk',
            ExpressionAttributeNames: { '#pk': 'pk' },
            ExpressionAttributeValues: { ':pk': config.pk }
          }));
          
          return createResponse(200, {
            items: result.Items || [],
            count: result.Count || 0
          });
        } catch (error) {
          console.error('Error fetching items:', error);
          return createResponse(500, { error: 'Internal server error' });
        }
      }
      
      // 詳細取得
      if (action && !id && method === 'GET') {
        if (!hasPermission(user, config.permissions.read)) {
          return createResponse(403, { error: 'Forbidden' });
        }
        
        try {
          const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { pk: config.pk, sk: action }
          }));
          
          if (!result.Item) {
            return createResponse(404, { error: 'Item not found' });
          }
          
          return createResponse(200, result.Item);
        } catch (error) {
          console.error('Error fetching item:', error);
          return createResponse(500, { error: 'Internal server error' });
        }
      }
      
      // 新規作成
      if (!action && method === 'POST') {
        if (!hasPermission(user, config.permissions.write)) {
          return createResponse(403, { error: 'Forbidden' });
        }
        
        try {
          const body = JSON.parse(event.body || '{}');
          const id = randomUUID();
          const now = new Date().toISOString();
          
          const item = {
            ...body,
            pk: config.pk,
            sk: id,
            id,
            type: config.type,
            createdAt: now,
            updatedAt: now,
            createdBy: user.id
          };
          
          await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item
          }));
          
          await createAuditLog('CREATE', config.type, id, user.id, body);
          
          return createResponse(201, item);
        } catch (error) {
          console.error('Error creating item:', error);
          return createResponse(500, { error: 'Internal server error' });
        }
      }
      
      // 更新
      if (action && method === 'PUT') {
        if (!hasPermission(user, config.permissions.write)) {
          return createResponse(403, { error: 'Forbidden' });
        }
        
        try {
          const body = JSON.parse(event.body || '{}');
          
          // 既存アイテムの確認
          const existing = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { pk: config.pk, sk: action }
          }));
          
          if (!existing.Item) {
            return createResponse(404, { error: 'Item not found' });
          }
          
          const updatedItem = {
            ...existing.Item,
            ...body,
            updatedAt: new Date().toISOString(),
            updatedBy: user.id
          };
          
          await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: updatedItem
          }));
          
          await createAuditLog('UPDATE', config.type, action, user.id, body);
          
          return createResponse(200, updatedItem);
        } catch (error) {
          console.error('Error updating item:', error);
          return createResponse(500, { error: 'Internal server error' });
        }
      }
      
      // 削除
      if (action && method === 'DELETE') {
        if (!hasPermission(user, config.permissions.write)) {
          return createResponse(403, { error: 'Forbidden' });
        }
        
        try {
          const existing = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { pk: config.pk, sk: action }
          }));
          
          if (!existing.Item) {
            return createResponse(404, { error: 'Item not found' });
          }
          
          await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { pk: config.pk, sk: action }
          }));
          
          await createAuditLog('DELETE', config.type, action, user.id);
          
          return createResponse(200, { message: 'Item deleted successfully' });
        } catch (error) {
          console.error('Error deleting item:', error);
          return createResponse(500, { error: 'Internal server error' });
        }
      }
    }
    
    return createResponse(404, { error: 'Endpoint not found' });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
};