import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
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
  updatedBy?: string;
  [key: string]: any;
}

const TABLE_CONFIGS = {
  '0': { type: 'USER', permissions: { read: PERMISSIONS.USERS_READ, write: PERMISSIONS.USERS_WRITE, delete: PERMISSIONS.USERS_DELETE } },
  '1': { type: 'APPLICATION', permissions: { read: PERMISSIONS.APPLICATIONS_READ, write: PERMISSIONS.APPLICATIONS_WRITE, delete: PERMISSIONS.APPLICATIONS_DELETE } },
  '2': { type: 'DOCUMENT_TYPE', permissions: { read: PERMISSIONS.DOCUMENT_TYPES_READ, write: PERMISSIONS.DOCUMENT_TYPES_WRITE, delete: PERMISSIONS.DOCUMENT_TYPES_DELETE } },
  '3': { type: 'APPROVAL_FLOW', permissions: { read: PERMISSIONS.APPROVAL_FLOWS_READ, write: PERMISSIONS.APPROVAL_FLOWS_WRITE, delete: PERMISSIONS.APPROVAL_FLOWS_DELETE } },
  '4': { type: 'APPROVAL_STEP', permissions: { read: PERMISSIONS.APPROVAL_STEPS_READ, write: PERMISSIONS.APPROVAL_STEPS_WRITE, delete: PERMISSIONS.APPROVAL_STEPS_DELETE } },
  '5': { type: 'APPROVAL_HISTORY', permissions: { read: PERMISSIONS.APPROVAL_HISTORY_READ, write: PERMISSIONS.APPROVAL_HISTORY_WRITE, delete: PERMISSIONS.APPROVAL_HISTORY_DELETE } },
  '6': { type: 'NOTIFICATION_HISTORY', permissions: { read: PERMISSIONS.NOTIFICATION_HISTORY_READ, write: PERMISSIONS.NOTIFICATION_HISTORY_WRITE, delete: PERMISSIONS.NOTIFICATION_HISTORY_DELETE } },
  '7': { type: 'PROCESS_ROUTE', permissions: { read: PERMISSIONS.PROCESS_ROUTES_READ, write: PERMISSIONS.PROCESS_ROUTES_WRITE, delete: PERMISSIONS.PROCESS_ROUTES_DELETE } },
  '8': { type: 'DELAY_DETECTION', permissions: { read: PERMISSIONS.DELAY_DETECTION_READ, write: PERMISSIONS.DELAY_DETECTION_WRITE, delete: PERMISSIONS.DELAY_DETECTION_DELETE } },
  '9': { type: 'SUBSIDY_RELATION', permissions: { read: PERMISSIONS.SUBSIDY_RELATION_READ, write: PERMISSIONS.SUBSIDY_RELATION_WRITE, delete: PERMISSIONS.SUBSIDY_RELATION_DELETE } }
};

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userId
  };
  
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: auditLog
  }));
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const path = event.path;
    const method = event.httpMethod;
    
    if (method === 'OPTIONS') {
      return createResponse(200, {});
    }
    
    if (path === '/resources' && method === 'GET') {
      try {
        const user = getUserFromEvent(event);
        
        const resources = [];
        
        for (const [tableIndex, config] of Object.entries(TABLE_CONFIGS)) {
          if (hasPermission(user, config.permissions.read)) {
            try {
              const result = await docClient.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: '#type = :type',
                ExpressionAttributeNames: {
                  '#type': 'type'
                },
                ExpressionAttributeValues: {
                  ':type': config.type
                },
                Limit: 10
              }));
              
              resources.push({
                tableIndex,
                type: config.type,
                count: result.Count || 0,
                items: result.Items || []
              });
            } catch (error) {
              resources.push({
                tableIndex,
                type: config.type,
                count: 0,
                items: [],
                error: 'Failed to fetch data'
              });
            }
          }
        }
        
        return createResponse(200, { resources });
      } catch (error) {
        return createResponse(403, { error: 'Unauthorized' });
      }
    }
    
    const pathMatch = path.match(/^\/api\/(\d+)(?:\/(\w+))?(?:\/(bulk|[\w-]+))?$/);
    if (!pathMatch) {
      return createResponse(404, { error: 'Not found' });
    }
    
    const [, tableIndex, resourceId, action] = pathMatch;
    const config = TABLE_CONFIGS[tableIndex as keyof typeof TABLE_CONFIGS];
    
    if (!config) {
      return createResponse(404, { error: 'Table not found' });
    }
    
    try {
      const user = getUserFromEvent(event);
      
      if (action === 'bulk' && method === 'POST') {
        if (!hasPermission(user, PERMISSIONS.BULK_IMPORT)) {
          return createResponse(403, { error: 'Insufficient permissions for bulk import' });
        }
        
        const body = JSON.parse(event.body || '{}');
        const items = body.items || [];
        
        if (!Array.isArray(items)) {
          return createResponse(400, { error: 'Items must be an array' });
        }
        
        let imported = 0;
        let failed = 0;
        const errors: string[] = [];
        
        const chunks = [];
        for (let i = 0; i < items.length; i += 25) {
          chunks.push(items.slice(i, i + 25));
        }
        
        for (const chunk of chunks) {
          const writeRequests = chunk.map(item => {
            const now = new Date().toISOString();
            const id = item.id || randomUUID();
            
            return {
              PutRequest: {
                Item: {
                  ...item,
                  pk: config.type,
                  sk: id,
                  id,
                  type: config.type,
                  createdAt: now,
                  updatedAt: now,
                  createdBy: user.id
                }
              }
            };
          });
          
          try {
            await docClient.send(new BatchWriteCommand({
              RequestItems: {
                [TABLE_NAME]: writeRequests
              }
            }));
            imported += chunk.length;
          } catch (error) {
            failed += chunk.length;
            errors.push(`Batch write failed: ${error}`);
          }
        }
        
        await createAuditLog('BULK_IMPORT', config.type, 'multiple', user.id, { imported, failed });
        
        return createResponse(200, { imported, failed, errors });
      }
      
      if (method === 'GET') {
        if (!hasPermission(user, config.permissions.read)) {
          return createResponse(403, { error: 'Insufficient permissions' });
        }
        
        if (resourceId) {
          const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              pk: config.type,
              sk: resourceId
            }
          }));
          
          if (!result.Item) {
            return createResponse(404, { error: 'Resource not found' });
          }
          
          return createResponse(200, result.Item);
        } else {
          const result = await docClient.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: '#type = :type',
            ExpressionAttributeNames: {
              '#type': 'type'
            },
            ExpressionAttributeValues: {
              ':type': config.type
            }
          }));
          
          return createResponse(200, { items: result.Items || [] });
        }
      }
      
      if (method === 'POST') {
        if (!hasPermission(user, config.permissions.write)) {
          return createResponse(403, { error: 'Insufficient permissions' });
        }
        
        const body = JSON.parse(event.body || '{}');
        const now = new Date().toISOString();
        const id = body.id || randomUUID();
        
        const item: Resource = {
          ...body,
          pk: config.type,
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
      }
      
      if (method === 'PUT' && resourceId) {
        if (!hasPermission(user, config.permissions.write)) {
          return createResponse(403, { error: 'Insufficient permissions' });
        }
        
        const body = JSON.parse(event.body || '{}');
        const now = new Date().toISOString();
        
        const existing = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: config.type,
            sk: resourceId
          }
        }));
        
        if (!existing.Item) {
          return createResponse(404, { error: 'Resource not found' });
        }
        
        const item: Resource = {
          ...existing.Item,
          ...body,
          pk: config.type,
          sk: resourceId,
          id: resourceId,
          type: config.type,
          updatedAt: now,
          updatedBy: user.id
        };
        
        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: item
        }));
        
        await createAuditLog('UPDATE', config.type, resourceId, user.id, body);
        
        return createResponse(200, item);
      }
      
      if (method === 'DELETE' && resourceId) {
        if (!hasPermission(user, config.permissions.delete)) {
          return createResponse(403, { error: 'Insufficient permissions' });
        }
        
        const existing = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: config.type,
            sk: resourceId
          }
        }));
        
        if (!existing.Item) {
          return createResponse(404, { error: 'Resource not found' });
        }
        
        await docClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: config.type,
            sk: resourceId
          }
        }));
        
        await createAuditLog('DELETE', config.type, resourceId, user.id);
        
        return createResponse(200, { message: 'Resource deleted successfully' });
      }
      
      return createResponse(405, { error: 'Method not allowed' });
      
    } catch (authError) {
      return createResponse(403, { error: 'Unauthorized' });
    }
    
  } catch (error) {
    console.error('Error:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
};