import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { hasPermission, validateRole, Role } from './rbac';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.MAIN_TABLE!;

interface User {
  id: string;
  userName: string;
  email: string;
  passwordHash: string;
  department: string;
  position?: string;
  permissionLevel: number;
  approvalAuthorityFlag: boolean;
  activeFlag: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ApplicationDocument {
  id: string;
  applicantId: string;
  applicationType: string;
  applicationTitle: string;
  applicationContent: string;
  applicationAmount?: number;
  applicationStartDate?: string;
  applicationEndDate?: string;
  approvalStatus: string;
  currentApproverId?: string;
  approvalStage: number;
  finalApproverId?: string;
  finalApprovalAt?: string;
  urgentFlag: boolean;
  hasAttachment: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

interface DocumentTypeMaster {
  id: string;
  documentTypeCode: string;
  documentTypeName: string;
  description?: string;
  approvalStages: number;
  autoApprovalFlag: boolean;
  urgentApplicationFlag: boolean;
  notificationSettings: string;
  displayOrder: number;
  activeFlag: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

interface ApprovalFlowDefinition {
  id: string;
  documentTypeId: string;
  approvalFlowName: string;
  approvalStepNumber: number;
  approverUserId: string;
  approverPosition?: string;
  requiredApprovalFlag: boolean;
  parallelApprovalFlag: boolean;
  proxyApprovalFlag: boolean;
  approvalDeadlineDays?: number;
  validStartDate: string;
  validEndDate?: string;
  remarks?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

interface ApprovalStep {
  id: string;
  applicationDocumentId: string;
  approvalFlowDefinitionId: string;
  stepNumber: number;
  approverId: string;
  approvalStatus: string;
  approvalAt?: string;
  approvalComment?: string;
  deadlineAt?: string;
  notificationSentAt?: string;
  proxyApproverId?: string;
  requiredFlag: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ApprovalHistory {
  id: string;
  applicationDocumentId: string;
  approvalStepId: string;
  approverId: string;
  approvalResult: string;
  approvalComment?: string;
  approvalAt: string;
  nextApproverId?: string;
  returnStepId?: string;
  approvalOrder: number;
  proxyApprovalFlag: boolean;
  originalApproverId?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationHistory {
  id: string;
  applicationDocumentId?: string;
  approvalStepId?: string;
  targetUserId: string;
  notificationType: string;
  notificationTitle: string;
  notificationContent: string;
  sendMethod: string;
  sendAddress?: string;
  sendStatus: string;
  sentAt?: string;
  readFlag: boolean;
  readAt?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ProcessingRoute {
  id: string;
  applicationDocumentId: string;
  approvalFlowDefinitionId: string;
  currentStepNumber: number;
  currentApproverId?: string;
  processingStatus: string;
  startAt: string;
  completedAt?: string;
  deadlineAt?: string;
  priority: number;
  autoProcessingFlag: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

interface DelayDetectionSetting {
  id: string;
  documentTypeId: string;
  approvalStepId?: string;
  settingName: string;
  deadlineDays: number;
  warningDays?: number;
  escalationDays?: number;
  businessDayFlag: boolean;
  activeFlag: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

interface SubsidyRelevanceMaster {
  id: string;
  subsidyRelevanceCode: string;
  subsidyRelevanceName: string;
  relevanceLevel: number;
  description?: string;
  displayOrder: number;
  activeFlag: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

const TABLE_CONFIGS = {
  '0': { pk: 'USER', name: 'users' },
  '1': { pk: 'APPLICATION_DOCUMENT', name: 'applicationDocuments' },
  '2': { pk: 'DOCUMENT_TYPE_MASTER', name: 'documentTypeMasters' },
  '3': { pk: 'APPROVAL_FLOW_DEFINITION', name: 'approvalFlowDefinitions' },
  '4': { pk: 'APPROVAL_STEP', name: 'approvalSteps' },
  '5': { pk: 'APPROVAL_HISTORY', name: 'approvalHistories' },
  '6': { pk: 'NOTIFICATION_HISTORY', name: 'notificationHistories' },
  '7': { pk: 'PROCESSING_ROUTE', name: 'processingRoutes' },
  '8': { pk: 'DELAY_DETECTION_SETTING', name: 'delayDetectionSettings' },
  '9': { pk: 'SUBSIDY_RELEVANCE_MASTER', name: 'subsidyRelevanceMasters' }
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

function getUserRole(event: APIGatewayProxyEvent): Role {
  const role = event.headers['x-user-role'] || event.headers['X-User-Role'] || 'viewer';
  return validateRole(role);
}

function getCurrentUserId(event: APIGatewayProxyEvent): string {
  return event.headers['x-user-id'] || event.headers['X-User-Id'] || 'system';
}

async function writeAuditLog(action: string, resourceType: string, resourceId: string, userId: string, details?: any): Promise<void> {
  const auditLog = {
    pk: 'AUDIT',
    sk: `${Date.now()}_${randomUUID()}`,
    action,
    resourceType,
    resourceId,
    userId,
    timestamp: new Date().toISOString(),
    details: details || {}
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: auditLog
  }));
}

function validateTableIndex(tableIndex: string): boolean {
  return tableIndex in TABLE_CONFIGS;
}

function addTimestamps(item: any, isUpdate: boolean = false): any {
  const now = new Date().toISOString();
  if (!isUpdate) {
    item.createdAt = now;
  }
  item.updatedAt = now;
  return item;
}

function addId(item: any): any {
  if (!item.id) {
    item.id = randomUUID();
  }
  return item;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const role = getUserRole(event);
    const userId = getCurrentUserId(event);
    const method = event.httpMethod;
    const path = event.path;
    const pathSegments = path.split('/').filter(segment => segment);

    if (method === 'OPTIONS') {
      return createResponse(200, {});
    }

    if (path === '/resources' && method === 'GET') {
      if (!hasPermission(role, 'read')) {
        return createResponse(403, { error: 'Insufficient permissions' });
      }

      const resources = {
        tables: Object.entries(TABLE_CONFIGS).map(([index, config]) => ({
          index,
          name: config.name,
          pk: config.pk
        })),
        endpoints: [
          'GET /resources',
          'GET /api/{tableIndex}',
          'GET /api/{tableIndex}/{id}',
          'POST /api/{tableIndex}',
          'PUT /api/{tableIndex}/{id}',
          'DELETE /api/{tableIndex}/{id}',
          'POST /api/{tableIndex}/bulk'
        ]
      };

      return createResponse(200, resources);
    }

    if (pathSegments.length >= 2 && pathSegments[0] === 'api') {
      const tableIndex = pathSegments[1];
      
      if (!validateTableIndex(tableIndex)) {
        return createResponse(404, { error: 'Table not found' });
      }

      const tableConfig = TABLE_CONFIGS[tableIndex as keyof typeof TABLE_CONFIGS];
      const resourceId = pathSegments[2];
      const isBulkOperation = pathSegments[2] === 'bulk';

      if (isBulkOperation && method === 'POST') {
        if (!hasPermission(role, 'write')) {
          return createResponse(403, { error: 'Insufficient permissions' });
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
            const processedItem = addTimestamps(addId({
              ...item,
              pk: tableConfig.pk,
              sk: item.id || randomUUID(),
              createdBy: userId,
              updatedBy: userId
            }));

            return {
              PutRequest: {
                Item: processedItem
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
            errors.push(`Batch write failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        await writeAuditLog('BULK_IMPORT', tableConfig.name, tableIndex, userId, {
          imported,
          failed,
          totalItems: items.length
        });

        return createResponse(200, { imported, failed, errors });
      }

      switch (method) {
        case 'GET':
          if (!hasPermission(role, 'read')) {
            return createResponse(403, { error: 'Insufficient permissions' });
          }

          if (resourceId) {
            const result = await docClient.send(new GetCommand({
              TableName: TABLE_NAME,
              Key: {
                pk: tableConfig.pk,
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
              FilterExpression: 'pk = :pk',
              ExpressionAttributeValues: {
                ':pk': tableConfig.pk
              }
            }));

            return createResponse(200, {
              items: result.Items || [],
              count: result.Count || 0
            });
          }

        case 'POST':
          if (!hasPermission(role, 'write')) {
            return createResponse(403, { error: 'Insufficient permissions' });
          }

          const createBody = JSON.parse(event.body || '{}');
          const newItem = addTimestamps(addId({
            ...createBody,
            pk: tableConfig.pk,
            sk: createBody.id || randomUUID(),
            createdBy: userId,
            updatedBy: userId
          }));

          await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: newItem
          }));

          await writeAuditLog('CREATE', tableConfig.name, newItem.id, userId, newItem);

          return createResponse(201, newItem);

        case 'PUT':
          if (!resourceId) {
            return createResponse(400, { error: 'Resource ID is required' });
          }

          if (!hasPermission(role, 'write')) {
            return createResponse(403, { error: 'Insufficient permissions' });
          }

          const updateBody = JSON.parse(event.body || '{}');
          const existingItem = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              pk: tableConfig.pk,
              sk: resourceId
            }
          }));

          if (!existingItem.Item) {
            return createResponse(404, { error: 'Resource not found' });
          }

          const updatedItem = addTimestamps({
            ...existingItem.Item,
            ...updateBody,
            id: resourceId,
            pk: tableConfig.pk,
            sk: resourceId,
            updatedBy: userId
          }, true);

          await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: updatedItem
          }));

          await writeAuditLog('UPDATE', tableConfig.name, resourceId, userId, {
            before: existingItem.Item,
            after: updatedItem
          });

          return createResponse(200, updatedItem);

        case 'DELETE':
          if (!resourceId) {
            return createResponse(400, { error: 'Resource ID is required' });
          }

          if (!hasPermission(role, 'delete')) {
            return createResponse(403, { error: 'Insufficient permissions' });
          }

          const itemToDelete = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              pk: tableConfig.pk,
              sk: resourceId
            }
          }));

          if (!itemToDelete.Item) {
            return createResponse(404, { error: 'Resource not found' });
          }

          await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
              pk: tableConfig.pk,
              sk: resourceId
            }
          }));

          await writeAuditLog('DELETE', tableConfig.name, resourceId, userId, itemToDelete.Item);

          return createResponse(200, { message: 'Resource deleted successfully' });

        default:
          return createResponse(405, { error: 'Method not allowed' });
      }
    }

    return createResponse(404, { error: 'Endpoint not found' });

  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid role')) {
        return createResponse(400, { error: 'Invalid role specified' });
      }
      if (error.message.includes('ValidationException')) {
        return createResponse(400, { error: 'Invalid request data' });
      }
    }

    return createResponse(500, { error: 'Internal server error' });
  }
};