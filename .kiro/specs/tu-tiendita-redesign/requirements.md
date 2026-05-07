# Documento de Requerimientos — Rediseño Tu Tiendita

## Introducción

Este documento define los requerimientos para transformar el proyecto académico "Tu Tiendita" en una tienda en línea con apariencia profesional, moderna y formal. El rediseño abarca la interfaz de usuario completa del frontend, mejoras al flujo de productos en el panel de administración, un dashboard administrativo con métricas, y la consulta de órdenes. Se mantiene la arquitectura actual (React + Vite, Express en Elastic Beanstalk, Lambda_Checkout, DynamoDB) y no se agregan servicios AWS adicionales ni tablas nuevas.

## Glosario

- **Frontend**: Aplicación React SPA servida desde S3/CloudFront, construida con Vite
- **Backend**: API REST Node.js/Express desplegada en Elastic Beanstalk
- **Catálogo**: Vista pública que muestra los productos activos disponibles para compra
- **Carrito**: Estado local en React Context que almacena los productos seleccionados por el usuario
- **Panel_Admin**: Sección administrativa del frontend para gestionar productos y consultar órdenes
- **Dashboard**: Vista resumen dentro del Panel_Admin con métricas generales del sistema
- **Navbar**: Barra de navegación principal visible en todas las páginas públicas
- **Hero_Section**: Sección visual prominente en la página de inicio con mensaje de bienvenida
- **ProductCard**: Componente tarjeta que muestra información resumida de un producto en el catálogo
- **ProductForm**: Formulario para crear o editar productos en el Panel_Admin
- **CartContext**: Contexto de React que gestiona el estado global del carrito
- **Tabla_Productos**: Tabla DynamoDB que almacena el catálogo de productos
- **Tabla_Ordenes**: Tabla DynamoDB que almacena las órdenes completadas
- **Lambda_Checkout**: Función Lambda que procesa las compras simuladas
- **Endpoint_Ordenes**: Endpoint GET /api/orders del Backend para listar órdenes
- **Layout**: Componente envolvente que provee estructura visual consistente (navbar, footer, contenido)
- **Estado_Carga**: Indicador visual mostrado mientras se obtienen datos del servidor
- **Estado_Error**: Mensaje visual mostrado cuando una operación falla
- **Estado_Vacío**: Mensaje visual mostrado cuando no hay datos para mostrar
- **CSS_Modules**: Archivos CSS con alcance local por componente, compatibles con Vite

## Requerimientos

### Requerimiento 1: Layout y Navegación Profesional

**Historia de Usuario:** Como usuario, quiero una interfaz con navegación profesional y estructura visual consistente, para que la tienda se perciba como un e-commerce formal.

#### Criterios de Aceptación

1. THE Layout SHALL envolver todas las páginas públicas con una estructura consistente que incluya Navbar en la parte superior y footer en la parte inferior
2. THE Navbar SHALL mostrar el logotipo/nombre de la tienda, enlaces de navegación a Inicio, Catálogo y Carrito, y un indicador numérico de productos en el carrito
3. THE Navbar SHALL ser responsive y colapsar los enlaces en un menú hamburguesa en pantallas menores a 768px de ancho
4. THE Footer SHALL mostrar información básica de la tienda incluyendo nombre, texto de derechos reservados y enlaces de navegación secundarios
5. WHILE el usuario navega por cualquier página pública, THE Layout SHALL mantener la Navbar fija en la parte superior de la ventana

### Requerimiento 2: Página de Inicio con Hero Section

**Historia de Usuario:** Como usuario, quiero una página de inicio atractiva con una sección hero y productos destacados, para tener una primera impresión profesional de la tienda.

#### Criterios de Aceptación

1. THE Hero_Section SHALL mostrar un mensaje de bienvenida, una descripción breve de la tienda y un botón de llamada a la acción que dirija al catálogo
2. THE HomePage SHALL mostrar una sección de productos destacados debajo del Hero_Section con un máximo de 8 productos activos
3. WHEN la página de inicio se carga, THE Frontend SHALL mostrar un Estado_Carga mientras obtiene los productos del Backend
4. IF la petición de productos falla, THEN THE Frontend SHALL mostrar un Estado_Error con un mensaje descriptivo y un botón para reintentar
5. IF no existen productos activos, THEN THE Frontend SHALL mostrar un Estado_Vacío con un mensaje informativo

### Requerimiento 3: Catálogo de Productos Profesional

**Historia de Usuario:** Como usuario, quiero un catálogo de productos con tarjetas pulidas y filtros básicos, para encontrar y evaluar productos fácilmente.

#### Criterios de Aceptación

1. THE ProductCard SHALL mostrar imagen del producto, nombre, descripción truncada a 2 líneas, precio formateado en MXN, indicador visual de stock disponible y botón para agregar al carrito
2. WHEN el stock de un producto es 0, THE ProductCard SHALL mostrar una etiqueta "Agotado" y deshabilitar el botón de agregar al carrito
3. WHEN el stock de un producto es menor o igual a 5 y mayor a 0, THE ProductCard SHALL mostrar una etiqueta de advertencia "Últimas unidades"
4. THE Catálogo SHALL organizar los productos en una cuadrícula responsive: 4 columnas en escritorio, 2 columnas en tablet y 1 columna en móvil
5. THE Catálogo SHALL permitir filtrar productos por categoría cuando el campo categoría esté disponible en los productos
6. THE Catálogo SHALL permitir ordenar productos por precio ascendente, precio descendente y nombre alfabético

### Requerimiento 4: Experiencia de Carrito Mejorada

**Historia de Usuario:** Como usuario, quiero un carrito de compras con mejor experiencia visual y funcional, para gestionar mis productos antes de comprar con confianza.

#### Criterios de Aceptación

1. THE CartPage SHALL mostrar cada producto del carrito con imagen, nombre, precio unitario, controles de cantidad (incrementar/decrementar), subtotal por producto y botón de eliminar
2. THE CartPage SHALL mostrar un resumen de compra con subtotal, cantidad total de productos y botón de finalizar compra
3. WHEN el carrito está vacío, THE CartPage SHALL mostrar un Estado_Vacío con ilustración, mensaje informativo y enlace al catálogo
4. WHILE se procesa el checkout, THE CartPage SHALL deshabilitar el botón de finalizar compra y mostrar un indicador de procesamiento
5. WHEN el checkout es exitoso, THE Frontend SHALL mostrar una pantalla de confirmación con el número de orden, fecha, lista de productos comprados y total pagado
6. THE Frontend SHALL limpiar el carrito únicamente después de un checkout exitoso
7. IF el checkout falla por error de stock, THEN THE Frontend SHALL mostrar un mensaje claro indicando qué productos tienen stock insuficiente y preservar el contenido del carrito
8. IF el checkout falla por error de servidor, THEN THE Frontend SHALL mostrar un mensaje de error genérico y preservar el contenido del carrito

### Requerimiento 5: Formulario de Productos Mejorado

**Historia de Usuario:** Como administrador, quiero un formulario de productos más completo con validación visual y campos adicionales, para gestionar el catálogo de forma eficiente.

#### Criterios de Aceptación

1. THE ProductForm SHALL incluir los campos: nombre, descripción, precio, stock, URL de imagen, categoría y estado activo/inactivo
2. THE ProductForm SHALL validar cada campo en el frontend antes de enviar: nombre no vacío, descripción no vacía, precio mayor a 0, stock entero mayor o igual a 0, URL de imagen no vacía y con formato URL válido
3. WHEN un campo no cumple la validación, THE ProductForm SHALL mostrar un mensaje de error específico debajo del campo correspondiente en color rojo
4. WHEN el formulario se envía exitosamente, THE ProductForm SHALL mostrar un mensaje de éxito verde y limpiar los campos para permitir crear otro producto
5. IF el Backend retorna un error de validación, THEN THE ProductForm SHALL mostrar los errores retornados por el servidor sin perder los datos ingresados por el usuario
6. THE ProductForm SHALL mostrar una vista previa de la imagen cuando se ingresa una URL válida en el campo de imagen

### Requerimiento 6: Panel de Administración Formal

**Historia de Usuario:** Como administrador, quiero un panel de administración con navegación interna y dashboard de métricas, para tener una visión general del estado de la tienda.

#### Criterios de Aceptación

1. THE Panel_Admin SHALL tener una navegación interna con pestañas o sidebar que incluya las secciones: Dashboard, Productos, Nuevo Producto y Órdenes
2. THE Dashboard SHALL mostrar tarjetas de resumen con: total de productos, productos activos, productos con stock bajo (menor o igual a 5) y total de órdenes
3. WHEN el Panel_Admin se carga, THE Dashboard SHALL obtener los datos de productos del Backend y calcular las métricas localmente
4. WHEN el endpoint de órdenes está disponible, THE Dashboard SHALL mostrar el total de órdenes obtenido del Endpoint_Ordenes
5. THE Panel_Admin SHALL mantener la navegación interna visible mientras el administrador navega entre secciones
6. THE Panel_Admin SHALL utilizar un layout diferenciado del layout público para distinguir visualmente la zona administrativa

### Requerimiento 7: Consulta de Órdenes

**Historia de Usuario:** Como administrador, quiero consultar las órdenes realizadas en una tabla profesional, para dar seguimiento a las ventas de la tienda.

#### Criterios de Aceptación

1. THE Backend SHALL exponer un endpoint GET /api/orders que retorne la lista de órdenes almacenadas en Tabla_Ordenes
2. THE Endpoint_Ordenes SHALL retornar cada orden con los campos: orderId, createdAt, total, status y cantidad de productos
3. THE Panel_Admin SHALL mostrar las órdenes en una tabla profesional con columnas: ID de orden, fecha, total, estado, cantidad de productos y acción de ver detalle
4. WHEN el administrador selecciona ver detalle de una orden, THE Panel_Admin SHALL mostrar un modal o vista expandida con la lista de items de la orden incluyendo nombre, cantidad y precio de cada producto
5. WHEN la sección de órdenes se carga, THE Panel_Admin SHALL mostrar un Estado_Carga mientras obtiene los datos del Endpoint_Ordenes
6. IF la petición de órdenes falla, THEN THE Panel_Admin SHALL mostrar un Estado_Error con mensaje descriptivo y botón para reintentar
7. IF no existen órdenes registradas, THEN THE Panel_Admin SHALL mostrar un Estado_Vacío con mensaje informativo

### Requerimiento 8: Endpoint de Listado de Órdenes

**Historia de Usuario:** Como sistema, necesito un endpoint para listar órdenes desde Tabla_Ordenes, para que el Panel_Admin pueda consultar el historial de ventas.

#### Criterios de Aceptación

1. THE Backend SHALL implementar un controlador para GET /api/orders que ejecute un Scan sobre Tabla_Ordenes
2. THE Endpoint_Ordenes SHALL retornar un array JSON con todas las órdenes ordenadas por fecha de creación descendente
3. IF ocurre un error al consultar DynamoDB, THEN THE Backend SHALL retornar un código HTTP 500 con un mensaje de error descriptivo
4. THE Endpoint_Ordenes SHALL reutilizar la configuración existente de DynamoDB (docClient y ORDERS_TABLE_NAME) sin crear nuevas conexiones ni tablas
5. THE Backend SHALL registrar la nueva ruta en el archivo de rutas de órdenes existente sin modificar las rutas actuales de checkout

### Requerimiento 9: Diseño Visual Profesional

**Historia de Usuario:** Como usuario, quiero una interfaz con diseño limpio, sobrio y formal, para percibir la tienda como un comercio electrónico confiable.

#### Criterios de Aceptación

1. THE Frontend SHALL utilizar una paleta de colores consistente: fondo claro (#f5f5f5 o similar), tarjetas blancas, encabezados en azul oscuro o negro suave, acciones primarias en verde o azul, y rojo exclusivamente para errores y acciones destructivas
2. THE Frontend SHALL utilizar CSS plano o CSS Modules compatibles con Vite sin dependencias de frameworks CSS pesados
3. THE Frontend SHALL ser completamente responsive y funcionar correctamente en pantallas de 320px a 1920px de ancho
4. THE Frontend SHALL utilizar tipografía legible con jerarquía visual clara: tamaños diferenciados para títulos, subtítulos y texto de cuerpo
5. THE Frontend SHALL aplicar transiciones suaves en interacciones de hover y cambios de estado de botones
6. THE Frontend SHALL mostrar estados de carga, error y vacío con componentes reutilizables que mantengan consistencia visual en toda la aplicación

### Requerimiento 10: Compatibilidad y Restricciones del Sistema

**Historia de Usuario:** Como desarrollador, quiero que el rediseño mantenga la compatibilidad con la infraestructura existente, para no romper el despliegue ni la funcionalidad actual.

#### Criterios de Aceptación

1. THE Frontend SHALL mantener la variable de entorno VITE_API_BASE_URL como única configuración de conexión al Backend
2. THE Frontend SHALL centralizar todas las llamadas HTTP en el archivo frontend/src/services/api.js
3. THE Frontend SHALL mantener el carrito en React Context (CartContext) sin agregar dependencias de estado externas
4. THE Backend SHALL mantener todos los endpoints existentes (GET/POST/PUT/DELETE /api/products, POST /api/orders/checkout, GET /health) sin modificar su comportamiento
5. THE Backend SHALL mantener la invocación de Lambda_Checkout sin modificaciones a la función Lambda
6. THE Frontend SHALL mantener la estructura base de carpetas: components, pages, services, context dentro de frontend/src
7. THE Frontend SHALL funcionar correctamente al compilarse como archivos estáticos para despliegue en S3/CloudFront
