# 09. APM y Observabilidad

## Enfoque general

La arquitectura final del proyecto se apoya en **Cloudflare Observability** como mecanismo de monitoreo tipo APM para los componentes desplegados en Cloudflare.

En este contexto, la observabilidad no se limita a verificar si un servicio responde, sino a entender:

- que solicitudes recibe;
- cuanto tardan;
- que errores se presentan;
- como se comporta la ejecucion en el runtime serverless.

## Logs

Los logs permiten registrar eventos relevantes de ejecucion.

En la implementacion actual de los Workers:

- existe middleware de logging por solicitud;
- se registra `requestId`, metodo, ruta, estado y duracion;
- el manejo centralizado de errores envia informacion diagnostica a `console.error`.

Estos eventos son el punto de partida para el analisis operativo dentro del ecosistema Cloudflare.

## Traces

Las trazas ayudan a entender el recorrido de una solicitud.

En este proyecto son especialmente utiles para seguir interacciones como:

1. frontend llama al servicio de pedidos;
2. pedidos consulta al servicio de productos;
3. pedidos persiste la orden;
4. productos actualiza inventario;
5. el sistema devuelve una respuesta final al cliente.

Aunque la instrumentacion avanzada puede evolucionar en futuras fases, el modelo de Workers y la observabilidad de Cloudflare permiten analizar este tipo de recorridos de forma mas natural que en un despliegue manual basado en servidores.

## Errores

La deteccion de errores es fundamental para el soporte operativo.

El proyecto incorpora:

- manejo centralizado de excepciones en ambos Workers;
- respuestas estructuradas con codigo y `requestId`;
- separacion entre errores funcionales y errores internos.

Esto permite correlacionar fallas reportadas por el usuario con eventos tecnicos observables.

## Metricas de solicitudes

Cloudflare Observability permite revisar comportamiento por solicitud, por ejemplo:

- volumen de peticiones;
- codigos de respuesta;
- latencia;
- errores por ruta;
- comportamiento por ambiente.

Estas metricas son utiles para demostrar estabilidad, actividad y salud del sistema durante la presentacion final.

## CPU time

En Cloudflare Workers, una metrica importante es el **CPU time**, ya que indica el tiempo efectivo de procesamiento consumido por la logica del Worker.

Esto es relevante para:

- identificar operaciones costosas;
- evaluar impacto de consultas a D1;
- revisar el costo de validaciones y coordinacion entre servicios;
- justificar optimizaciones futuras.

## Sobre memoria en un runtime serverless

En esta arquitectura no se observa la memoria de la misma forma que en una VM o un contenedor tradicional.

Esto ocurre porque:

- Cloudflare Workers abstrae gran parte de la infraestructura de ejecucion;
- el enfoque operativo se centra mas en solicitudes, errores, duracion y CPU;
- el modelo no expone el mismo tipo de metricas de proceso que un servidor autogestionado.

Por ello, no se debe prometer monitoreo de memoria al estilo de Docker, Kubernetes o una maquina virtual si la plataforma no lo expone del mismo modo.

## Metricas locales con Docker

Durante el desarrollo local, Docker puede utilizarse como evidencia complementaria para observar:

- estado de contenedores;
- puertos expuestos;
- logs de ejecucion;
- consumo local aproximado.

Sin embargo, estas metricas solo sirven como evidencia de desarrollo o presentacion local. No sustituyen la observabilidad real de produccion sobre Cloudflare Workers y Pages.

## Valor para el proyecto

La observabilidad aporta una capa importante de madurez DevOps porque permite:

- detectar incidentes;
- explicar comportamiento del sistema durante la demo;
- justificar decisiones tecnicas;
- mostrar que el proyecto no solo se despliega, sino que tambien puede operarse.
