# Arquitectura — Tu Tiendita

## Resumen

Tu Tiendita es un proyecto académico que demuestra una arquitectura AWS completa mediante una tienda virtual simple. El sistema se compone de cuatro componentes principales, cada uno desplegado en un servicio AWS distinto, comunicándose entre sí mediante protocolos estándar (HTTP REST y AWS SDK v3).

---

## Separación de Responsabilidades

### Frontend — React SPA en S3 / CloudFront

**Servicio AWS:** Amazon S3 (almacenamiento) + Amazon CloudFront (CDN)

El Frontend es una Single Page Application (SPA) construida con **React 19** y **Vite** como herramienta de compilación. Se compila como archivos estáticos (HTML, CSS, JS) y se aloja en un bucket de S3 configurado para hosting de sitio web estático. CloudFront actúa como CDN frente al bucket, distribuyendo el contenido con baja latencia.

**Responsabilidades:**

- Renderizar la interfaz de usuario (catálogo de productos, carrito, panel de administración)
- Gestionar el estado del carrito de compras en memoria (React Context API)
- Realizar peticiones HTTP REST al Backend para obtener y manipular datos
- Manejar la navegación del lado del cliente (React Router)
- Mostrar mensajes de error y éxito al usuario

**Estructura interna:**

| Carpeta / Archivo | Función |
|---|---|
| `src/pages/` | Páginas de la aplicación: Home, Detalle de Producto, Carrito, Admin |
| `src/components/` | Componentes reutilizables: ProductCard, CartItem, CartSummary, ProductForm, Navbar |
| `src/services/api.js` | Servicio centralizado de comunicación HTTP con el Backend |
| `src/context/CartContext.jsx` | Estado global del carrito mediante React Context |

### Backend — Express en EC2 / Elastic Beanstalk

**Servicio AWS:** AWS Elastic Beanstalk (instancias EC2 administradas)

El Backend es una API REST construida con **Node.js** y **Express**, desplegada en Elastic Beanstalk que administra automáticamente las instancias EC2 subyacentes. Actúa como intermediario entre el Frontend y los servicios AWS (DynamoDB y Lambda).

**Responsabilidades:**

- Exponer endpoints REST para operaciones CRUD de productos
- Consultar y modificar datos en DynamoDB mediante AWS SDK v3
- Invocar la función Lambda_Checkout de forma síncrona para procesar compras
- Validar datos de entrada (nombre, precio, stock, etc.)
- Manejar errores y retornar códigos HTTP apropiados (200, 201, 400, 404, 500)
- Habilitar CORS para permitir peticiones desde el Frontend

**Estructura interna:**

| Carpeta / Archivo | Función |
|---|---|
| `src/config/dynamodb.js` | Configuración del cliente DynamoDB (DynamoDBDocumentClient) |
| `src/config/env.js` | Lectura de variables de entorno |
| `src/routes/` | Definición de rutas: productos, órdenes, health |
| `src/controllers/` | Controladores que manejan las peticiones HTTP |
| `src/services/productService.js` | Operaciones CRUD contra DynamoDB (Tabla_Productos) |
| `src/services/lambdaService.js` | Invocación síncrona de Lambda_Checkout vía AWS SDK |
| `src/services/orderService.js` | Orquestación del flujo de checkout |

**Endpoints expuestos:**

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Verificación de salud del servidor |
| GET | `/api/products` | Lista de productos activos |
| GET | `/api/products/:id` | Detalle de un producto |
| POST | `/api/products` | Crear un producto nuevo |
| PUT | `/api/products/:id` | Actualizar un producto existente |
| DELETE | `/api/products/:id` | Desactivar un producto (soft delete) |
| POST | `/api/orders/checkout` | Procesar una compra simulada |

### Lambda_Checkout — Procesamiento Serverless

**Servicio AWS:** AWS Lambda (Node.js 20.x)

La función Lambda_Checkout es una función serverless que encapsula toda la lógica de procesamiento de compras. Se invoca de forma síncrona desde el Backend y se comunica directamente con DynamoDB.

**Responsabilidades:**

- Recibir el payload con los items del carrito `[{ productId, quantity }]`
- Validar que cada producto exista en la Tabla_Productos
- Validar que el stock disponible sea suficiente para cada producto
- Reducir el stock de cada producto según la cantidad comprada
- Crear un registro de orden en la Tabla_Ordenes con ID único, items, total, status y fecha
- Retornar la orden creada o un error descriptivo

**Flujo interno (3 fases):**

1. **Fase de validación:** Consulta cada producto en DynamoDB y verifica existencia y stock. Si alguna validación falla, retorna error inmediatamente sin modificar datos.
2. **Fase de actualización de stock:** Reduce el stock de cada producto mediante `UpdateCommand`.
3. **Fase de creación de orden:** Genera un UUID para la orden, calcula el total y persiste la orden en Tabla_Ordenes mediante `PutCommand`.

### DynamoDB — Persistencia de Datos

**Servicio AWS:** Amazon DynamoDB

DynamoDB es la base de datos NoSQL utilizada para almacenar toda la información persistente del sistema. Se accede desde el Backend y desde la Lambda_Checkout mediante AWS SDK v3.

**Responsabilidades:**

- Almacenar el catálogo de productos con su inventario
- Almacenar las órdenes de compra completadas
- Proveer acceso de baja latencia para lecturas y escrituras
- Soportar operaciones atómicas de actualización de stock

---

## Esquemas de Tablas DynamoDB

### Tabla_Productos

| Campo | Tipo DynamoDB | Descripción |
|---|---|---|
| `productId` | String **(Partition Key)** | Identificador único UUID del producto |
| `name` | String | Nombre del producto |
| `description` | String | Descripción del producto |
| `price` | Number | Precio del producto |
| `stock` | Number | Cantidad disponible en inventario |
| `imageUrl` | String | URL de la imagen del producto |
| `active` | Boolean | `true` = visible, `false` = eliminado (soft delete) |
| `createdAt` | String (ISO 8601) | Fecha de creación |
| `updatedAt` | String (ISO 8601) | Fecha de última actualización |

**Modo de facturación:** PAY_PER_REQUEST (bajo demanda)

### Tabla_Ordenes

| Campo | Tipo DynamoDB | Descripción |
|---|---|---|
| `orderId` | String **(Partition Key)** | Identificador único UUID de la orden |
| `items` | List | Array de objetos `{ productId, name, quantity, price }` |
| `total` | Number | Total calculado: Σ(precio × cantidad) |
| `status` | String | Estado de la orden (`"completed"`) |
| `createdAt` | String (ISO 8601) | Fecha de creación de la orden |

**Modo de facturación:** PAY_PER_REQUEST (bajo demanda)

---

## Flujo Completo de Datos

El siguiente diagrama muestra el flujo completo de una solicitud desde el usuario hasta la base de datos y de regreso:

```
Usuario → CloudFront → S3 → Frontend (React SPA) → Backend (Elastic Beanstalk/EC2) → Lambda_Checkout → DynamoDB
```

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

### Diagrama de Secuencia — Flujo de Compra Simulada

```
Usuario          Frontend            Backend (EC2/EB)      Lambda_Checkout      DynamoDB
  │                 │                      │                     │                  │
  │  Accede a la    │                      │                     │                  │
  │  tienda         │                      │                     │                  │
  │────────────────▶│                      │                     │                  │
  │                 │  GET /api/products   │                     │                  │
  │                 │─────────────────────▶│                     │                  │
  │                 │                      │  Scan (active=true) │                  │
  │                 │                      │─────────────────────────────────────▶│
  │                 │                      │◀─────────────────────────────────────│
  │                 │◀─────────────────────│  JSON productos     │                  │
  │  Ve productos   │                      │                     │                  │
  │◀────────────────│                      │                     │                  │
  │                 │                      │                     │                  │
  │  Agrega al      │                      │                     │                  │
  │  carrito        │                      │                     │                  │
  │────────────────▶│  (estado local       │                     │                  │
  │                 │   React Context)     │                     │                  │
  │                 │                      │                     │                  │
  │  Finalizar      │                      │                     │                  │
  │  compra         │                      │                     │                  │
  │────────────────▶│                      │                     │                  │
  │                 │  POST /api/orders/   │                     │                  │
  │                 │  checkout            │                     │                  │
  │                 │─────────────────────▶│                     │                  │
  │                 │                      │  Lambda.invoke()    │                  │
  │                 │                      │  (síncrono)         │                  │
  │                 │                      │────────────────────▶│                  │
  │                 │                      │                     │  GetItem (stock) │
  │                 │                      │                     │─────────────────▶│
  │                 │                      │                     │◀─────────────────│
  │                 │                      │                     │  UpdateItem      │
  │                 │                      │                     │  (reduce stock)  │
  │                 │                      │                     │─────────────────▶│
  │                 │                      │                     │  PutItem         │
  │                 │                      │                     │  (crea orden)    │
  │                 │                      │                     │─────────────────▶│
  │                 │                      │                     │◀─────────────────│
  │                 │                      │◀────────────────────│  Orden creada    │
  │                 │◀─────────────────────│  200 + datos orden  │                  │
  │  Mensaje éxito  │                      │                     │                  │
  │◀────────────────│                      │                     │                  │
```

---

## Protocolos de Comunicación entre Componentes

### Frontend ↔ Backend: HTTP REST con JSON

El Frontend se comunica con el Backend mediante peticiones HTTP estándar con cuerpos en formato JSON. El servicio centralizado `api.js` del Frontend construye las peticiones usando `fetch()` con la URL base configurada en la variable de entorno `VITE_API_BASE_URL`.

- **Protocolo:** HTTP/HTTPS
- **Formato de datos:** JSON (`Content-Type: application/json`)
- **CORS:** Habilitado en el Backend para los métodos GET, POST, PUT y DELETE
- **Manejo de errores:** El Backend retorna códigos HTTP estándar (200, 201, 400, 404, 500) con mensajes descriptivos en el cuerpo JSON

### Backend → Lambda_Checkout: AWS SDK v3 (InvokeCommand)

El Backend invoca la Lambda_Checkout de forma **síncrona** utilizando el `LambdaClient` del AWS SDK v3. El payload se envía como JSON serializado y la respuesta se decodifica del `Uint8Array` retornado por Lambda.

- **Protocolo:** AWS SDK v3 (`@aws-sdk/client-lambda`)
- **Tipo de invocación:** Síncrona (RequestResponse)
- **Comando:** `InvokeCommand` con `FunctionName` leído de la variable de entorno `LAMBDA_FUNCTION_NAME`
- **Payload de entrada:** `{ items: [{ productId, quantity }] }`
- **Payload de salida:** `{ statusCode, body }` donde `body` contiene la orden creada o un error

### Backend → DynamoDB: AWS SDK v3 (DynamoDBDocumentClient)

El Backend accede a DynamoDB mediante el `DynamoDBDocumentClient` del AWS SDK v3, que simplifica la serialización/deserialización de objetos JavaScript a formato DynamoDB.

- **Protocolo:** AWS SDK v3 (`@aws-sdk/lib-dynamodb`)
- **Cliente:** `DynamoDBDocumentClient` con `removeUndefinedValues: true`
- **Operaciones utilizadas:** `ScanCommand` (listar productos), `GetCommand` (obtener por ID), `PutCommand` (crear), `UpdateCommand` (actualizar/soft delete)
- **Tablas accedidas:** Tabla_Productos

### Lambda_Checkout → DynamoDB: AWS SDK v3 (DynamoDBDocumentClient)

La Lambda accede directamente a DynamoDB con el mismo SDK que el Backend, pero con su propia instancia del cliente.

- **Protocolo:** AWS SDK v3 (`@aws-sdk/lib-dynamodb`)
- **Cliente:** `DynamoDBDocumentClient`
- **Operaciones utilizadas:** `GetCommand` (validar producto y stock), `UpdateCommand` (reducir stock), `PutCommand` (crear orden)
- **Tablas accedidas:** Tabla_Productos y Tabla_Ordenes

---

## Resumen de Tecnologías por Componente

| Componente | Tecnología | Servicio AWS |
|---|---|---|
| Frontend | React 19, Vite, CSS | S3 + CloudFront |
| Backend | Node.js, Express, AWS SDK v3 | Elastic Beanstalk (EC2) |
| Lambda_Checkout | Node.js 20.x, AWS SDK v3 | AWS Lambda |
| Base de datos | — | Amazon DynamoDB |
