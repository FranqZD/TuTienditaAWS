# Guía de Despliegue — Tu Tiendita

Esta guía detalla paso a paso cómo desplegar cada componente de Tu Tiendita en AWS. Está diseñada para un proyecto académico y asume que ya tienes una cuenta de AWS activa con acceso a la consola y al AWS CLI.

> **Referencia:** Consulta [docs/architecture.md](architecture.md) para entender la arquitectura completa y la comunicación entre componentes.

---

## Tabla de Contenidos

1. [Prerrequisitos](#1-prerrequisitos)
2. [Paso 1 — Crear tablas en DynamoDB](#2-paso-1--crear-tablas-en-dynamodb)
3. [Paso 2 — Desplegar Lambda_Checkout](#3-paso-2--desplegar-lambda_checkout)
4. [Paso 3 — Desplegar Backend en Elastic Beanstalk](#4-paso-3--desplegar-backend-en-elastic-beanstalk)
5. [Paso 4 — Desplegar Frontend en S3](#5-paso-4--desplegar-frontend-en-s3)
6. [Paso 5 — Configurar CloudFront](#6-paso-5--configurar-cloudfront)
7. [Verificación final](#7-verificación-final)
8. [Limpieza de recursos](#8-limpieza-de-recursos)

---

## 1. Prerrequisitos

### Herramientas necesarias

- **AWS CLI v2** instalado y configurado (`aws configure`)
- **Node.js v18+** instalado
- **npm** (incluido con Node.js)
- **EB CLI** (Elastic Beanstalk CLI) — se instala con `pip install awsebcli`
- **zip** — utilidad de línea de comandos para crear archivos ZIP

### Configurar AWS CLI

```bash
aws configure
```

Ingresa tu Access Key ID, Secret Access Key, región (`us-east-1`) y formato de salida (`json`).

### Verificar configuración

```bash
aws sts get-caller-identity
```

Deberías ver tu Account ID y ARN de usuario. Anota el **Account ID** — lo necesitarás más adelante.

```bash
# Guarda tu Account ID en una variable para usarlo en los comandos
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-east-1
echo "Account ID: $AWS_ACCOUNT_ID"
echo "Región: $AWS_REGION"
```

---

## 2. Paso 1 — Crear tablas en DynamoDB

DynamoDB es la base de datos del proyecto. Se necesitan dos tablas: una para productos y otra para órdenes.

### Permisos IAM requeridos

El usuario o rol que ejecute estos comandos necesita los siguientes permisos:

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:CreateTable",
    "dynamodb:DescribeTable",
    "dynamodb:PutItem",
    "dynamodb:Scan"
  ],
  "Resource": [
    "arn:aws:dynamodb:us-east-1:*:table/Tabla_Productos",
    "arn:aws:dynamodb:us-east-1:*:table/Tabla_Ordenes"
  ]
}
```

### 2.1 Crear Tabla_Productos

```bash
aws dynamodb create-table \
  --table-name Tabla_Productos \
  --attribute-definitions AttributeName=productId,AttributeType=S \
  --key-schema AttributeName=productId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### 2.2 Crear Tabla_Ordenes

```bash
aws dynamodb create-table \
  --table-name Tabla_Ordenes \
  --attribute-definitions AttributeName=orderId,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### 2.3 Verificar que las tablas estén activas

Espera unos segundos y verifica el estado de cada tabla:

```bash
aws dynamodb describe-table \
  --table-name Tabla_Productos \
  --query "Table.TableStatus" \
  --output text \
  --region $AWS_REGION
```

```bash
aws dynamodb describe-table \
  --table-name Tabla_Ordenes \
  --query "Table.TableStatus" \
  --output text \
  --region $AWS_REGION
```

Ambos comandos deben retornar `ACTIVE`.

### 2.4 Cargar datos de ejemplo (opcional)

Una vez creadas las tablas, puedes cargar productos de ejemplo:

```bash
cd backend
npm install
```

Crea un archivo `.env` con la configuración:

```bash
cp .env.example .env
```

Edita `backend/.env` y asegúrate de que las variables apunten a tus tablas:

```env
AWS_REGION=us-east-1
PRODUCTS_TABLE_NAME=Tabla_Productos
ORDERS_TABLE_NAME=Tabla_Ordenes
LAMBDA_FUNCTION_NAME=Lambda_Checkout
PORT=3000
```

Ejecuta el script de seed:

```bash
npm run seed
```

Verifica que los productos se insertaron:

```bash
aws dynamodb scan \
  --table-name Tabla_Productos \
  --select COUNT \
  --region $AWS_REGION
```

Deberías ver un `Count` de al menos 5.

### Resumen de esquemas

| Tabla | Partition Key | Tipo | Modo de facturación |
|---|---|---|---|
| `Tabla_Productos` | `productId` | String | PAY_PER_REQUEST |
| `Tabla_Ordenes` | `orderId` | String | PAY_PER_REQUEST |

---

## 3. Paso 2 — Desplegar Lambda_Checkout

La función Lambda procesa las compras simuladas: valida stock, reduce inventario y crea órdenes en DynamoDB.

### Permisos IAM requeridos para la Lambda

Necesitas crear un rol IAM que la Lambda asumirá al ejecutarse. Este rol necesita:

1. **Política de confianza** (trust policy) para que Lambda pueda asumir el rol
2. **Permisos de DynamoDB** para leer y escribir en ambas tablas
3. **Permisos de CloudWatch Logs** para escribir logs

#### 3.1 Crear la política de confianza

Crea un archivo `lambda-trust-policy.json`:

```bash
cat > lambda-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
```

#### 3.2 Crear el rol IAM

```bash
aws iam create-role \
  --role-name TuTiendita-Lambda-Role \
  --assume-role-policy-document file://lambda-trust-policy.json \
  --description "Rol para Lambda_Checkout de Tu Tiendita"
```

#### 3.3 Crear la política de permisos de DynamoDB

Crea un archivo `lambda-dynamodb-policy.json`:

```bash
cat > lambda-dynamodb-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT_ID}:table/Tabla_Productos",
        "arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT_ID}:table/Tabla_Ordenes"
      ]
    }
  ]
}
EOF
```

```bash
aws iam put-role-policy \
  --role-name TuTiendita-Lambda-Role \
  --policy-name TuTiendita-Lambda-DynamoDB \
  --policy-document file://lambda-dynamodb-policy.json
```

#### 3.4 Adjuntar política de logs de CloudWatch

```bash
aws iam attach-role-policy \
  --role-name TuTiendita-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

#### 3.5 Esperar a que el rol se propague

Los roles IAM tardan unos segundos en propagarse. Espera al menos 10 segundos:

```bash
echo "Esperando 10 segundos para propagación del rol IAM..."
sleep 10
```

#### 3.6 Instalar dependencias y crear el paquete ZIP

```bash
cd lambda/checkout
npm install
```

Crea el archivo ZIP con el código y las dependencias:

```bash
zip -r lambda-checkout.zip index.js package.json node_modules/
```

#### 3.7 Crear la función Lambda

```bash
aws lambda create-function \
  --function-name Lambda_Checkout \
  --runtime nodejs20.x \
  --handler index.handler \
  --zip-file fileb://lambda-checkout.zip \
  --role arn:aws:iam::${AWS_ACCOUNT_ID}:role/TuTiendita-Lambda-Role \
  --environment "Variables={AWS_REGION=${AWS_REGION},PRODUCTS_TABLE_NAME=Tabla_Productos,ORDERS_TABLE_NAME=Tabla_Ordenes}" \
  --timeout 30 \
  --memory-size 128 \
  --region $AWS_REGION
```

#### 3.8 Verificar el despliegue de la Lambda

```bash
aws lambda get-function \
  --function-name Lambda_Checkout \
  --query "Configuration.[FunctionName,Runtime,State]" \
  --output table \
  --region $AWS_REGION
```

Deberías ver el estado `Active`.

Prueba la Lambda con un payload de prueba (esto fallará si no hay productos, pero confirma que la Lambda se ejecuta):

```bash
aws lambda invoke \
  --function-name Lambda_Checkout \
  --payload '{"items":[]}' \
  --cli-binary-format raw-in-base64-out \
  response.json \
  --region $AWS_REGION

cat response.json
```

Deberías ver: `{"statusCode":400,"body":{"error":"El carrito no puede estar vacío"}}`

#### 3.9 Actualizar la Lambda (para futuros cambios)

Si necesitas actualizar el código de la Lambda después del despliegue inicial:

```bash
cd lambda/checkout
zip -r lambda-checkout.zip index.js package.json node_modules/

aws lambda update-function-code \
  --function-name Lambda_Checkout \
  --zip-file fileb://lambda-checkout.zip \
  --region $AWS_REGION
```

#### Limpieza de archivos temporales

```bash
rm -f lambda-trust-policy.json lambda-dynamodb-policy.json response.json
```

### Variables de entorno de la Lambda

| Variable | Valor | Descripción |
|---|---|---|
| `AWS_REGION` | `us-east-1` | Región de AWS |
| `PRODUCTS_TABLE_NAME` | `Tabla_Productos` | Nombre de la tabla de productos |
| `ORDERS_TABLE_NAME` | `Tabla_Ordenes` | Nombre de la tabla de órdenes |

---

## 4. Paso 3 — Desplegar Backend en Elastic Beanstalk

El Backend es una API REST con Node.js/Express que se despliega en Elastic Beanstalk, el cual administra automáticamente las instancias EC2.

### Permisos IAM requeridos para la instancia EC2

La instancia EC2 de Elastic Beanstalk necesita un perfil de instancia (instance profile) con permisos para:

1. **DynamoDB** — leer y escribir en Tabla_Productos
2. **Lambda** — invocar Lambda_Checkout
3. **CloudWatch Logs** — escribir logs (incluido por defecto en EB)

#### 4.1 Crear la política de permisos para el Backend

Crea un archivo `eb-policy.json`:

```bash
cat > eb-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT_ID}:table/Tabla_Productos"
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:function:Lambda_Checkout"
    }
  ]
}
EOF
```

Adjunta esta política al rol de la instancia EC2 de Elastic Beanstalk. Si usas el rol por defecto `aws-elasticbeanstalk-ec2-role`:

```bash
aws iam put-role-policy \
  --role-name aws-elasticbeanstalk-ec2-role \
  --policy-name TuTiendita-Backend-Permissions \
  --policy-document file://eb-policy.json
```

> **Nota:** Si el rol `aws-elasticbeanstalk-ec2-role` no existe, Elastic Beanstalk lo crea automáticamente la primera vez que creas un entorno desde la consola web. Alternativamente, puedes crearlo manualmente siguiendo la [documentación de AWS](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/iam-instanceprofile.html).

#### 4.2 Instalar EB CLI

```bash
pip install awsebcli
```

Verifica la instalación:

```bash
eb --version
```

#### 4.3 Inicializar el proyecto de Elastic Beanstalk

Desde la carpeta del backend:

```bash
cd backend
eb init tu-tiendita-backend --platform "Node.js 20" --region $AWS_REGION
```

Esto crea un directorio `.elasticbeanstalk/` con la configuración del proyecto.

#### 4.4 Crear el entorno de Elastic Beanstalk

```bash
eb create tu-tiendita-backend-env --single
```

> La opción `--single` crea una sola instancia EC2 sin balanceador de carga, ideal para un proyecto académico y para mantenerse dentro del free tier.

Espera a que el entorno se cree (puede tardar 5-10 minutos).

#### 4.5 Configurar variables de entorno

```bash
eb setenv \
  AWS_REGION=us-east-1 \
  PRODUCTS_TABLE_NAME=Tabla_Productos \
  ORDERS_TABLE_NAME=Tabla_Ordenes \
  LAMBDA_FUNCTION_NAME=Lambda_Checkout \
  PORT=8080
```

> **Importante:** En Elastic Beanstalk, el puerto por defecto es **8080**, no 3000. El proxy de Nginx de EB redirige el tráfico del puerto 80 al 8080.

#### 4.6 Verificar el despliegue

Obtén la URL del entorno:

```bash
eb status
```

Busca el campo `CNAME` en la salida. Prueba el endpoint de salud:

```bash
# Reemplaza con tu CNAME real
export BACKEND_URL=$(eb status | grep "CNAME:" | awk '{print $2}')
curl http://$BACKEND_URL/health
```

Deberías ver: `{"status":"ok"}`

Prueba el endpoint de productos:

```bash
curl http://$BACKEND_URL/api/products
```

Deberías ver la lista de productos (o un array vacío si no ejecutaste el seed).

#### 4.7 Desplegar actualizaciones futuras

Para desplegar cambios en el código del backend:

```bash
cd backend
eb deploy
```

#### 4.8 Ver logs del Backend

```bash
eb logs
```

#### Limpieza de archivos temporales

```bash
rm -f eb-policy.json
```

### Variables de entorno del Backend en Elastic Beanstalk

| Variable | Valor | Descripción |
|---|---|---|
| `AWS_REGION` | `us-east-1` | Región de AWS |
| `PRODUCTS_TABLE_NAME` | `Tabla_Productos` | Nombre de la tabla de productos |
| `ORDERS_TABLE_NAME` | `Tabla_Ordenes` | Nombre de la tabla de órdenes |
| `LAMBDA_FUNCTION_NAME` | `Lambda_Checkout` | Nombre de la función Lambda |
| `PORT` | `8080` | Puerto del servidor Express (EB usa 8080) |

---

## 5. Paso 4 — Desplegar Frontend en S3

El Frontend es una SPA de React compilada como archivos estáticos que se alojan en un bucket de S3.

### Permisos IAM requeridos

El usuario que ejecute estos comandos necesita:

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:CreateBucket",
    "s3:PutBucketWebsite",
    "s3:PutBucketPolicy",
    "s3:PutBucketPublicAccessBlock",
    "s3:PutObject",
    "s3:DeleteObject",
    "s3:ListBucket"
  ],
  "Resource": [
    "arn:aws:s3:::tu-tiendita-frontend-*",
    "arn:aws:s3:::tu-tiendita-frontend-*/*"
  ]
}
```

#### 5.1 Compilar el Frontend

Primero, configura la URL del Backend. Usa la URL de Elastic Beanstalk obtenida en el paso anterior:

```bash
cd frontend
npm install
```

Compila con la variable de entorno apuntando al Backend:

```bash
VITE_API_BASE_URL=http://$BACKEND_URL npm run build
```

> **Nota:** Después de configurar CloudFront (Paso 5), es posible que necesites recompilar con la URL final de CloudFront si decides enrutar las peticiones API a través de CloudFront.

Los archivos compilados se generan en `frontend/dist/`.

#### 5.2 Crear el bucket S3

Elige un nombre único para tu bucket (los nombres de S3 son globales):

```bash
export BUCKET_NAME=tu-tiendita-frontend-$(echo $AWS_ACCOUNT_ID | tail -c 7)
echo "Nombre del bucket: $BUCKET_NAME"
```

```bash
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION
```

#### 5.3 Configurar el bucket para hosting estático

```bash
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html
```

> Se usa `index.html` como documento de error para que React Router maneje las rutas del lado del cliente.

#### 5.4 Configurar acceso público al bucket

Desbloquea el acceso público (necesario para hosting estático sin CloudFront con OAI):

```bash
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
    BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false
```

Aplica una política de bucket para permitir lectura pública:

```bash
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file://bucket-policy.json
```

#### 5.5 Subir los archivos compilados

```bash
aws s3 sync frontend/dist/ s3://$BUCKET_NAME --delete
```

La opción `--delete` elimina archivos del bucket que ya no existen localmente, manteniendo el bucket sincronizado.

#### 5.6 Verificar el hosting en S3

Accede a la URL del sitio web estático de S3:

```bash
echo "URL del Frontend: http://${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com"
```

Abre esa URL en tu navegador. Deberías ver la página principal de Tu Tiendita.

#### 5.7 Actualizar el Frontend (para futuros cambios)

```bash
cd frontend
VITE_API_BASE_URL=http://$BACKEND_URL npm run build
aws s3 sync dist/ s3://$BUCKET_NAME --delete
```

#### Limpieza de archivos temporales

```bash
rm -f bucket-policy.json
```

---

## 6. Paso 5 — Configurar CloudFront

CloudFront actúa como CDN frente al bucket S3, distribuyendo el Frontend con baja latencia y HTTPS.

### Permisos IAM requeridos

```json
{
  "Effect": "Allow",
  "Action": [
    "cloudfront:CreateDistribution",
    "cloudfront:GetDistribution",
    "cloudfront:CreateInvalidation",
    "cloudfront:UpdateDistribution"
  ],
  "Resource": "*"
}
```

#### 6.1 Crear la configuración de la distribución

Crea un archivo `cloudfront-config.json` con la configuración de la distribución:

```bash
cat > cloudfront-config.json << EOF
{
  "CallerReference": "tu-tiendita-$(date +%s)",
  "Comment": "Tu Tiendita - Frontend CDN",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-${BUCKET_NAME}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-${BUCKET_NAME}",
        "DomainName": "${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultRootObject": "index.html",
  "Enabled": true,
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
EOF
```

> **Nota:** Las respuestas de error personalizadas (403 y 404 redirigidas a `/index.html`) son necesarias para que React Router maneje correctamente las rutas del lado del cliente.

#### 6.2 Crear la distribución de CloudFront

```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json \
  --region $AWS_REGION
```

Guarda el **Distribution ID** y el **Domain Name** de la salida. También puedes obtenerlos así:

```bash
aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='Tu Tiendita - Frontend CDN'].[Id,DomainName,Status]" \
  --output table
```

#### 6.3 Esperar a que la distribución se despliegue

Las distribuciones de CloudFront tardan entre 5 y 15 minutos en desplegarse. Verifica el estado:

```bash
export CF_DIST_ID=<tu-distribution-id>

aws cloudfront get-distribution \
  --id $CF_DIST_ID \
  --query "Distribution.Status" \
  --output text
```

Espera hasta que el estado sea `Deployed`.

#### 6.4 Verificar CloudFront

Obtén el dominio de CloudFront:

```bash
export CF_DOMAIN=$(aws cloudfront get-distribution \
  --id $CF_DIST_ID \
  --query "Distribution.DomainName" \
  --output text)

echo "URL de CloudFront: https://$CF_DOMAIN"
```

Abre `https://<tu-dominio>.cloudfront.net` en tu navegador. Deberías ver Tu Tiendita servida con HTTPS.

#### 6.5 Invalidar caché (para futuros despliegues)

Después de subir nuevos archivos al bucket S3, invalida el caché de CloudFront:

```bash
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/*"
```

#### Limpieza de archivos temporales

```bash
rm -f cloudfront-config.json
```

---

## 7. Verificación final

Una vez desplegados todos los componentes, verifica que el sistema funciona de extremo a extremo.

### 7.1 Verificar cada componente

| Componente | Verificación | Resultado esperado |
|---|---|---|
| DynamoDB | `aws dynamodb describe-table --table-name Tabla_Productos --query "Table.TableStatus"` | `ACTIVE` |
| Lambda | `aws lambda invoke --function-name Lambda_Checkout --payload '{"items":[]}' --cli-binary-format raw-in-base64-out /dev/stdout` | `statusCode: 400` |
| Backend | `curl http://<BACKEND_URL>/health` | `{"status":"ok"}` |
| Frontend (S3) | Abrir URL del bucket en navegador | Página principal visible |
| CloudFront | Abrir `https://<CF_DOMAIN>` en navegador | Página principal con HTTPS |

### 7.2 Probar el flujo completo

1. Abre la URL de CloudFront en tu navegador
2. Verifica que los productos se muestran en la página principal
3. Agrega un producto al carrito
4. Ve al carrito y presiona "Finalizar compra"
5. Verifica que aparece un mensaje de éxito
6. Verifica en DynamoDB que el stock se redujo y se creó una orden:

```bash
aws dynamodb scan \
  --table-name Tabla_Ordenes \
  --region $AWS_REGION
```

### 7.3 Resumen de URLs

| Componente | URL |
|---|---|
| Frontend (CloudFront) | `https://<CF_DOMAIN>` |
| Frontend (S3 directo) | `http://<BUCKET_NAME>.s3-website-<REGION>.amazonaws.com` |
| Backend (Elastic Beanstalk) | `http://<EB_CNAME>` |
| Backend Health Check | `http://<EB_CNAME>/health` |

---

## 8. Limpieza de recursos

Cuando ya no necesites el proyecto desplegado, elimina los recursos para evitar costos:

```bash
# 1. Eliminar distribución de CloudFront
#    Primero deshabilítala, espera a que se despliegue, y luego elimínala
aws cloudfront get-distribution-config --id $CF_DIST_ID > cf-config.json
# Edita cf-config.json: cambia "Enabled": true a "Enabled": false
# Luego actualiza y elimina

# 2. Vaciar y eliminar bucket S3
aws s3 rm s3://$BUCKET_NAME --recursive
aws s3 rb s3://$BUCKET_NAME

# 3. Terminar entorno de Elastic Beanstalk
cd backend
eb terminate tu-tiendita-backend-env --force

# 4. Eliminar función Lambda
aws lambda delete-function \
  --function-name Lambda_Checkout \
  --region $AWS_REGION

# 5. Eliminar tablas de DynamoDB
aws dynamodb delete-table --table-name Tabla_Productos --region $AWS_REGION
aws dynamodb delete-table --table-name Tabla_Ordenes --region $AWS_REGION

# 6. Eliminar roles y políticas IAM
aws iam delete-role-policy \
  --role-name TuTiendita-Lambda-Role \
  --policy-name TuTiendita-Lambda-DynamoDB
aws iam detach-role-policy \
  --role-name TuTiendita-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name TuTiendita-Lambda-Role

aws iam delete-role-policy \
  --role-name aws-elasticbeanstalk-ec2-role \
  --policy-name TuTiendita-Backend-Permissions
```

> **Precaución:** La eliminación de tablas DynamoDB es irreversible. Asegúrate de que no necesitas los datos antes de ejecutar estos comandos.
