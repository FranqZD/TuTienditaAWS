# Documento de Requisitos — Tu Tiendita

## Introducción

"Tu Tiendita" es un proyecto académico cuyo objetivo principal es demostrar una arquitectura AWS completa mediante una tienda virtual simple y funcional. La aplicación permite a los usuarios ver productos, agregarlos a un carrito, simular una compra y reducir inventario. Incluye un panel de administración básico para gestionar productos. El enfoque es la simplicidad y la claridad arquitectónica, no la complejidad de un e-commerce real. No se implementa autenticación, pagos reales ni servicios innecesarios.

## Glosario

- **Frontend**: Aplicación web estática construida con React y Vite, compilada como archivos estáticos para desplegar en Amazon S3.
- **Backend**: Servidor Node.js con Express desplegado en AWS Elastic Beanstalk sobre instancias EC2 administradas.
- **Lambda_Checkout**: Función AWS Lambda en Node.js que procesa la compra simulada, valida inventario, actualiza stock y registra la orden en DynamoDB.
- **DynamoDB**: Base de datos NoSQL de AWS utilizada para almacenar productos, inventario y órdenes simuladas.
- **Tabla_Productos**: Tabla de DynamoDB que almacena la información de productos con los campos: productId, name, description, price, stock, imageUrl, active, createdAt, updatedAt.
- **Tabla_Ordenes**: Tabla de DynamoDB que almacena las órdenes simuladas con los campos: orderId, items, total, status, createdAt.
- **Carrito**: Estructura de datos en el Frontend que almacena temporalmente los productos seleccionados por el usuario antes de simular la compra.
- **CloudFront**: Servicio CDN de AWS que distribuye el Frontend almacenado en S3.
- **S3_Bucket**: Bucket de Amazon S3 configurado para alojar los archivos estáticos del Frontend.
- **Elastic_Beanstalk**: Servicio de AWS que administra el despliegue del Backend sobre instancias EC2.
- **Usuario**: Persona que navega la tienda virtual, visualiza productos, gestiona el Carrito y simula compras.
- **Administrador**: Persona que accede al panel de administración para crear, editar, eliminar o desactivar productos.
- **Compra_Simulada**: Proceso que imita una transacción de compra sin involucrar pagos reales ni pasarelas de pago.

## Requisitos

### Requisito 1: Visualización de productos

**Historia de Usuario:** Como Usuario, quiero ver una lista de productos disponibles en la página principal, para poder explorar lo que la tienda ofrece.

#### Criterios de Aceptación

1. WHEN el Usuario accede a la página principal, THE Frontend SHALL solicitar la lista de productos activos al Backend mediante el endpoint GET /api/products.
2. WHEN el Backend recibe una solicitud GET /api/products, THE Backend SHALL consultar la Tabla_Productos en DynamoDB y retornar todos los productos cuyo campo active sea true.
3. WHEN el Frontend recibe la lista de productos, THE Frontend SHALL mostrar cada producto con su nombre, descripción, precio, stock disponible e imagen.
4. WHEN el Frontend recibe la lista de productos, THE Frontend SHALL mostrar un botón "Agregar al carrito" en cada producto.
5. IF la consulta a DynamoDB falla, THEN THE Backend SHALL retornar un código HTTP 500 con un mensaje de error descriptivo.

---

### Requisito 2: Detalle de producto

**Historia de Usuario:** Como Usuario, quiero ver el detalle de un producto específico, para poder conocer toda su información antes de agregarlo al Carrito.

#### Criterios de Aceptación

1. WHEN el Usuario solicita el detalle de un producto, THE Frontend SHALL enviar una solicitud al Backend mediante el endpoint GET /api/products/:id.
2. WHEN el Backend recibe una solicitud GET /api/products/:id con un productId válido, THE Backend SHALL consultar la Tabla_Productos en DynamoDB y retornar la información completa del producto.
3. IF el productId solicitado no existe en la Tabla_Productos, THEN THE Backend SHALL retornar un código HTTP 404 con un mensaje indicando que el producto no fue encontrado.

---

### Requisito 3: Gestión del carrito de compras

**Historia de Usuario:** Como Usuario, quiero gestionar un carrito de compras en el Frontend, para poder seleccionar productos antes de simular una compra.

#### Criterios de Aceptación

1. WHEN el Usuario presiona el botón "Agregar al carrito" en un producto, THE Frontend SHALL agregar el producto al Carrito con cantidad inicial de 1.
2. WHEN el Usuario incrementa la cantidad de un producto en el Carrito, THE Frontend SHALL aumentar la cantidad de ese producto en 1 unidad.
3. WHEN el Usuario decrementa la cantidad de un producto en el Carrito, THE Frontend SHALL reducir la cantidad de ese producto en 1 unidad.
4. WHEN la cantidad de un producto en el Carrito llega a 0, THE Frontend SHALL eliminar ese producto del Carrito.
5. WHEN el Usuario presiona el botón "Eliminar" en un producto del Carrito, THE Frontend SHALL remover ese producto del Carrito.
6. THE Frontend SHALL mostrar el total acumulado del Carrito calculado como la suma de (precio × cantidad) de cada producto en el Carrito.
7. THE Frontend SHALL mostrar un botón "Finalizar compra" en la vista del Carrito.
8. WHILE el Carrito está vacío, THE Frontend SHALL deshabilitar el botón "Finalizar compra".

---

### Requisito 4: Proceso de compra simulada

**Historia de Usuario:** Como Usuario, quiero simular una compra con los productos de mi Carrito, para poder experimentar el flujo completo de una transacción sin pagos reales.

#### Criterios de Aceptación

1. WHEN el Usuario presiona el botón "Finalizar compra", THE Frontend SHALL enviar el contenido del Carrito al Backend mediante el endpoint POST /api/orders/checkout.
2. WHEN el Backend recibe una solicitud POST /api/orders/checkout, THE Backend SHALL invocar la Lambda_Checkout pasando los datos del Carrito como payload.
3. WHEN la Lambda_Checkout recibe una orden, THE Lambda_Checkout SHALL validar que cada producto del Carrito exista en la Tabla_Productos.
4. WHEN la Lambda_Checkout recibe una orden, THE Lambda_Checkout SHALL validar que el stock disponible de cada producto sea mayor o igual a la cantidad solicitada.
5. WHEN la validación de la Lambda_Checkout es exitosa, THE Lambda_Checkout SHALL reducir el stock de cada producto en la Tabla_Productos según la cantidad comprada.
6. WHEN la validación de la Lambda_Checkout es exitosa, THE Lambda_Checkout SHALL crear un registro en la Tabla_Ordenes con un orderId único, los items comprados, el total calculado, el status "completed" y la fecha de creación.
7. WHEN la Lambda_Checkout procesa la orden exitosamente, THE Lambda_Checkout SHALL retornar una respuesta con código 200 y los datos de la orden creada.
8. WHEN el Frontend recibe una respuesta exitosa de la Compra_Simulada, THE Frontend SHALL mostrar un mensaje de éxito al Usuario y vaciar el Carrito.
9. IF algún producto del Carrito no existe en la Tabla_Productos, THEN THE Lambda_Checkout SHALL retornar un código de error con un mensaje indicando el producto no encontrado.
10. IF el stock de algún producto es insuficiente para la cantidad solicitada, THEN THE Lambda_Checkout SHALL retornar un código de error con un mensaje indicando stock insuficiente para ese producto.
11. IF la invocación de la Lambda_Checkout falla, THEN THE Backend SHALL retornar un código HTTP 500 con un mensaje de error descriptivo al Frontend.

---

### Requisito 5: Panel de administración de productos

**Historia de Usuario:** Como Administrador, quiero un panel simple para gestionar productos, para poder crear, editar y eliminar productos de la tienda.

#### Criterios de Aceptación

1. WHEN el Administrador accede al panel de administración, THE Frontend SHALL mostrar una lista de todos los productos registrados en la Tabla_Productos.
2. WHEN el Administrador envía el formulario de creación de producto con datos válidos, THE Frontend SHALL enviar una solicitud POST /api/products al Backend con los datos del producto.
3. WHEN el Backend recibe una solicitud POST /api/products con datos válidos, THE Backend SHALL crear un nuevo registro en la Tabla_Productos con un productId único, los datos proporcionados, active en true, y las fechas createdAt y updatedAt.
4. WHEN el Backend crea un producto exitosamente, THE Backend SHALL retornar un código HTTP 201 con los datos del producto creado.
5. WHEN el Administrador envía el formulario de edición de un producto con datos válidos, THE Frontend SHALL enviar una solicitud PUT /api/products/:id al Backend con los datos actualizados.
6. WHEN el Backend recibe una solicitud PUT /api/products/:id con datos válidos, THE Backend SHALL actualizar el registro correspondiente en la Tabla_Productos y actualizar el campo updatedAt.
7. WHEN el Administrador solicita eliminar o desactivar un producto, THE Frontend SHALL enviar una solicitud DELETE /api/products/:id al Backend.
8. WHEN el Backend recibe una solicitud DELETE /api/products/:id, THE Backend SHALL marcar el producto como inactivo estableciendo el campo active en false en la Tabla_Productos.
9. IF los datos proporcionados para crear o editar un producto son inválidos, THEN THE Backend SHALL retornar un código HTTP 400 con un mensaje describiendo los campos inválidos.
10. IF el productId proporcionado para editar o eliminar no existe en la Tabla_Productos, THEN THE Backend SHALL retornar un código HTTP 404 con un mensaje indicando que el producto no fue encontrado.

---

### Requisito 6: Endpoint de salud del Backend

**Historia de Usuario:** Como Administrador, quiero un endpoint de verificación de salud, para poder confirmar que el Backend está activo y funcionando.

#### Criterios de Aceptación

1. WHEN se recibe una solicitud GET /health, THE Backend SHALL retornar un código HTTP 200 con un cuerpo JSON que contenga el estado "ok".

---

### Requisito 7: Configuración CORS del Backend

**Historia de Usuario:** Como Usuario, quiero que el Frontend pueda comunicarse con el Backend sin errores de origen cruzado, para poder utilizar la aplicación correctamente.

#### Criterios de Aceptación

1. THE Backend SHALL habilitar CORS para permitir solicitudes desde el dominio del Frontend.
2. THE Backend SHALL aceptar solicitudes con los métodos HTTP GET, POST, PUT y DELETE.

---

### Requisito 8: Configuración mediante variables de entorno

**Historia de Usuario:** Como Administrador, quiero configurar la aplicación mediante variables de entorno, para poder desplegar en diferentes ambientes sin modificar el código.

#### Criterios de Aceptación

1. THE Backend SHALL leer la región de AWS desde la variable de entorno AWS_REGION.
2. THE Backend SHALL leer el nombre de la tabla de productos desde una variable de entorno configurable.
3. THE Backend SHALL leer el nombre de la función Lambda desde una variable de entorno configurable.
4. THE Frontend SHALL leer la URL base del Backend desde una variable de entorno configurable en tiempo de compilación.
5. THE Backend SHALL incluir un archivo .env.example documentando todas las variables de entorno requeridas.
6. THE Frontend SHALL incluir un archivo .env.example documentando todas las variables de entorno requeridas.

---

### Requisito 9: Diseño responsivo y simple del Frontend

**Historia de Usuario:** Como Usuario, quiero una interfaz limpia, simple y responsiva, para poder navegar la tienda desde cualquier dispositivo.

#### Criterios de Aceptación

1. THE Frontend SHALL renderizar correctamente en pantallas con ancho mínimo de 320px.
2. THE Frontend SHALL utilizar un diseño limpio con HTML semántico y CSS sin frameworks externos complejos.
3. THE Frontend SHALL compilar como archivos estáticos (HTML, CSS, JS) listos para subir a S3_Bucket.

---

### Requisito 10: Datos de ejemplo para productos

**Historia de Usuario:** Como Administrador, quiero contar con datos de ejemplo precargados, para poder probar la aplicación sin necesidad de crear productos manualmente.

#### Criterios de Aceptación

1. THE Backend SHALL incluir un script o mecanismo para insertar datos de ejemplo de productos en la Tabla_Productos.
2. THE Backend SHALL incluir datos de ejemplo con un mínimo de 5 productos con todos los campos de la Tabla_Productos completados.

---

### Requisito 11: Estructura de carpetas del proyecto

**Historia de Usuario:** Como Administrador, quiero una estructura de carpetas organizada y clara, para poder entender y navegar el código fácilmente.

#### Criterios de Aceptación

1. THE Frontend SHALL organizarse dentro de la carpeta frontend/ con subcarpetas components/, pages/, y services/ dentro de src/.
2. THE Backend SHALL organizarse dentro de la carpeta backend/ con subcarpetas routes/, controllers/, services/, y config/ dentro de src/.
3. THE Lambda_Checkout SHALL organizarse dentro de la carpeta lambda/checkout/ con su propio archivo index.js y package.json.
4. THE proyecto SHALL incluir una carpeta docs/ con los archivos architecture.md y deployment-guide.md.
5. THE proyecto SHALL incluir un archivo README.md en la raíz del proyecto.

---

### Requisito 12: Documentación del proyecto

**Historia de Usuario:** Como Administrador, quiero documentación completa del proyecto, para poder entender la arquitectura y desplegar la aplicación paso a paso.

#### Criterios de Aceptación

1. THE README.md SHALL incluir una descripción del proyecto, la arquitectura AWS utilizada y un diagrama de arquitectura en texto.
2. THE README.md SHALL incluir instrucciones para ejecutar el Frontend localmente.
3. THE README.md SHALL incluir instrucciones para ejecutar el Backend localmente.
4. THE README.md SHALL incluir instrucciones para desplegar el Frontend en S3_Bucket.
5. THE README.md SHALL incluir instrucciones para configurar CloudFront frente al S3_Bucket.
6. THE README.md SHALL incluir instrucciones para desplegar el Backend en Elastic_Beanstalk.
7. THE README.md SHALL incluir instrucciones para crear las tablas en DynamoDB.
8. THE README.md SHALL incluir instrucciones para desplegar la Lambda_Checkout.
9. THE README.md SHALL incluir la lista completa de variables de entorno requeridas.
10. THE README.md SHALL incluir una descripción del flujo completo de la Compra_Simulada.
11. THE docs/architecture.md SHALL describir la separación de responsabilidades entre Frontend, Backend, Lambda_Checkout y DynamoDB.
12. THE docs/deployment-guide.md SHALL incluir los pasos detallados para desplegar cada componente en AWS.

---

### Requisito 13: Ejecución local del proyecto

**Historia de Usuario:** Como Administrador, quiero poder ejecutar el proyecto localmente, para poder desarrollar y probar sin necesidad de desplegar en AWS.

#### Criterios de Aceptación

1. THE Frontend SHALL poder ejecutarse localmente mediante el comando de desarrollo de Vite.
2. THE Backend SHALL poder ejecutarse localmente conectándose a DynamoDB en AWS mediante variables de entorno.
3. THE README.md SHALL incluir instrucciones para configurar el entorno local, incluyendo la opción de usar DynamoDB real en AWS o alternativas de mock para desarrollo local.

---

### Requisito 14: Arquitectura AWS demostrable

**Historia de Usuario:** Como Administrador, quiero que la arquitectura del proyecto demuestre claramente el uso de los servicios AWS requeridos, para poder presentar el proyecto en un curso de arquitectura en la nube.

#### Criterios de Aceptación

1. THE Frontend SHALL desplegarse como archivos estáticos en S3_Bucket.
2. THE CloudFront SHALL servir el Frontend almacenado en S3_Bucket como CDN.
3. THE Backend SHALL desplegarse en Elastic_Beanstalk utilizando instancias EC2 administradas.
4. THE Backend SHALL comunicarse con DynamoDB para consultar y gestionar productos.
5. THE Backend SHALL invocar la Lambda_Checkout para procesar la Compra_Simulada.
6. THE Lambda_Checkout SHALL comunicarse directamente con DynamoDB para actualizar inventario y registrar órdenes.
7. THE docs/architecture.md SHALL incluir una explicación del flujo completo: Usuario → CloudFront → S3_Bucket → Frontend → Backend (Elastic_Beanstalk/EC2) → Lambda_Checkout → DynamoDB.
