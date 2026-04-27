const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const region = process.env.AWS_REGION || "us-east-1";
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE_NAME || "Tabla_Productos";
const ORDERS_TABLE = process.env.ORDERS_TABLE_NAME || "Tabla_Ordenes";

const client = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Lambda handler for processing checkout orders.
 *
 * Expects event payload: { items: [{ productId, quantity }] }
 * Returns: { statusCode, body }
 */
exports.handler = async (event) => {
  try {
    const items = event.items;

    // Validate payload: items array must exist and not be empty
    if (!Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        body: { error: "El carrito no puede estar vacío" },
      };
    }

    // Phase 1: Validate all items (existence and stock) before any writes
    const validatedItems = [];

    for (const item of items) {
      const { productId, quantity } = item;

      // Fetch product from DynamoDB
      const getResult = await docClient.send(
        new GetCommand({
          TableName: PRODUCTS_TABLE,
          Key: { productId },
        })
      );

      const product = getResult.Item;

      // Validate product exists
      if (!product) {
        return {
          statusCode: 400,
          body: { error: `Producto no encontrado: ${productId}` },
        };
      }

      // Validate sufficient stock
      if (product.stock < quantity) {
        return {
          statusCode: 400,
          body: { error: `Stock insuficiente para: ${product.name}` },
        };
      }

      validatedItems.push({
        productId,
        name: product.name,
        quantity,
        price: product.price,
        currentStock: product.stock,
      });
    }

    // Phase 2: All validations passed — reduce stock for each product
    for (const item of validatedItems) {
      await docClient.send(
        new UpdateCommand({
          TableName: PRODUCTS_TABLE,
          Key: { productId: item.productId },
          UpdateExpression: "SET stock = stock - :qty",
          ExpressionAttributeValues: {
            ":qty": item.quantity,
          },
        })
      );
    }

    // Phase 3: Create order in Tabla_Ordenes
    const orderId = uuidv4();
    const createdAt = new Date().toISOString();
    const total = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderItems = validatedItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const order = {
      orderId,
      items: orderItems,
      total,
      status: "completed",
      createdAt,
    };

    await docClient.send(
      new PutCommand({
        TableName: ORDERS_TABLE,
        Item: order,
      })
    );

    // Return success with order data
    return {
      statusCode: 200,
      body: order,
    };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      statusCode: 500,
      body: { error: "Error interno al procesar la orden" },
    };
  }
};
