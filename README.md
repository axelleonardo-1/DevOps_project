# Proyecto E-Commerce (Arquitectura de Microservicios)

Este repositorio contiene el codigo fuente de una plataforma de comercio electronico basada en una arquitectura de microservicios. En esta fase solo se reorganiza la estructura del repositorio para dejarla lista como monorepo. No se migra todavia Express, DynamoDB, S3 ni AWS Lambda.

## Estructura del Monorepo

El proyecto queda organizado asi:

```text
.
|-- frontend
|-- services
|   |-- products
|   `-- orders
|-- infra
|   `-- terraform
|-- docs
`-- .github
    `-- workflows
```

## Componentes del Proyecto

### 1. Interfaz de Usuario (`frontend`)
Este directorio contiene la aplicacion frontend que interactua directamente con el cliente final. Es la capa de presentacion que permite a los usuarios navegar por el catalogo, ver los detalles de los productos e iniciar el proceso de compra.

### 2. Servicio de Productos (`services/products`)
Este microservicio gestiona el catalogo de la tienda. Centraliza la informacion de los articulos disponibles, incluyendo nombres, descripciones, precios, inventario e imagenes.

### 3. Servicio de Pedidos (`services/orders`)
Este microservicio gestiona las transacciones de compra. Maneja el ciclo de vida de las ordenes de los clientes, desde la solicitud hasta el almacenamiento de su estado.

## Nota de Alcance

Esta fase:

- reorganiza carpetas y mantiene el codigo existente
- preserva `package.json`, pruebas, Dockerfiles, `buildspec.yml` y configuraciones actuales
- no cambia comportamiento de ejecucion

Esta fase no:

- migra Express a otro framework
- reemplaza DynamoDB
- reemplaza S3
- reemplaza AWS Lambda
- elimina Swagger ni las rutas de coverage

## Desarrollo con Docker Compose

El repositorio incluye un entorno de desarrollo local con Docker Compose para levantar el frontend y ambos servicios sin cambiar su comportamiento actual.

Servicios expuestos:

- `frontend` en `http://localhost:5173`
- `products` en `http://localhost:3001`
- `orders` en `http://localhost:3002`

Variables configuradas en Compose:

- frontend usa `VITE_API_GATEWAY_URL=http://localhost:3001`
- frontend usa `VITE_ORDERS_API_URL=http://localhost:3002`
- orders usa `ENV=dev`
- orders usa `PRODUCTS_SERVICE_URL=http://products:3001`

Para iniciar el entorno:

```bash
docker compose up --build
```

Para detenerlo:

```bash
docker compose down
```

Notas:

- este entorno es solo para desarrollo local y evidencia de presentacion
- Docker Hub se usa como evidencia de artefactos para la rubrica y demostracion
- produccion no corre en contenedores Docker
- produccion se despliega en Cloudflare Workers para backend y Cloudflare Pages para frontend
- las variables de DynamoDB y S3 se mantienen con valores locales de ejemplo para no cambiar la logica existente

---
Para instrucciones especificas sobre dependencias, configuracion o ejecucion local de cada aplicacion o servicio, consulta la documentacion dentro de `frontend`, `services/products` y `services/orders`.
