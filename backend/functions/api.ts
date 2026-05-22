import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { hasPermission, createUser, PERMISSIONS } from './rbac';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.MAIN_TABLE!;

interface RequestContext {
  userId: string;
  role: 'admin' | 'operator' | 'viewer';
}

const TABLE_CONFIGS = {
  '0': { name: 'users', pk: 'USER#', permissions: { read: PERMISSIONS.USER_READ, write: PERMISSIONS.USER_WRITE, delete: PERMISSIONS.USER_DELETE } },
  '1': { name: 'applications', pk: 'APPLICATION#', permissions: { read: PERMISSIONS.APPLICATION_READ, write: PERMISSIONS.APPLICATION_WRITE, delete: PERMISSIONS.APPLICATION_DELETE } },
  '2': { name: 'document_types', pk: 'DOCUMENT_TYPE#', permissions: { read: PERMISSIONS.DOCUMENT_TYPE_READ, write: PERMISSIONS.DOCUMENT_TYPE_WRITE, delete: PERMISSIONS.DOCUMENT_TYPE_DELETE } },
  '3': { name: 'approval_flows', pk: 'APPROVAL_FLOW#', permissions: { read: PERMISSIONS.APPROVAL_FLOW_READ, write: PERMISSIONS.APPROVAL_FLOW_WRITE, delete: PERMISSIONS.APPROVAL_FLOW_DELETE } },
  '4': { name: 'approval_steps', pk: 'APPROVAL_STEP#', permissions: { read: PERMISSIONS.APPROVAL_STEP_READ, write: PERMISSIONS.APPROVAL_STEP_WRITE, delete: PERMISSIONS.APPROVAL_STEP_DELETE } },
  '5': { name: 'approval_histories', pk: 'APPROVAL_HISTORY#', permissions: { read: PERMISSIONS.APPROVAL_HISTORY_READ, write: PERMISSIONS.APPROVAL_HISTORY_WRITE, delete: PERMISSIONS.APPROVAL_HISTORY_DELETE } },
  '6': { name: 'notifications', pk: 'NOTIFICATION#', permissions: { read: PERMISSIONS.NOTIFICATION_READ, write: PERMISSIONS.NOTIFICATION_WRITE, delete: PERMISSIONS.NOTIFICATION_DELETE } },
  '7': { name: 'process_routes', pk: 'PROCESS_ROUTE#', permissions: { read: PERMISSIONS.PROCESS_ROUTE_READ, write: PERMISSIONS.PROCESS_ROUTE_WRITE, delete: PERMISSIONS.PROCESS_ROUTE_DELETE } },
  '8': { name: 'delay_detections', pk: 'DELAY_DETECTION#', permissions: { read: PERMISSIONS.DELAY_DETECTION_READ, write: PERMISSIONS.DELAY_DETECTION_WRITE, delete: PERMISSIONS.DELAY_DETECTION_DELETE } },
  '9': { name: 'subsidy_relations', pk: 'SUBSIDY_RELATION#', permissions: { read: PERMISSIONS.SUBSIDY_RELATION_READ, write: PERMISSIONS.SUBSIDY_RELATION_WRITE, delete: PERMISSIONS.SUBSIDY_RELATION_DELETE } }
};

function parseRequestContext(event: APIGatewayProxyEvent): RequestContext {
  const userId = event.headers['x-user-id'] || 'anonymous';
  const role = (event.headers['x-user-role'] as 'admin' | 'operator' | 'viewer') || 'viewer';
  return { userId, role };
}

function createResponse(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
    },
    body: JSON.stringify(body)
  };
}

async function createAuditLog(action: string, userId: string, details: any): Promise<void> {
  const auditLog = {
    pk: 'AUDIT',
    sk: `${Date.now()}#${randomUUID()}`,
    action,
    userId,
    details,
    timestamp: new Date().toISOString()
  };
  
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: auditLog
  }));
}

function validateTableIndex(tableIndex: string): boolean {
  return tableIndex in TABLE_CONFIGS;
}

function getTableConfig(tableIndex: string) {
  return TABLE_CONFIGS[tableIndex as keyof typeof TABLE_CONFIGS];
}

async function handleGetResources(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const context = parseRequestContext(event);
    const user = createUser(context.userId, context.role);
    
    if (!hasPermission(user, PERMISSIONS.APPLICATION_READ)) {
      return createResponse(403, { error: 'Insufficient permissions' });
    }

    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(pk, :pk)',
      ExpressionAttributeValues: {
        ':pk': 'APPLICATION#'
      }
    });

    const result = await docClient.send(command);
    return createResponse(200, { items: result.Items || [] });
  } catch (error) {
    console.error('Error in handleGetResources:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleGetTableItems(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const tableIndex = event.pathParameters?.tableIndex;
    if (!tableIndex || !validateTableIndex(tableIndex)) {
      return createResponse(400, { error: 'Invalid table index' });
    }

    const context = parseRequestContext(event);
    const user = createUser(context.userId, context.role);
    const config = getTableConfig(tableIndex);
    
    if (!hasPermission(user, config.permissions.read)) {
      return createResponse(403, { error: 'Insufficient permissions' });
    }

    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(pk, :pk)',
      ExpressionAttributeValues: {
        ':pk': config.pk
      }
    });

    const result = await docClient.send(command);
    return createResponse(200, { items: result.Items || [] });
  } catch (error) {
    console.error('Error in handleGetTableItems:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleGetTableItem(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const tableIndex = event.pathParameters?.tableIndex;
    const id = event.pathParameters?.id;
    
    if (!tableIndex || !validateTableIndex(tableIndex) || !id) {
      return createResponse(400, { error: 'Invalid parameters' });
    }

    const context = parseRequestContext(event);
    const user = createUser(context.userId, context.role);
    const config = getTableConfig(tableIndex);
    
    if (!hasPermission(user, config.permissions.read)) {
      return createResponse(403, { error: 'Insufficient permissions' });
    }

    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${config.pk}${id}`,
        sk: `${config.pk}${id}`
      }
    });

    const result = await docClient.send(command);
    if (!result.Item) {
      return createResponse(404, { error: 'Item not found' });
    }

    return createResponse(200, { item: result.Item });
  } catch (error) {
    console.error('Error in handleGetTableItem:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleCreateTableItem(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const tableIndex = event.pathParameters?.tableIndex;
    if (!tableIndex || !validateTableIndex(tableIndex)) {
      return createResponse(400, { error: 'Invalid table index' });
    }

    const context = parseRequestContext(event);
    const user = createUser(context.userId, context.role);
    const config = getTableConfig(tableIndex);
    
    if (!hasPermission(user, config.permissions.write)) {
      return createResponse(403, { error: 'Insufficient permissions' });
    }

    if (!event.body) {
      return createResponse(400, { error: 'Request body is required' });
    }

    const data = JSON.parse(event.body);
    const id = data.id || randomUUID();
    const now = new Date().toISOString();
    
    const item = {
      ...data,
      pk: `${config.pk}${id}`,
      sk: `${config.pk}${id}`,
      id,
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    });

    await docClient.send(command);
    await createAuditLog('CREATE', context.userId, { table: config.name, id });

    return createResponse(201, { item });
  } catch (error) {
    console.error('Error in handleCreateTableItem:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleUpdateTableItem(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const tableIndex = event.pathParameters?.tableIndex;
    const id = event.pathParameters?.id;
    
    if (!tableIndex || !validateTableIndex(tableIndex) || !id) {
      return createResponse(400, { error: 'Invalid parameters' });
    }

    const context = parseRequestContext(event);
    const user = createUser(context.userId, context.role);
    const config = getTableConfig(tableIndex);
    
    if (!hasPermission(user, config.permissions.write)) {
      return createResponse(403, { error: 'Insufficient permissions' });
    }

    if (!event.body) {
      return createResponse(400, { error: 'Request body is required' });
    }

    const data = JSON.parse(event.body);
    const now = new Date().toISOString();
    
    // Check if item exists
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${config.pk}${id}`,
        sk: `${config.pk}${id}`
      }
    });

    const existingItem = await docClient.send(getCommand);
    if (!existingItem.Item) {
      return createResponse(404, { error: 'Item not found' });
    }

    const updatedItem = {
      ...existingItem.Item,
      ...data,
      updatedAt: now,
      updatedBy: context.userId
    };

    const putCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedItem
    });

    await docClient.send(putCommand);
    await createAuditLog('UPDATE', context.userId, { table: config.name, id });

    return createResponse(200, { item: updatedItem });
  } catch (error) {
    console.error('Error in handleUpdateTableItem:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleDeleteTableItem(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const tableIndex = event.pathParameters?.tableIndex;
    const id = event.pathParameters?.id;
    
    if (!tableIndex || !validateTableIndex(tableIndex) || !id) {
      return createResponse(400, { error: 'Invalid parameters' });
    }

    const context = parseRequestContext(event);
    const user = createUser(context.userId, context.role);
    const config = getTableConfig(tableIndex);
    
    if (!hasPermission(user, config.permissions.delete)) {
      return createResponse(403, { error: 'Insufficient permissions' });
    }

    // Check if item exists
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${config.pk}${id}`,
        sk: `${config.pk}${id}`
      }
    });

    const existingItem = await docClient.send(getCommand);
    if (!existingItem.Item) {
      return createResponse(404, { error: 'Item not found' });
    }

    const deleteCommand = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${config.pk}${id}`,
        sk: `${config.pk}${id}`
      }
    });

    await docClient.send(deleteCommand);
    await createAuditLog('DELETE', context.userId, { table: config.name, id });

    return createResponse(200, { message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error in handleDeleteTableItem:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleBulkImport(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const tableIndex = event.pathParameters?.tableIndex;
    if (!tableIndex || !validateTableIndex(tableIndex)) {
      return createResponse(400, { error: 'Invalid table index' });
    }

    const context = parseRequestContext(event);
    const user = createUser(context.userId, context.role);
    
    if (!hasPermission(user, PERMISSIONS.BULK_IMPORT)) {
      return createResponse(403, { error: 'Insufficient permissions' });
    }

    if (!event.body) {
      return createResponse(400, { error: 'Request body is required' });
    }

    const { items } = JSON.parse(event.body);
    if (!Array.isArray(items)) {
      return createResponse(400, { error: 'Items must be an array' });
    }

    const config = getTableConfig(tableIndex);
    const now = new Date().toISOString();
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process items in batches of 25 (DynamoDB BatchWrite limit)
    for (let i = 0; i < items.length; i += 25) {
      const batch = items.slice(i, i + 25);
      const writeRequests = batch.map(item => {
        const id = item.id || randomUUID();
        return {
          PutRequest: {
            Item: {
              ...item,
              pk: `${config.pk}${id}`,
              sk: `${config.pk}${id}`,
              id,
              createdAt: now,
              updatedAt: now,
              createdBy: context.userId
            }
          }
        };
      });

      try {
        const batchCommand = new BatchWriteCommand({
          RequestItems: {
            [TABLE_NAME]: writeRequests
          }
        });

        const result = await docClient.send(batchCommand);
        
        // Handle unprocessed items
        if (result.UnprocessedItems && result.UnprocessedItems[TABLE_NAME]) {
          const unprocessedCount = result.UnprocessedItems[TABLE_NAME].length;
          failed += unprocessedCount;
          imported += (batch.length - unprocessedCount);
          errors.push(`${unprocessedCount} items failed to process in batch ${Math.floor(i / 25) + 1}`);
        } else {
          imported += batch.length;
        }
      } catch (error) {
        failed += batch.length;
        errors.push(`Batch ${Math.floor(i / 25) + 1} failed: ${error}`);
      }
    }

    await createAuditLog('BULK_IMPORT', context.userId, { 
      table: config.name, 
      imported, 
      failed, 
      total: items.length 
    });

    return createResponse(200, { imported, failed, errors });
  } catch (error) {
    console.error('Error in handleBulkImport:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const path = event.path;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return createResponse(200, {});
    }

    // Route handling
    if (method === 'GET' && path === '/resources') {
      return await handleGetResources(event);
    }

    if (path.startsWith('/api/')) {
      const pathParts = path.split('/');
      const tableIndex = pathParts[2];
      
      if (pathParts.length === 3) {
        // /api/{tableIndex}
        if (method === 'GET') {
          return await handleGetTableItems(event);
        }
        if (method === 'POST') {
          return await handleCreateTableItem(event);
        }
      }
      
      if (pathParts.length === 4) {
        if (pathParts[3] === 'bulk' && method === 'POST') {
          // /api/{tableIndex}/bulk
          return await handleBulkImport(event);
        } else {
          // /api/{tableIndex}/{id}
          const id = pathParts[3];
          event.pathParameters = { tableIndex, id };
          
          if (method === 'GET') {
            return await handleGetTableItem(event);
          }
          if (method === 'PUT') {
            return await handleUpdateTableItem(event);
          }
          if (method === 'DELETE') {
            return await handleDeleteTableItem(event);
          }
        }
      }
    }

    return createResponse(404, { error: 'Endpoint not found' });
  } catch (error) {
    console.error('Unhandled error:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
};