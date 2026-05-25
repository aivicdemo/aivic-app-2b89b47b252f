const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path;
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};
    const queryParams = event.queryStringParameters || {};

    // ログイン認証
    if (path === '/api/auth/login' && method === 'POST') {
      const { userId, password } = body;
      
      // アカウントロック状態をチェック
      const lockKey = `lock_${userId}`;
      const lockData = await getLockStatus(lockKey);
      
      if (lockData && lockData.locked) {
        return {
          statusCode: 423,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'アカウントがロックされています。管理者にお問い合わせください。',
            locked: true
          })
        };
      }
      
      // ユーザー認証
      const user = await authenticateUser(userId, password);
      
      if (user) {
        // ログイン成功時はロック情報をクリア
        await clearLockStatus(lockKey);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            user: { id: user.id, name: user.name, role: user.role },
            token: generateToken(user)
          })
        };
      } else {
        // ログイン失敗時は試行回数を増加
        const attempts = await incrementFailedAttempts(lockKey);
        
        if (attempts >= 5) {
          await lockAccount(lockKey);
          return {
            statusCode: 423,
            headers,
            body: JSON.stringify({ 
              success: false, 
              message: 'パスワードを5回連続で間違えたため、アカウントがロックされました。',
              locked: true
            })
          };
        }
        
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'ユーザーIDまたはパスワードが正しくありません',
            attemptsRemaining: 5 - attempts
          })
        };
      }
    }

    // ファイルアップロード
    if (path === '/api/documents/upload' && method === 'POST') {
      const { fileName, fileContent, fileType } = body;
      
      // 文書種別自動判別
      const documentType = await detectDocumentType(fileName, fileContent);
      
      const documentId = generateId();
      const document = {
        id: documentId,
        fileName,
        fileType,
        documentType,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      };
      
      await saveDocument(document);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          document,
          detectedType: documentType
        })
      };
    }

    // 申請登録
    if (path === '/api/applications' && method === 'POST') {
      const { title, description, documentType, urgency, amount } = body;
      
      const applicationId = generateId();
      const application = {
        id: applicationId,
        title,
        description,
        documentType,
        urgency,
        amount,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        approvalFlow: determineApprovalFlow(documentType, urgency)
      };
      
      await saveApplication(application);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          application,
          applicationId
        })
      };
    }

    // 申請一覧取得
    if (path === '/api/applications' && method === 'GET') {
      const applications = await getApplications();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, applications })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, message: 'Not Found' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Internal Server Error', error: error.message })
    };
  }
};

// ヘルパー関数
async function authenticateUser(userId, password) {
  const params = {
    TableName: 'Users',
    Key: { id: userId }
  };
  
  try {
    const result = await dynamodb.get(params).promise();
    const user = result.Item;
    
    if (user && user.password === password) {
      return user;
    }
    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

async function getLockStatus(lockKey) {
  const params = {
    TableName: 'AccountLocks',
    Key: { id: lockKey }
  };
  
  try {
    const result = await dynamodb.get(params).promise();
    return result.Item;
  } catch (error) {
    return null;
  }
}

async function incrementFailedAttempts(lockKey) {
  const params = {
    TableName: 'AccountLocks',
    Key: { id: lockKey },
    UpdateExpression: 'ADD attempts :inc SET lastAttempt = :now',
    ExpressionAttributeValues: {
      ':inc': 1,
      ':now': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  };
  
  try {
    const result = await dynamodb.update(params).promise();
    return result.Attributes.attempts || 1;
  } catch (error) {
    return 1;
  }
}

async function lockAccount(lockKey) {
  const params = {
    TableName: 'AccountLocks',
    Key: { id: lockKey },
    UpdateExpression: 'SET locked = :locked, lockedAt = :now',
    ExpressionAttributeValues: {
      ':locked': true,
      ':now': new Date().toISOString()
    }
  };
  
  await dynamodb.update(params).promise();
}

async function clearLockStatus(lockKey) {
  const params = {
    TableName: 'AccountLocks',
    Key: { id: lockKey }
  };
  
  try {
    await dynamodb.delete(params).promise();
  } catch (error) {
    // エラーは無視
  }
}

async function detectDocumentType(fileName, fileContent) {
  // 簡単な文書種別判別ロジック
  const lowerFileName = fileName.toLowerCase();
  
  if (lowerFileName.includes('申請') || lowerFileName.includes('application')) {
    return 'application';
  }
  if (lowerFileName.includes('報告') || lowerFileName.includes('report')) {
    return 'report';
  }
  if (lowerFileName.includes('契約') || lowerFileName.includes('contract')) {
    return 'contract';
  }
  
  return 'general';
}

function determineApprovalFlow(documentType, urgency) {
  if (urgency === 'urgent') {
    return {
      type: 'expedited',
      approvers: ['manager'],
      parallel: true
    };
  }
  
  return {
    type: 'standard',
    approvers: ['supervisor', 'manager', 'director'],
    parallel: false
  };
}

async function saveDocument(document) {
  const params = {
    TableName: 'Documents',
    Item: document
  };
  
  await dynamodb.put(params).promise();
}

async function saveApplication(application) {
  const params = {
    TableName: 'Applications',
    Item: application
  };
  
  await dynamodb.put(params).promise();
}

async function getApplications() {
  const params = {
    TableName: 'Applications'
  };
  
  try {
    const result = await dynamodb.scan(params).promise();
    return result.Items || [];
  } catch (error) {
    return [];
  }
}

function generateToken(user) {
  return Buffer.from(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 })).toString('base64');
}

function generateId() {
  return 'APP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}