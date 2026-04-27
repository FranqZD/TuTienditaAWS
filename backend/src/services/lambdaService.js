const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
const env = require('../config/env');

const lambdaClient = new LambdaClient({ region: env.AWS_REGION });

/**
 * Invoke the Lambda_Checkout function synchronously.
 * @param {object} payload - The event payload to send to Lambda (e.g. { items: [{ productId, quantity }] })
 * @returns {Promise<object>} Parsed Lambda response with statusCode and body
 * @throws {Error} If Lambda invocation fails or response cannot be parsed
 */
async function invokeCheckout(payload) {
  const command = new InvokeCommand({
    FunctionName: env.LAMBDA_FUNCTION_NAME,
    Payload: JSON.stringify(payload),
  });

  let response;
  try {
    response = await lambdaClient.send(command);
  } catch (err) {
    const error = new Error('Error al invocar la función Lambda de checkout');
    error.cause = err;
    throw error;
  }

  // Lambda response Payload is a Uint8Array — decode to string then parse as JSON
  const responsePayload = JSON.parse(
    new TextDecoder('utf-8').decode(response.Payload)
  );

  // Check for Lambda-level errors (function error, not application-level)
  if (response.FunctionError) {
    const error = new Error('La función Lambda retornó un error');
    error.functionError = response.FunctionError;
    error.payload = responsePayload;
    throw error;
  }

  return responsePayload;
}

module.exports = { invokeCheckout };
