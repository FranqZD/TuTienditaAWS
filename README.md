# 🛒 Tu Tiendita

Proyecto académico que demuestra una arquitectura AWS completa mediante una tienda virtual simple y funcional. La aplicación permite a los usuarios explorar productos, gestionar un carrito de compras, simular una compra con reducción de inventario, y administrar productos desde un panel básico.

El enfoque del proyecto es la **simplicidad y claridad arquitectónica**, no la complejidad de un e-commerce real. No se implementa autenticación, pagos reales ni servicios innecesarios.

---

## 📐 Arquitectura AWS

El proyecto utiliza los siguientes servicios de AWS:

| Componente | Servicio AWS | Descripción |
|---|---|---|
| **Frontend** | S3 + CloudFront | SPA React/Vite servida como archivos estáticos |
| **Backend** | Elastic Beanstalk (EC2) | API REST Node.js/Express |
| **Lambda Checkout** | AWS Lambda | Función serverless para procesar compras |
| **Base de datos** | DynamoDB | Tablas Tabla_Productos y Tabla_Ordenes |

### Diagrama de Arquitectura

```
┌──────────┐       ┌────────────┐       ┌─────────────────┐
│          │       │            │       │   S3 Bucket     │
│ Usuario  │──────▶│ CloudFront │──────▶│  (Frontend      │
│          │       │   (CDN)    │       │   React/Vite)   │
└──────────┘       └────────────┘       └─────────────────┘
                                                │
                                                │ HTTP REST (JSON)
                                                ▼
                                    ┌───────────────────────┐
                                    │   Elastic Beanstalk   │
                                    │   (EC2)               │
                                    │                       │
                                    │   Backend             │
                                    │   Node.js / Express   │
                                    └───────┬───────┬───────┘
                                            │       │
                              AWS SDK v3    │       │  AWS SDK v3
                            (DynamoDB)      │       │  (Lambda.invoke)
                                            │       │
                                            ▼       ▼
                              ┌──────────┐   ┌──────────────────┐
                              │          │   │                  │
                              │ DynamoDB │◀──│  Lambda_Checkout  │
                              │          │   │  (Node.js 20.x)  │
                              └──────────┘   └──────────────────┘
                              │          │
                     ┌────────┘          └────────┐
                     ▼                            ▼
            ┌─────────────────┐         ┌─────────────────┐
            │ Tabla_Productos │         │  Tabla_Ordenes  │
            │ PK: productId   │         │  PK: orderId    │
            └─────────────────┘         └─────────────────┘
```

### Flujo de Datos

1. El **Usuario** accede a la aplicación a través de **CloudFront**, que sirve los archivos estáticos desde **S3**.
2. El **Frontend** (React SPA) realiza peticiones HTTP REST al **Backend** (Express en Elastic Beanstalk).
3. El **Backend** consulta y gestiona productos directamente en **DynamoDB** usando AWS SDK v3.
4. Al finalizar una compra, el **Backend** invoca la **Lambda_Checkout** de forma síncrona.
5. La **Lambda_Checkout** valida stock, reduce inventario y crea la orden en **DynamoDB**.
6. La respuesta fluye de regreso: Lambda → Backend → Frontend → Usuario.

---

## 📁 Estructura del Proyecto

```
tu-tiendita/
├── frontend/                  # React SPA (Vite)
│   ├── public/                # Archivos estáticos (favicon, iconos)
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── CartItem.jsx
│   │   │   ├── CartSummary.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductForm.jsx
│   │   ├── pages/             # Páginas de la aplicación
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── services/          # Servicio API centralizado
│   │   │   └── api.js
│   │   ├── context/           # Estado global del carrito
│   │   │   └── CartContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # API REST Node.js/Express
│   ├── src/
│   │   ├── config/            # Configuración de DynamoDB y env
│   │   │   ├── dynamodb.js
│   │   │   └── env.js
│   │   ├── controllers/       # Controladores de endpoints
│   │   │   ├── healthController.js
│   │   │   ├── orderController.js
│   │   │   └── productController.js
│   │   ├── routes/            # Definición de rutas
│   │   │   ├── healthRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── productRoutes.js
│   │   ├── services/          # Capa de servicios (DynamoDB, Lambda)
│   │   │   ├── lambdaService.js
│   │   │   ├── orderService.js
│   │   │   └── productService.js
│   │   └── app.js             # Configuración de Express
│   ├── seed/
│   │   └── seedProducts.js    # Script para datos de ejemplo
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Punto de entrada
│
├── lambda/
│   └── checkout/              # Función Lambda para checkout
│       ├── index.js           # Handler de la Lambda
│       └── package.json
│
├── docs/                      # Documentación del proyecto
│   ├── architecture.md
│   └── deployment-guide.md
│
└── README.md
```

---

## 🚀 Ejecución Local

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- Cuenta de AWS con acceso a DynamoDB (o tablas ya creadas)
- AWS CLI configurado con credenciales válidas (`aws configure`)

### Frontend

```bash
cd frontend
npm install
```

Crea el archivo de variables de entorno:

```bash
cp .env.example .env
```

Edita `frontend/.env` con la URL del backend local:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`.

### Backend

```bash
cd backend
npm install
```

Crea el archivo de variables de entorno:

```bash
cp .env.example .env
```

Edita `backend/.env` con tu configuración de AWS:

```env
AWS_REGION=us-east-1
PRODUCTS_TABLE_NAME=Tabla_Productos
ORDERS_TABLE_NAME=Tabla_Ordenes
LAMBDA_FUNCTION_NAME=Lambda_Checkout
PORT=3000
```

> **Nota:** Las credenciales de AWS se leen automáticamente desde tu configuración local de AWS CLI (`~/.aws/credentials`) o desde las variables de entorno `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`.

Inicia el servidor:

```bash
npm start
```

Para desarrollo con recarga automática:

```bash
npm run dev
```

El backend estará disponible en `http://localhost:3000`.

### Cargar Datos de Ejemplo

Una vez que las tablas de DynamoDB estén creadas y el backend configurado, ejecuta el script de seed para insertar productos de ejemplo:

```bash
cd backend
npm run seed
```

Esto insertará al menos 5 productos de ejemplo en la Tabla_Productos con todos sus campos completos.

---

## ☁️ Despliegue en AWS

### 1. Crear Tablas en DynamoDB

Crea las dos tablas requeridas en la consola de AWS o mediante AWS CLI:

**Tabla_Productos:**

```bash
aws dynamodb create-table \
  --table-name Tabla_Productos \
  --attribute-definitions AttributeName=productId,AttributeType=S \
  --key-schema AttributeName=productId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

**Tabla_Ordenes:**

```bash
aws dynamodb create-table \
  --table-name Tabla_Ordenes \
  --attribute-definitions AttributeName=orderId,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

Esquema de claves:

| Tabla | Partition Key | Tipo |
|---|---|---|
| Tabla_Productos | `productId` | String |
| Tabla_Ordenes | `orderId` | String |

### 2. Desplegar Lambda_Checkout

1. Instala las dependencias de la Lambda:

```bash
cd lambda/checkout
npm install
```

2. Crea un archivo ZIP con el contenido:

```bash
zip -r lambda-checkout.zip index.js package.json node_modules/
```

3. Crea la función Lambda en AWS:

```bash
aws lambda create-function \
  --function-name Lambda_Checkout \
  --runtime nodejs20.x \
  --handler index.handler \
  --zip-file fileb://lambda-checkout.zip \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/YOUR_LAMBDA_ROLE \
  --environment Variables="{AWS_REGION=us-east-1,PRODUCTS_TABLE_NAME=Tabla_Productos,ORDERS_TABLE_NAME=Tabla_Ordenes}" \
  --timeout 30 \
  --memory-size 128 \
  --region us-east-1
```

> **Nota:** El rol IAM de la Lambda necesita permisos para `dynamodb:GetItem`, `dynamodb:PutItem` y `dynamodb:UpdateItem` sobre ambas tablas.

Para actualizar el código de una Lambda existente:

```bash
aws lambda update-function-code \
  --function-name Lambda_Checkout \
  --zip-file fileb://lambda-checkout.zip \
  --region us-east-1
```

### 3. Desplegar Backend en Elastic Beanstalk

1. Instala el CLI de Elastic Beanstalk:

```bash
pip install awsebcli
```

2. Inicializa el entorno desde la carpeta del backend:

```bash
cd backend
eb init tu-tiendita-backend --platform "Node.js 20" --region us-east-1
```

3. Crea el entorno:

```bash
eb create tu-tiendita-backend-env
```

4. Configura las variables de entorno:

```bash
eb setenv \
  AWS_REGION=us-east-1 \
  PRODUCTS_TABLE_NAME=Tabla_Productos \
  ORDERS_TABLE_NAME=Tabla_Ordenes \
  LAMBDA_FUNCTION_NAME=Lambda_Checkout \
  PORT=8080
```

> **Nota:** En Elastic Beanstalk el puerto por defecto es 8080. Asegúrate de que el rol de la instancia EC2 tenga permisos para DynamoDB y Lambda.

5. Para desplegar actualizaciones:

```bash
eb deploy
```

### 4. Desplegar Frontend en S3

1. Compila el frontend para producción:

```bash
cd frontend
VITE_API_BASE_URL=https://tu-backend-url.elasticbeanstalk.com npm run build
```

2. Crea un bucket S3 para hosting estático:

```bash
aws s3 mb s3://tu-tiendita-frontend --region us-east-1
```

3. Configura el bucket para hosting de sitio web estático:

```bash
aws s3 website s3://tu-tiendita-frontend \
  --index-document index.html \
  --error-document index.html
```

4. Sube los archivos compilados:

```bash
aws s3 sync frontend/dist/ s3://tu-tiendita-frontend --delete
```

### 5. Configurar CloudFront

1. Crea una distribución de CloudFront apuntando al bucket S3:

```bash
aws cloudfront create-distribution \
  --origin-domain-name tu-tiendita-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

2. Configura una regla de error personalizada para que las rutas del SPA funcionen correctamente:
   - Código de error: 403 y 404
   - Página de respuesta: `/index.html`
   - Código de respuesta: 200

3. (Opcional) Asocia un dominio personalizado y un certificado SSL mediante AWS Certificate Manager.

> **Nota:** Después de crear la distribución, actualiza la variable `VITE_API_BASE_URL` en el frontend si es necesario y vuelve a compilar y subir.

---

## 🔧 Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `AWS_REGION` | Región de AWS | `us-east-1` |
| `PRODUCTS_TABLE_NAME` | Nombre de la tabla de productos en DynamoDB | `Tabla_Productos` |
| `ORDERS_TABLE_NAME` | Nombre de la tabla de órdenes en DynamoDB | `Tabla_Ordenes` |
| `LAMBDA_FUNCTION_NAME` | Nombre de la función Lambda de checkout | `Lambda_Checkout` |
| `PORT` | Puerto del servidor Express | `3000` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del Backend API | `http://localhost:3000` |

### Lambda Checkout

| Variable | Descripción | Ejemplo |
|---|---|---|
| `AWS_REGION` | Región de AWS | `us-east-1` |
| `PRODUCTS_TABLE_NAME` | Nombre de la tabla de productos en DynamoDB | `Tabla_Productos` |
| `ORDERS_TABLE_NAME` | Nombre de la tabla de órdenes en DynamoDB | `Tabla_Ordenes` |

---

## 🛍️ Flujo de Compra Simulada

El flujo de compra simulada es el proceso central de la aplicación. Demuestra la integración entre todos los componentes de la arquitectura AWS:

### Paso a paso

1. **Explorar productos:** El usuario navega la página principal donde se muestran los productos activos obtenidos desde DynamoDB a través del Backend.

2. **Agregar al carrito:** El usuario agrega productos al carrito presionando el botón "Agregar al carrito". El carrito se gestiona enteramente en el estado local de React (Context API) — no se persiste en el backend.

3. **Revisar el carrito:** El usuario accede a la página del carrito donde puede:
   - Ver los productos seleccionados con sus cantidades
   - Incrementar o decrementar cantidades (+/-)
   - Eliminar productos individuales
   - Ver el total acumulado (suma de precio × cantidad)

4. **Finalizar compra:** Al presionar "Finalizar compra", el Frontend envía el contenido del carrito al Backend mediante `POST /api/orders/checkout`.

5. **Procesamiento en Backend:** El Backend recibe la solicitud e invoca la **Lambda_Checkout** de forma síncrona pasando los items del carrito como payload.

6. **Validación en Lambda:** La Lambda_Checkout ejecuta las siguientes validaciones:
   - Verifica que cada producto exista en la Tabla_Productos
   - Verifica que el stock disponible sea suficiente para cada producto
   - Si alguna validación falla, retorna un error descriptivo sin modificar datos

7. **Procesamiento exitoso:** Si todas las validaciones pasan:
   - Reduce el stock de cada producto en la Tabla_Productos según la cantidad comprada
   - Crea un registro de orden en la Tabla_Ordenes con un ID único, los items, el total calculado, status "completed" y la fecha de creación
   - Retorna los datos de la orden creada

8. **Respuesta al usuario:**
   - **Éxito:** El Frontend muestra un mensaje de confirmación y vacía el carrito
   - **Error:** El Frontend muestra el mensaje de error y mantiene el carrito intacto para que el usuario pueda reintentar

### Diagrama del flujo

```
Usuario                Frontend              Backend               Lambda              DynamoDB
  │                      │                     │                     │                    │
  │  Navega tienda       │                     │                     │                    │
  │─────────────────────▶│  GET /api/products   │                     │                    │
  │                      │────────────────────▶│  Scan (active=true)  │                    │
  │                      │                     │────────────────────────────────────────▶│
  │                      │                     │◀────────────────────────────────────────│
  │                      │◀────────────────────│                     │                    │
  │  Ve productos        │                     │                     │                    │
  │◀─────────────────────│                     │                     │                    │
  │                      │                     │                     │                    │
  │  Agrega al carrito   │                     │                     │                    │
  │─────────────────────▶│  (estado local)     │                     │                    │
  │                      │                     │                     │                    │
  │  Finalizar compra    │                     │                     │                    │
  │─────────────────────▶│  POST /checkout     │                     │                    │
  │                      │────────────────────▶│  Lambda.invoke()    │                    │
  │                      │                     │───────────────────▶│  Valida stock       │
  │                      │                     │                     │───────────────────▶│
  │                      │                     │                     │◀───────────────────│
  │                      │                     │                     │  Reduce stock       │
  │                      │                     │                     │───────────────────▶│
  │                      │                     │                     │  Crea orden         │
  │                      │                     │                     │───────────────────▶│
  │                      │                     │                     │◀───────────────────│
  │                      │                     │◀───────────────────│  Orden creada       │
  │                      │◀────────────────────│                     │                    │
  │  Mensaje de éxito    │                     │                     │                    │
  │◀─────────────────────│                     │                     │                    │
```

---

## 🧪 Tests

El proyecto utiliza **Vitest** como test runner y **fast-check** para tests basados en propiedades.

### Ejecutar tests del Backend

```bash
cd backend
npm test
```

### Ejecutar tests de la Lambda

```bash
cd lambda/checkout
npm test
```

### Ejecutar tests del Frontend

```bash
cd frontend
npm test
```

---

## 📚 Documentación Adicional

- [Arquitectura del proyecto](docs/architecture.md) — Separación de responsabilidades y flujo completo entre componentes.
- [Guía de despliegue](docs/deployment-guide.md) — Pasos detallados para desplegar cada componente en AWS.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
|---|---|
| React 19 | Frontend SPA |
| Vite | Build tool y dev server del frontend |
| Node.js | Runtime del backend y Lambda |
| Express | Framework HTTP del backend |
| AWS SDK v3 | Comunicación con DynamoDB y Lambda |
| DynamoDB | Base de datos NoSQL |
| AWS Lambda | Procesamiento serverless de checkout |
| Elastic Beanstalk | Hosting del backend (EC2 administrado) |
| S3 | Hosting de archivos estáticos del frontend |
| CloudFront | CDN para distribución del frontend |
