import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { hasPermission, extractRole, extractUserId, Role } from './rbac';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.MAIN_TABLE!;

interface APIGatewayEvent {
  httpMethod: string;
  path: string;
  pathParameters?: { [key: string]: string };
  queryStringParameters?: { [key: string]: string };
  body?: string;
  headers?: { [key: string]: string };
  requestContext?: any;
}

interface APIResponse {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
}

const tableConfigs = {
  '0': { name: 'users', pk: 'userId' },
  '1': { name: 'applications', pk: 'applicationId' },
  '2': { name: 'documentTypes', pk: 'documentTypeId' },
  '3': { name: 'approvalFlows', pk: 'approvalFlowId' },
  '4': { name: 'approvalSteps', pk: 'approvalStepId' },
  '5': { name: 'approvalHistory', pk: 'approvalHistoryId' },
  '6': { name: 'approverAssignments', pk: 'approverAssignmentId' },
  '7': { name: 'notificationHistory', pk: 'notificationHistoryId' },
  '8': { name: 'routeChangeHistory', pk: 'routeChangeHistoryId' },
  '9': { name: 'documentClassificationRules', pk: 'ruleId' },
  '10': { name: 'delayDetectionSettings', pk: 'delayDetectionSettingId' }
};

function createResponse(statusCode: number, body: any): APIResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-role, x-user-id'
    },
    body: JSON.stringify(body)
  };
}

function validateRequired(data: any, fields: string[]): string[] {
  const errors: string[] = [];
  for (const field of fields) {
    if (!data[field]) {
      errors.push(`${field} is required`);
    }
  }
  return errors;
}

async function createAuditLog(action: string, resource: string, userId: string, details?: any): Promise<void> {
  const auditLog = {
    pk: 'AUDIT',
    sk: `${Date.now()}_${randomUUID()}`,
    action,
    resource,
    userId,
    details: details || {},
    timestamp: new Date().toISOString()
  };
  
  try {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: auditLog
    }));
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

async function handleGetResources(event: APIGatewayEvent): Promise<APIResponse> {
  const role = extractRole(event);
  const userId = extractUserId(event);
  
  if (!hasPermission(role, 'resources', 'read')) {
    return createResponse(403, { error: 'Insufficient permissions' });
  }

  try {
    const tableIndex = event.pathParameters?.tableIndex;
    if (!tableIndex || !tableConfigs[tableIndex as keyof typeof tableConfigs]) {
      return createResponse(400, { error: 'Invalid table index' });
    }

    const config = tableConfigs[tableIndex as keyof typeof tableConfigs];
    const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : 50;
    const lastKey = event.queryStringParameters?.lastKey;

    const scanParams: any = {
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(pk, :pkPrefix)',
      ExpressionAttributeValues: {
        ':pkPrefix': config.name.toUpperCase()
      },
      Limit: Math.min(limit, 100)
    };

    if (lastKey) {
      try {
        scanParams.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
      } catch (error) {
        return createResponse(400, { error: 'Invalid lastKey parameter' });
      }
    }

    const result = await docClient.send(new ScanCommand(scanParams));
    
    await createAuditLog('READ', `${config.name}_list`, userId, { count: result.Items?.length || 0 });

    return createResponse(200, {
      items: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
      count: result.Items?.length || 0
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleGetResource(event: APIGatewayEvent): Promise<APIResponse> {
  const role = extractRole(event);
  const userId = extractUserId(event);
  
  if (!hasPermission(role, 'resources', 'read')) {
    return createResponse(403, { error: 'Insufficient permissions' });
  }

  try {
    const tableIndex = event.pathParameters?.tableIndex;
    const resourceId = event.pathParameters?.id;
    
    if (!tableIndex || !resourceId || !tableConfigs[tableIndex as keyof typeof tableConfigs]) {
      return createResponse(400, { error: 'Invalid parameters' });
    }

    const config = tableConfigs[tableIndex as keyof typeof tableConfigs];
    
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${config.name.toUpperCase()}_${resourceId}`,
        sk: resourceId
      }
    }));

    if (!result.Item) {
      return createResponse(404, { error: 'Resource not found' });
    }

    await createAuditLog('READ', `${config.name}_detail`, userId, { resourceId });

    return createResponse(200, result.Item);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleCreateResource(event: APIGatewayEvent): Promise<APIResponse> {
  const role = extractRole(event);
  const userId = extractUserId(event);
  
  if (!hasPermission(role, 'resources', 'create')) {
    return createResponse(403, { error: 'Insufficient permissions' });
  }

  try {
    const tableIndex = event.pathParameters?.tableIndex;
    if (!tableIndex || !tableConfigs[tableIndex as keyof typeof tableConfigs]) {
      return createResponse(400, { error: 'Invalid table index' });
    }

    const config = tableConfigs[tableIndex as keyof typeof tableConfigs];
    const data = JSON.parse(event.body || '{}');
    
    const requiredFields = getRequiredFields(config.name);
    const validationErrors = validateRequired(data, requiredFields);
    if (validationErrors.length > 0) {
      return createResponse(400, { error: 'Validation failed', details: validationErrors });
    }

    const id = data[config.pk] || randomUUID();
    const now = new Date().toISOString();
    
    const item = {
      ...data,
      [config.pk]: id,
      pk: `${config.name.toUpperCase()}_${id}`,
      sk: id,
      createdAt: now,
      updatedAt: now,
      createdBy: userId
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(pk)'
    }));

    await createAuditLog('CREATE', config.name, userId, { resourceId: id });

    return createResponse(201, item);
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return createResponse(409, { error: 'Resource already exists' });
    }
    console.error('Error creating resource:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleUpdateResource(event: APIGatewayEvent): Promise<APIResponse> {
  const role = extractRole(event);
  const userId = extractUserId(event);
  
  if (!hasPermission(role, 'resources', 'update')) {
    return createResponse(403, { error: 'Insufficient permissions' });
  }

  try {
    const tableIndex = event.pathParameters?.tableIndex;
    const resourceId = event.pathParameters?.id;
    
    if (!tableIndex || !resourceId || !tableConfigs[tableIndex as keyof typeof tableConfigs]) {
      return createResponse(400, { error: 'Invalid parameters' });
    }

    const config = tableConfigs[tableIndex as keyof typeof tableConfigs];
    const data = JSON.parse(event.body || '{}');
    
    const updateExpression = [];
    const expressionAttributeNames: any = {};
    const expressionAttributeValues: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (key !== config.pk && key !== 'pk' && key !== 'sk' && key !== 'createdAt') {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    }
    
    updateExpression.push('#updatedAt = :updatedAt');
    updateExpression.push('#updatedBy = :updatedBy');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeNames['#updatedBy'] = 'updatedBy';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    expressionAttributeValues[':updatedBy'] = userId;

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${config.name.toUpperCase()}_${resourceId}`,
        sk: resourceId
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(pk)',
      ReturnValues: 'ALL_NEW'
    }));

    await createAuditLog('UPDATE', config.name, userId, { resourceId, changes: data });

    return createResponse(200, result.Attributes);
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return createResponse(404, { error: 'Resource not found' });
    }
    console.error('Error updating resource:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleDeleteResource(event: APIGatewayEvent): Promise<APIResponse> {
  const role = extractRole(event);
  const userId = extractUserId(event);
  
  if (!hasPermission(role, 'resources', 'delete')) {
    return createResponse(403, { error: 'Insufficient permissions' });
  }

  try {
    const tableIndex = event.pathParameters?.tableIndex;
    const resourceId = event.pathParameters?.id;
    
    if (!tableIndex || !resourceId || !tableConfigs[tableIndex as keyof typeof tableConfigs]) {
      return createResponse(400, { error: 'Invalid parameters' });
    }

    const config = tableConfigs[tableIndex as keyof typeof tableConfigs];
    
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${config.name.toUpperCase()}_${resourceId}`,
        sk: resourceId
      },
      ConditionExpression: 'attribute_exists(pk)'
    }));

    await createAuditLog('DELETE', config.name, userId, { resourceId });

    return createResponse(204, {});
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return createResponse(404, { error: 'Resource not found' });
    }
    console.error('Error deleting resource:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleBulkImport(event: APIGatewayEvent): Promise<APIResponse> {
  const role = extractRole(event);
  const userId = extractUserId(event);
  
  if (!hasPermission(role, 'resources', 'bulk')) {
    return createResponse(403, { error: 'Insufficient permissions' });
  }

  try {
    const tableIndex = event.pathParameters?.tableIndex;
    if (!tableIndex || !tableConfigs[tableIndex as keyof typeof tableConfigs]) {
      return createResponse(400, { error: 'Invalid table index' });
    }

    const config = tableConfigs[tableIndex as keyof typeof tableConfigs];
    const { items } = JSON.parse(event.body || '{}');
    
    if (!Array.isArray(items)) {
      return createResponse(400, { error: 'Items must be an array' });
    }

    const now = new Date().toISOString();
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process in batches of 25 (DynamoDB BatchWrite limit)
    for (let i = 0; i < items.length; i += 25) {
      const batch = items.slice(i, i + 25);
      const writeRequests = [];

      for (const item of batch) {
        try {
          const id = item[config.pk] || randomUUID();
          const processedItem = {
            ...item,
            [config.pk]: id,
            pk: `${config.name.toUpperCase()}_${id}`,
            sk: id,
            createdAt: now,
            updatedAt: now,
            createdBy: userId
          };

          writeRequests.push({
            PutRequest: {
              Item: processedItem
            }
          });
        } catch (error: any) {
          failed++;
          errors.push(`Item ${i}: ${error.message}`);
        }
      }

      if (writeRequests.length > 0) {
        try {
          const result = await docClient.send(new BatchWriteCommand({
            RequestItems: {
              [TABLE_NAME]: writeRequests
            }
          }));

          imported += writeRequests.length - (result.UnprocessedItems?.[TABLE_NAME]?.length || 0);
          
          // Handle unprocessed items
          if (result.UnprocessedItems?.[TABLE_NAME]?.length) {
            failed += result.UnprocessedItems[TABLE_NAME].length;
            errors.push(`${result.UnprocessedItems[TABLE_NAME].length} items were not processed`);
          }
        } catch (error: any) {
          failed += writeRequests.length;
          errors.push(`Batch write failed: ${error.message}`);
        }
      }
    }

    await createAuditLog('BULK_IMPORT', config.name, userId, { imported, failed, total: items.length });

    return createResponse(200, { imported, failed, errors });
  } catch (error) {
    console.error('Error in bulk import:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}

function getRequiredFields(tableName: string): string[] {
  const requiredFieldsMap: Record<string, string[]> = {
    users: ['userName', 'fullName', 'email', 'departmentId', 'approvalLevel', 'activeFlag'],
    applications: ['applicantId', 'applicationType', 'applicationTitle', 'applicationContent', 'approvalStatus', 'approvalStage', 'urgentFlag', 'hasAttachment'],
    documentTypes: ['documentTypeCode', 'documentTypeName', 'approvalStages', 'autoApprovalFlag', 'urgentApplicationFlag', 'activeFlag', 'displayOrder'],
    approvalFlows: ['documentTypeId', 'approvalFlowName', 'approvalStepNumber', 'approverId', 'requiredApprovalFlag', 'parallelApprovalFlag', 'effectiveStartDate'],
    approvalSteps: ['applicationId', 'approvalFlowDefinitionId', 'stepNumber', 'approverId', 'approvalStatus', 'requiredFlag'],
    approvalHistory: ['applicationId', 'approvalStepId', 'approverId', 'approvalResult', 'approvalDateTime', 'processOrder', 'proxyApprovalFlag'],
    approverAssignments: ['applicationId', 'approvalStepId', 'approverUserId', 'stepOrder', 'assignmentStatus', 'requiredApprovalFlag', 'activeFlag'],
    notificationHistory: ['recipientUserId', 'notificationType', 'notificationTitle', 'notificationContent', 'sendMethod', 'sendStatus', 'readFlag', 'retryCount'],
    routeChangeHistory: ['applicationId', 'newApprovalFlowId', 'newStepNumber', 'changeType', 'changeReason', 'changeExecutorId', 'changeDateTime', 'activeFlag'],
    documentClassificationRules: ['ruleName', 'documentTypeId', 'judgmentCondition', 'judgmentTargetItem', 'priority', 'activeFlag'],
    delayDetectionSettings: ['documentTypeId', 'settingName', 'warningThresholdTime', 'errorThresholdTime', 'businessDayCalculationFlag', 'notificationTargetType', 'notificationMethod', 'activeFlag']
  };
  
  return requiredFieldsMap[tableName] || [];
}

export const handler = async (event: APIGatewayEvent): Promise<APIResponse> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  try {
    const path = event.path;
    const method = event.httpMethod;

    // Handle /resources endpoint
    if (path === '/resources' && method === 'GET') {
      return await handleGetResources(event);
    }

    // Handle table-specific endpoints
    const tableMatch = path.match(/^\/api\/(\d+)(?:\/(\w+))?(?:\/(\w+))?$/);
    if (tableMatch) {
      const [, tableIndex, action, id] = tableMatch;
      
      // Set path parameters for compatibility
      event.pathParameters = {
        tableIndex,
        ...(id && { id }),
        ...(action && { action })
      };

      if (action === 'bulk' && method === 'POST') {
        return await handleBulkImport(event);
      }

      if (!action && method === 'GET') {
        return await handleGetResources(event);
      }

      if (!action && method === 'POST') {
        return await handleCreateResource(event);
      }

      if (action && action !== 'bulk' && method === 'GET') {
        event.pathParameters.id = action;
        return await handleGetResource(event);
      }

      if (action && action !== 'bulk' && method === 'PUT') {
        event.pathParameters.id = action;
        return await handleUpdateResource(event);
      }

      if (action && action !== 'bulk' && method === 'DELETE') {
        event.pathParameters.id = action;
        return await handleDeleteResource(event);
      }
    }

    return createResponse(404, { error: 'Endpoint not found' });
  } catch (error) {
    console.error('Unhandled error:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
};