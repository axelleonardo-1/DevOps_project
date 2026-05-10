# 02. Stack Tecnologico

## Frontend

El frontend esta implementado con Vue 3 y Vite.

- **Vue 3** permite construir una interfaz reactiva basada en componentes.
- **Vue Router** administra la navegacion entre vistas como catalogo, carrito y detalle de orden.
- **Pinia** se utiliza para el manejo de estado del carrito.
- **Axios** se utiliza para consumir los servicios backend.
- **Tailwind CSS** aporta una capa de estilos utilitaria y ligera.
- **Vite** ofrece un flujo de desarrollo rapido y una construccion optimizada para despliegue.

Este stack resulta apropiado para una SPA sencilla, mantenible y facil de desplegar en Cloudflare Pages.

## Hono

**Hono** es el framework HTTP utilizado en ambos servicios backend. Se eligio porque:

- funciona bien en runtimes tipo Web Standard;
- se integra de forma natural con Cloudflare Workers;
- permite definir rutas, middlewares y manejo centralizado de errores con una sintaxis clara;
- reduce la dependencia de primitivas especificas de Node o Express.

## Cloudflare Workers

Los servicios de productos y pedidos se ejecutan sobre **Cloudflare Workers**. Este runtime serverless orientado al edge reemplaza el enfoque previo basado en servidores Express o adaptadores tipo Lambda.

Ventajas para el proyecto:

- despliegue sencillo con Wrangler;
- menor dependencia de infraestructura de servidor;
- modelo nativo para integrarse con D1 y R2;
- buena compatibilidad con Hono.

## Cloudflare D1

**Cloudflare D1** es la base de datos utilizada por los servicios backend. Emplea semantica SQL estilo SQLite y resulta adecuada para el alcance del proyecto.

En la implementacion actual:

- `services/products` usa una tabla `products`;
- `services/orders` usa las tablas `orders` y `order_items`;
- el acceso se hace mediante `env.DB.prepare()` dentro de repositorios dedicados.

## Cloudflare R2

**Cloudflare R2** se utiliza de forma opcional para almacenar imagenes de productos.

En la implementacion actual:

- `services/products` acepta `multipart/form-data`;
- valida tipo y tamano del archivo;
- guarda el objeto en R2;
- conserva `imageKey` e `imageUrl` asociados al producto;
- expone un endpoint para recuperar la imagen.

R2 reemplaza conceptualmente al uso previo de S3, pero con integracion directa al entorno Cloudflare.

## Docker Compose

**Docker Compose** se usa exclusivamente para desarrollo local y evidencia de presentacion.

Permite levantar:

- `frontend`
- `products`
- `orders`

Esto facilita mostrar la aplicacion ejecutandose de forma coordinada sin depender de un despliegue remoto durante la demo.

Importante: Docker no es el runtime de produccion.

## Terraform

**Terraform** se utiliza para describir y validar infraestructura de Cloudflare en `infra/terraform`.

Actualmente documenta o gestiona:

- bases de datos D1 de desarrollo y produccion;
- buckets R2 de desarrollo y produccion, cuando estan habilitados;
- placeholders documentados para Workers y Pages.

Se eligio una configuracion simple y explicable, adecuada para una defensa academica.

## GitHub Actions

**GitHub Actions** es la plataforma de CI/CD del proyecto.

Existen workflows para:

- frontend;
- servicio de productos;
- servicio de pedidos;
- Terraform;
- construccion y publicacion de imagenes Docker.

Esta decision permite centralizar validaciones, despliegues y evidencia de automatizacion dentro del mismo repositorio.

## Docker Hub como evidencia de artefactos

**Docker Hub** no se usa para desplegar produccion. Su rol es:

- publicar imagenes construidas desde el repositorio;
- demostrar trazabilidad de artefactos;
- servir como evidencia para la rubrica del proyecto.

Por ello, el flujo de Docker Hub se entiende como complemento de DevOps y no como plataforma de ejecucion final.

## Resumen del stack

| Capa | Tecnologia principal | Proposito |
| --- | --- | --- |
| Frontend | Vue 3 + Vite + Pinia + Vue Router | Interfaz de usuario |
| Backend | Hono sobre Cloudflare Workers | API de productos y pedidos |
| Base de datos | Cloudflare D1 | Persistencia SQL |
| Objetos | Cloudflare R2 | Imagenes de productos |
| IaC | Terraform | Infraestructura Cloudflare |
| CI/CD | GitHub Actions + Wrangler | Validacion y despliegue |
| Evidencia de artefactos | Docker + Docker Hub | Desarrollo local y demostracion |
