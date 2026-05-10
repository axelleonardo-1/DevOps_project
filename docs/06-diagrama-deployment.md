# 06. Diagrama de Deployment

El despliegue del proyecto sigue una estrategia basada en ramas, pipelines automáticos y aprobacion manual para produccion.

```mermaid
flowchart TD
    FB[feature/*]
    PR[Pull Request]
    CI[CI Validation]
    DEV[develop]
    DEVPIPE[Dev Pipeline]
    DEVDEPLOY[Deploy Development]
    MAIN[main]
    APPROVAL[Manual Approval<br/>GitHub Environment production]
    PRODPIPE[Production Pipeline]
    PRODDEPLOY[Deploy Production]

    FB --> PR
    PR --> CI
    CI --> DEV
    DEV --> DEVPIPE
    DEVPIPE --> DEVDEPLOY
    DEV --> PR
    PR --> MAIN
    MAIN --> APPROVAL
    APPROVAL --> PRODPIPE
    PRODPIPE --> PRODDEPLOY
```

## Interpretacion

- Las ramas `feature/*` generan cambios aislados para nuevas funciones o ajustes.
- El `pull request` dispara validaciones automáticas.
- Al integrar en `develop`, se habilitan despliegues al ambiente de desarrollo.
- Al integrar en `main`, se prepara el despliegue de produccion.
- La aprobacion manual en el entorno `production` evita cambios no revisados en produccion.

## Relacion con los workflows actuales

El repositorio contiene pipelines separados para:

- frontend;
- products;
- orders;
- Terraform;
- construccion y publicacion de imagenes Docker.

Todos siguen la misma idea general: validar primero, desplegar despues y proteger produccion con aprobacion manual.
