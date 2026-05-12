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

El repositorio incluye un entorno local con Docker Compose pensado para la arquitectura actual del proyecto:

- `frontend` corre con Vite
- `services/products` corre con `wrangler dev`
- `services/orders` corre con `wrangler dev`
- ambos servicios usan D1 local para datos
- `products` usa R2 local para imagenes

Servicios expuestos:

- `frontend` en `http://localhost:5173`
- `products` en `http://localhost:3001`
- `orders` en `http://localhost:3002`

Comportamiento del entorno local:

- `frontend` usa `VITE_API_MODE=proxy`
- Vite redirige `/products` a `http://localhost:3001`
- Vite redirige `/orders` a `http://localhost:3002`
- `orders` usa `PRODUCTS_SERVICE_URL=http://products:3001` para comunicacion interna entre contenedores
- al iniciar Compose se aplican las migraciones D1 locales
- el servicio de productos tambien ejecuta el seed local en cada arranque
- el estado local es efimero y esta pensado para desarrollo o demo

Para iniciar el entorno completo:

```bash
docker compose up --build
```

Tambien puedes usar `just` desde la raiz del repositorio:

```bash
just up
```

Para detenerlo:

```bash
docker compose down
```

Comandos utiles con `just`:

- `just frontend-env` crea `frontend/.env` desde `frontend/.env.example`
- `just down` detiene el entorno
- `just restart` reinicia el entorno completo
- `just logs` sigue los logs de Compose
- `just ps` muestra el estado de los contenedores

Notas:

- este entorno es solo para desarrollo local y evidencia de presentacion
- produccion no corre en contenedores Docker
- produccion se despliega en Cloudflare Workers para backend y Cloudflare Pages para frontend
- el backend local usa la configuracion actual basada en Wrangler, D1 y R2
- no se requiere Postgres ni MinIO para el flujo local soportado por el codigo actual

---
Para instrucciones especificas sobre dependencias, configuracion o ejecucion local de cada aplicacion o servicio, consulta la documentacion dentro de `frontend`, `services/products` y `services/orders`.
