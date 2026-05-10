# 08. Pipelines

## Vision general

El proyecto incluye varios workflows en GitHub Actions para cubrir validacion, despliegue e impresion de evidencia tecnica.

Los pipelines actuales son:

- `frontend-ci-cd.yml`
- `products-ci-cd.yml`
- `orders-ci-cd.yml`
- `terraform.yml`
- `docker-build.yml`

## Pipeline del frontend

El pipeline del frontend realiza las siguientes actividades:

1. instala dependencias;
2. ejecuta lint si existe;
3. ejecuta pruebas si existen;
4. construye la aplicacion;
5. despliega a Cloudflare Pages en `develop`;
6. despliega a Cloudflare Pages en `main`.

### Ambientes

- `develop` despliega al entorno de desarrollo;
- `main` despliega al entorno de produccion;
- produccion queda protegida por aprobacion manual en GitHub Environments.

## Pipeline del servicio de productos

El pipeline de `services/products` realiza:

1. instalacion de dependencias;
2. lint si existe;
3. ejecucion de pruebas unitarias;
4. build o typecheck si existieran;
5. despliegue del Worker en `develop`;
6. despliegue del Worker en `main`.

El despliegue se realiza con Wrangler hacia Cloudflare Workers.

## Pipeline del servicio de pedidos

El pipeline de `services/orders` sigue el mismo patron:

1. instalacion de dependencias;
2. lint si existe;
3. pruebas unitarias;
4. build o typecheck si existieran;
5. despliegue a desarrollo;
6. despliegue a produccion.

Tambien utiliza Wrangler como mecanismo de despliegue.

## Pipeline de Terraform

El pipeline `terraform.yml` opera sobre `infra/terraform` y contempla:

1. `terraform fmt -check`;
2. `terraform init`;
3. `terraform validate`;
4. `terraform plan` en pull requests;
5. `terraform plan` en `develop`;
6. `terraform apply` solo desde `main`.

Este pipeline mantiene la infraestructura alineada con el control de cambios del repositorio.

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

- la rama `main` desencadena los jobs de produccion;
- GitHub Environment `production` se usa para aprobacion manual;
- esto aplica a frontend, Workers y Terraform.

## Valor academico y practico

La existencia de pipelines separados aporta claridad durante la presentacion:

- se puede mostrar validacion por componente;
- se puede explicar IaC por separado;
- se puede evidenciar trazabilidad de imagenes Docker;
- se demuestra un flujo de DevOps coherente de punta a punta.
