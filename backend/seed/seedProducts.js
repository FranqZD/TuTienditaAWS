/**
 * Seed script for Tu Tiendita — inserts sample products into Tabla_Productos.
 *
 * Usage:
 *   AWS_REGION=us-east-1 PRODUCTS_TABLE_NAME=Tabla_Productos node backend/seed/seedProducts.js
 *
 * Environment variables:
 *   AWS_REGION           — AWS region (default: us-east-1)
 *   PRODUCTS_TABLE_NAME  — DynamoDB table name (default: Tabla_Productos)
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME || 'Tabla_Productos';

const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const now = new Date().toISOString();

const sampleProducts = [
  {
    name: 'Café de Olla Artesanal',
    description: 'Café molido con canela y piloncillo, tostado artesanalmente en Oaxaca. Bolsa de 500g.',
    price: 89.50,
    stock: 40,
    imageUrl: 'https://picsum.photos/seed/cafe-olla/400/400',
  },
  {
    name: 'Salsa Macha Casera',
    description: 'Salsa macha elaborada con chile morita, cacahuate y aceite de oliva. Frasco de 250ml.',
    price: 65.00,
    stock: 25,
    imageUrl: 'https://picsum.photos/seed/salsa-macha/400/400',
  },
  {
    name: 'Chocolate Oaxaqueño',
    description: 'Tablilla de chocolate de mesa con almendra y canela, ideal para preparar chocolate caliente. 500g.',
    price: 55.00,
    stock: 60,
    imageUrl: 'https://picsum.photos/seed/chocolate-oax/400/400',
  },
  {
    name: 'Miel de Abeja Yucateca',
    description: 'Miel pura de abeja melipona recolectada en la península de Yucatán. Frasco de 350ml.',
    price: 120.00,
    stock: 15,
    imageUrl: 'https://picsum.photos/seed/miel-yucatan/400/400',
  },
  {
    name: 'Totopos de Maíz Azul',
    description: 'Totopos horneados de maíz azul criollo, sin conservadores. Bolsa de 300g.',
    price: 42.00,
    stock: 80,
    imageUrl: 'https://picsum.photos/seed/totopos-azul/400/400',
  },
  {
    name: 'Mezcal Artesanal Espadín',
    description: 'Mezcal joven de agave espadín, destilado en alambique de cobre en Santiago Matatlán. Botella de 750ml.',
    price: 450.00,
    stock: 10,
    imageUrl: 'https://picsum.photos/seed/mezcal-espadin/400/400',
  },
  {
    name: 'Cajeta de Celaya',
    description: 'Cajeta tradicional de leche de cabra, sabor original. Frasco de 400g.',
    price: 75.00,
    stock: 30,
    imageUrl: 'https://picsum.photos/seed/cajeta-celaya/400/400',
  },
];

async function seedProducts() {
  console.log(`Seeding products into table "${PRODUCTS_TABLE_NAME}" in region "${AWS_REGION}"...\n`);

  for (const product of sampleProducts) {
    const item = {
      productId: uuidv4(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await docClient.send(
        new PutCommand({
          TableName: PRODUCTS_TABLE_NAME,
          Item: item,
        })
      );
      console.log(`  ✓ Inserted: ${item.name} (${item.productId})`);
    } catch (error) {
      console.error(`  ✗ Failed to insert "${item.name}":`, error.message);
    }
  }

  console.log('\nSeed complete.');
}

seedProducts().catch((error) => {
  console.error('Seed script failed:', error.message);
  process.exit(1);
});
