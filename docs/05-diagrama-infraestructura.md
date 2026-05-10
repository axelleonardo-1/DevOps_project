# 05. Diagrama de Infraestructura

El siguiente diagrama resume la arquitectura objetivo y la forma en que los componentes principales interactuan dentro del ecosistema Cloudflare.

```mermaid
flowchart LR
    U[Usuario]
    DNS[Cloudflare DNS]
    PAGES[Cloudflare Pages Frontend]
    PW[Products Worker]
    OW[Orders Worker]
    D1DEV[(D1 Dev)]
    D1PROD[(D1 Prod)]
    R2DEV[(R2 Dev Images)]
    R2PROD[(R2 Prod Images)]
    OBS[Cloudflare Observability]
    TF[Terraform]
    GHA[GitHub Actions + Wrangler]

    U --> DNS --> PAGES
    PAGES --> PW
    PAGES --> OW
    OW --> PW

    PW --> D1DEV
    OW --> D1DEV
    PW --> D1PROD
    OW --> D1PROD

    PW --> R2DEV
    PW --> R2PROD

    PW --> OBS
    OW --> OBS
    PAGES --> OBS

    TF --> D1DEV
    TF --> D1PROD
    TF --> R2DEV
    TF --> R2PROD

    GHA --> PAGES
    GHA --> PW
    GHA --> OW
```

## Explicacion del diagrama

- **Cloudflare DNS** dirige el trafico hacia el frontend y los servicios expuestos.
- **Cloudflare Pages** aloja la SPA construida con Vue y Vite.
- **Products Worker** y **Orders Worker** ejecutan la logica backend con Hono.
- **D1 Dev/Prod** representan la persistencia de datos por ambiente.
- **R2 Dev/Prod** representan el almacenamiento de imagenes de productos cuando esta habilitado.
- **Cloudflare Observability** centraliza telemetria de ejecucion.
- **Terraform** crea o documenta la infraestructura base.
- **GitHub Actions + Wrangler** despliega el codigo de aplicacion.

## Observacion de diseño

En una implementacion empresarial completa, podria existir una separacion mas estricta entre recursos dev y prod en el diagrama operativo diario. Para fines academicos y de presentacion, se muestran ambos ambientes en una sola vista para explicar con claridad la topologia objetivo del proyecto.
