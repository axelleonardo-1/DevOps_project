# 07. Estrategia de Ramas

## Ramas principales

La estrategia de ramas definida para el proyecto se basa en cuatro tipos:

### `main`

Representa la version estable del sistema. Todo cambio que llegue a esta rama debe estar validado y listo para produccion.

Caracteristicas:

- dispara despliegues de produccion;
- requiere aprobacion manual mediante GitHub Environment `production`;
- concentra el estado final demostrable del proyecto.

### `develop`

Representa la rama de integracion continua para el equipo.

Caracteristicas:

- recibe cambios ya revisados desde ramas de funcionalidad;
- dispara despliegues hacia el ambiente de desarrollo;
- permite validar integracion entre frontend, products y orders antes de promover a `main`.

### `feature/*`

Se utiliza para nuevas funcionalidades, mejoras y cambios evolutivos.

Ejemplos:

- `feature/cloudflare-d1`
- `feature/frontend-env-config`
- `feature/r2-product-images`

Cada rama de este tipo debe nacer desde `develop` y volver mediante `pull request`.

### `hotfix/*`

Se utiliza para correcciones urgentes.

Caracteristicas:

- permite atender defectos prioritarios;
- puede orientarse a estabilizar `main` cuando existe una incidencia;
- debe reincorporarse al flujo normal para evitar divergencia entre ramas.

## Flujo de aprobacion por Pull Request

El flujo recomendado es el siguiente:

1. Crear una rama `feature/*` o `hotfix/*`.
2. Implementar el cambio y subir commits.
3. Abrir un `pull request` hacia `develop` o `main`, segun el caso.
4. Ejecutar pipelines automáticos de validacion.
5. Revisar resultados de pruebas, build, Terraform o Docker segun corresponda.
6. Aprobar el `pull request`.
7. Integrar el cambio.

## Justificacion de la estrategia

Esta estrategia fue seleccionada porque ofrece equilibrio entre simplicidad y control:

- es facil de explicar en una presentacion academica;
- separa claramente integracion continua y produccion;
- permite automatizar despliegues de `develop` y proteger `main`;
- facilita la colaboracion del equipo sin imponer una gobernanza excesivamente compleja.

## Beneficios para DevOps

- mejora trazabilidad de cambios;
- favorece revisiones de codigo;
- reduce riesgo de despliegues accidentales;
- alinea ramas con ambientes reales de despliegue;
- aporta evidencia clara del proceso de entrega continua.
