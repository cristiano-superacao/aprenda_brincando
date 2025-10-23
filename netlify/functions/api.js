const { db, initDatabase } = require('../../src/database');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { httpMethod, path, body } = event;
    const pathParts = path.split('/').filter(Boolean);
    
    // Remover 'api' do path se presente
    if (pathParts[0] === 'api') {
      pathParts.shift();
    }

    // Inicializar banco se necessário
    await initDatabase();

    switch (httpMethod) {
      case 'GET':
        if (pathParts[0] === 'products') {
          const queryParams = event.queryStringParameters || {};
          const difficulty = queryParams.difficulty;
          const products = await db.getProducts(difficulty);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(products)
          };
        }
        
        if (pathParts[0] === 'user' && pathParts[1]) {
          if (pathParts[2] === 'transactions') {
            // Buscar transações do usuário
            const transactions = await db.getUserTransactions(pathParts[1]);
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(transactions)
            };
          } else {
            // Buscar usuário
            const user = await db.getUser(pathParts[1]);
            if (!user) {
              return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Usuário não encontrado' })
              };
            }
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(user)
            };
          }
        }
        break;

      case 'POST':
        if (pathParts[0] === 'user') {
          const data = JSON.parse(body);
          const user = await db.createUser(data.name);
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify(user)
          };
        }
        
        if (pathParts[0] === 'transactions') {
          const data = JSON.parse(body);
          const transaction = await db.addTransaction(
            data.userId,
            data.type,
            data.amount,
            data.description,
            data.pointsEarned
          );
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify(transaction)
          };
        }
        break;

      case 'PUT':
        if (pathParts[0] === 'user' && pathParts[1]) {
          const data = JSON.parse(body);
          
          if (pathParts[2] === 'balance') {
            const user = await db.updateUserBalance(pathParts[1], data.balance);
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(user)
            };
          }
          
          if (pathParts[2] === 'level') {
            const user = await db.updateUserLevel(pathParts[1], data.level, data.points);
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(user)
            };
          }
        }
        break;

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint não encontrado' })
    };

  } catch (error) {
    console.error('Erro na API:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};