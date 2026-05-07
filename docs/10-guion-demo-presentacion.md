# 10. Guion Demo Presentacion

## Objetivo del demo

El objetivo de la presentacion es demostrar que el proyecto no solo funciona como aplicacion de ecommerce, sino que tambien incorpora una practica completa de DevOps con CI/CD, infraestructura como codigo, despliegue cloud-native y evidencia operativa.

## Recomendacion general

Conviene seguir un orden de menor a mayor nivel tecnico:

1. mostrar el problema y la solucion;
2. mostrar el sistema funcionando;
3. mostrar la arquitectura;
4. mostrar la automatizacion;
5. cerrar con infraestructura y observabilidad.

## Paso 1. Presentar el repositorio

Mostrar en GitHub:

- estructura del monorepo;
- carpetas `frontend`, `services/products`, `services/orders`, `infra/terraform` y `docs`;
- workflows en `.github/workflows`;
- documentacion del proyecto en `docs/`.

Si el curso o la evaluacion mencionan Azure DevOps, se puede explicar con honestidad que la automatizacion implementada en este proyecto se encuentra en GitHub Actions, y que GitHub cumple aqui el rol principal de repositorio y CI/CD.

## Paso 2. Explicar el problema de negocio

Explicar brevemente:

- el sistema permite consultar productos;
- permite crear pedidos;
- mantiene inventario y estado de orden;
- se migraron conceptos AWS a una arquitectura nativa de Cloudflare.

## Paso 3. Mostrar la aplicacion funcionando localmente

Abrir terminal y mostrar:

```bash
docker compose up --build
```

Luego mostrar en navegador:

- frontend en `http://localhost:5173`;
- catalogo de productos;
- detalle de producto;
- carrito;
- creacion de pedido;
- consulta de pedidos.

Si el tiempo lo permite, mostrar tambien logs de los servicios durante una operacion.

## Paso 4. Mostrar la separacion por servicios

Explicar que:

- `services/products` expone el catalogo y maneja stock;
- `services/orders` valida productos y persiste pedidos;
- el frontend consume ambos servicios mediante variables de entorno.

Se puede apoyar esta parte con los diagramas Mermaid incluidos en `docs/03`, `docs/05` y `docs/06`.

## Paso 5. Mostrar Cloudflare

Dentro del panel de Cloudflare, mostrar segun disponibilidad del entorno:

- Workers de productos y pedidos;
- Pages del frontend;
- base de datos D1 de desarrollo y produccion;
- bucket R2 de imagenes, si aplica;
- seccion de Observability con logs, errores o metricas.

No es necesario mostrar URLs reales en la documentacion; basta con navegar en el panel y describir cada recurso.

## Paso 6. Mostrar pipelines en GitHub Actions

Ir a la pestaña de Actions y mostrar:

- `frontend-ci-cd.yml`
- `products-ci-cd.yml`
- `orders-ci-cd.yml`
- `terraform.yml`
- `docker-build.yml`

Explicar:

- que validaciones corren en pull request;
- que `develop` despliega a desarrollo;
- que `main` prepara despliegues de produccion;
- que produccion requiere aprobacion manual mediante GitHub Environments.

## Paso 7. Mostrar Docker Hub

Mostrar el repositorio o los repositorios de Docker Hub y explicar:

- no se usan para produccion;
- se usan como evidencia de artefactos;
- las imagenes se etiquetan por rama, SHA corto y `latest` en `main`.

Esto demuestra integracion entre codigo fuente y publicacion de artefactos.

## Paso 8. Mostrar Terraform

Entrar a `infra/terraform` y explicar:

- `main.tf`
- `variables.tf`
- `outputs.tf`
- `versions.tf`
- `terraform.tfvars.example`

Mostrar que Terraform se usa para describir:

- D1 dev y prod;
- R2 dev y prod, si esta habilitado;
- placeholders documentados para recursos desplegados por CI/CD.

Si es conveniente, mostrar tambien:

```bash
terraform fmt
terraform validate
terraform plan
```

## Paso 9. Mostrar observabilidad

Explicar que Cloudflare Observability permite revisar:

- logs;
- trazas;
- errores;
- metricas de solicitudes;
- CPU time.

Subrayar que el modelo serverless no expone memoria igual que una VM o contenedor tradicional, por lo que la lectura operacional debe enfocarse en telemetria propia del runtime.

## Paso 10. Cierre tecnico

Cerrar la presentacion resaltando:

- migracion de una arquitectura orientada a AWS hacia Cloudflare-native;
- separacion limpia entre frontend, productos y pedidos;
- uso de Hono y Workers para backend;
- persistencia en D1 y almacenamiento opcional en R2;
- automatizacion con GitHub Actions;
- IaC con Terraform;
- soporte local con Docker Compose;
- evidencia de artefactos con Docker Hub.

## Mensaje final sugerido

Como cierre, puede usarse una idea similar a esta:

> El proyecto no solo implementa una aplicacion funcional de ecommerce, sino que demuestra un flujo completo de ingenieria moderna: desarrollo, versionado, automatizacion, despliegue cloud-native, infraestructura como codigo y observabilidad.
