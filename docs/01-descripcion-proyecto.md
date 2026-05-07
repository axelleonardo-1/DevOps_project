# 01. Descripcion del Proyecto

## Vision general

El proyecto consiste en una aplicacion de comercio electronico construida con una arquitectura desacoplada de frontend y microservicios. Su objetivo es permitir la consulta de productos, la simulacion de compra y la gestion de pedidos mediante una plataforma web moderna y desplegable en infraestructura cloud-native.

## Proposito de negocio

Desde la perspectiva funcional, la aplicacion resuelve tres necesidades principales:

1. publicar y consultar un catalogo de productos;
2. permitir que un usuario seleccione articulos y genere un pedido;
3. conservar el estado del pedido para su seguimiento posterior.

Aunque se trata de un proyecto academico, el modelo representa un flujo comun en plataformas de ecommerce: un servicio para catalogo, un servicio para pedidos y una interfaz de usuario que coordina la experiencia completa.

## Interaccion entre frontend, productos y pedidos

La solucion se organiza en tres piezas principales:

- `frontend`: interfaz web donde el usuario navega por el catalogo, revisa el detalle de un producto, agrega articulos al carrito y consulta pedidos.
- `services/products`: servicio backend responsable del catalogo de productos, inventario y acceso opcional a imagenes almacenadas en Cloudflare R2.
- `services/orders`: servicio backend responsable de la creacion, consulta, actualizacion de estado y eliminacion de pedidos.

El flujo principal es el siguiente:

1. El usuario entra al frontend y consulta el catalogo.
2. El frontend solicita datos al servicio de productos.
3. El usuario agrega productos al carrito y confirma la compra.
4. El frontend envia la orden al servicio de pedidos.
5. El servicio de pedidos consulta al servicio de productos para validar existencia y stock.
6. Si la orden es aceptada, se registra en la base de datos y se actualiza el inventario segun el estado de pago simulado.

## Evolucion arquitectonica

El proyecto original estaba orientado a AWS, con supuestos de DynamoDB, S3, AWS Lambda y despliegue web con enfoque similar a S3/CloudFront. La arquitectura final migra esos conceptos a una solucion nativa de Cloudflare:

- Cloudflare Pages para el frontend;
- Cloudflare Workers con Hono para los microservicios;
- Cloudflare D1 como base de datos relacional ligera;
- Cloudflare R2 como almacenamiento opcional de imagenes;
- Cloudflare Observability para monitoreo operacional.

## Ambientes de trabajo

La solucion contempla dos ambientes principales:

### Desarrollo

Se utiliza para integracion continua, pruebas funcionales y demostracion incremental. En este ambiente:

- el frontend puede ejecutarse localmente con Vite;
- los servicios pueden ejecutarse con Wrangler en modo `dev`;
- existe soporte para `docker compose up` como entorno local de evidencia;
- los despliegues automáticos apuntan al entorno `development`.

### Produccion

Se utiliza para la version final publicada. En este ambiente:

- el frontend se despliega en Cloudflare Pages;
- los servicios backend se despliegan en Cloudflare Workers;
- la infraestructura de datos apunta a recursos `prod`;
- los cambios requieren aprobacion manual mediante GitHub Environments.

## Alcance actual

El estado actual del repositorio refleja una migracion funcional hacia Cloudflare Workers, D1 y R2 en los servicios backend, asi como una organizacion de monorepo con pipelines, Terraform y soporte local con Docker Compose. El objetivo no es solo que el sistema funcione, sino que sea presentable, trazable y desplegable mediante buenas practicas de DevOps.
