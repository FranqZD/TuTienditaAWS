const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const env = require('./env');

const client = new DynamoDBClient({ region: env.AWS_REGION });

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

module.exports = {
  docClient,
  PRODUCTS_TABLE_NAME: env.PRODUCTS_TABLE_NAME,
  ORDERS_TABLE_NAME: env.ORDERS_TABLE_NAME,
};
