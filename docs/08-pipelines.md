# 08. Pipelines

## Vision general

El proyecto incluye varios workflows en GitHub Actions para cubrir validacion, despliegue e impresion de evidencia tecnica.

Los pipelines actuales son:

- `frontend-ci-cd.yml`
- `products-ci-cd.yml`
- `orders-ci-cd.yml`
- `terraform.yml`
- `release-main.yml`
- `docker-build.yml`

## Pipeline del frontend

El pipeline del frontend realiza las siguientes actividades:

1. instala dependencias;
2. ejecuta lint si existe;
3. ejecuta pruebas si existen;
4. construye la aplicacion;
5. despliega a Cloudflare Pages en `develop`.

### Ambientes

- `develop` despliega al entorno de desarrollo;
- `main` valida cambios y delega el despliegue productivo al workflow orquestador `release-main.yml`;
- produccion queda protegida por aprobacion manual en GitHub Environments.

## Pipeline del servicio de productos

El pipeline de `services/products` realiza:

1. instalacion de dependencias;
2. lint si existe;
3. ejecucion de pruebas unitarias;
4. build o typecheck si existieran;
5. despliegue del Worker en `develop`.

El despliegue se realiza con Wrangler hacia Cloudflare Workers. En `main`, el despliegue productivo queda a cargo de `release-main.yml` para poder encadenar infraestructura, Workers y frontend.

## Pipeline del servicio de pedidos

El pipeline de `services/orders` sigue el mismo patron:

1. instalacion de dependencias;
2. lint si existe;
3. pruebas unitarias;
4. build o typecheck si existieran;
5. despliegue a desarrollo.

Tambien utiliza Wrangler como mecanismo de despliegue. En `main`, el despliegue productivo queda a cargo de `release-main.yml` para que pueda recibir la URL real del servicio de productos.

## Pipeline de Terraform

El pipeline `terraform.yml` opera sobre `infra/terraform` y contempla:

1. `terraform fmt -check`;
2. `terraform init`;
3. `terraform validate`;
4. `terraform plan` en pull requests;
5. `terraform plan` en `develop`.

Este pipeline mantiene la infraestructura alineada con el control de cambios del repositorio.

## Workflow orquestador de produccion

El workflow `release-main.yml` concentra el flujo productivo de punta a punta:

1. ejecuta `terraform apply` en `main`;
2. despliega `products`;
3. captura la URL publicada de `products`;
4. despliega `orders` usando esa URL;
5. captura la URL publicada de `orders`;
6. construye y despliega `frontend` con ambas URLs reales.

Este flujo evita depender de secrets manuales para las URLs productivas entre componentes.

## Workflow de Docker Hub

El workflow `docker-build.yml` construye imagenes para:

- frontend;
- products;
- orders.

Comportamiento:

- en `pull_request`, valida que la construccion funcione sin publicar imagenes;
- en `push` a `develop` y `main`, publica imagenes en Docker Hub;
- etiqueta por rama, SHA corto y `latest` en `main`.

## Aprobaciones Dev y Prod

### Desarrollo

Los despliegues de desarrollo son automáticos al integrar en `develop`. Esto acelera la retroalimentacion y facilita validaciones funcionales tempranas.

### Produccion

Los despliegues de produccion requieren proteccion adicional:

- la rama `main` desencadena el workflow `release-main.yml`;
- GitHub Environment `production` se usa para aprobacion manual;
- esto aplica al orquestador productivo que ejecuta Terraform, Workers y frontend en secuencia.

## Valor academico y practico

La existencia de pipelines separados aporta claridad durante la presentacion:

- se puede mostrar validacion por componente;
- se puede explicar IaC por separado;
- se puede evidenciar trazabilidad de imagenes Docker;
- se demuestra un flujo de DevOps coherente de punta a punta.
