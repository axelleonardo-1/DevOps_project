# Proyecto E-Commerce (Arquitectura de Microservicios)

Este repositorio contiene el código fuente de una plataforma de comercio electrónico basada en una arquitectura de microservicios. El proyecto está diseñado para separar las responsabilidades principales de la aplicación en componentes y servicios independientes que trabajan en conjunto.

## Componentes del Proyecto

El proyecto está dividido en 3 directorios principales, cada uno representando una pieza fundamental del sistema:

### 1. Interfaz de Usuario (`ecommerce-frontend-main`)
Este directorio contiene la aplicación frontend que interactúa directamente con el cliente final. Es la capa de presentación que permite a los usuarios navegar por el catálogo, ver los detalles de los productos e iniciar el proceso de compra. Se encarga de hacer las peticiones necesarias a los servicios de backend para mostrar la información actualizada.

### 2. Servicio de Productos (`ecommerce-products-service-main`)
Este es el microservicio encargado de gestionar el catálogo de la tienda. Centraliza toda la información relacionada con los artículos disponibles, incluyendo nombres, descripciones, precios e inventario. El frontend interactúa con este servicio para poblar la vista principal y las páginas de detalles de los productos.

### 3. Servicio de Pedidos (`ecommerce-orders-service-main`)
Este microservicio asume la responsabilidad de gestionar las transacciones de compra. Maneja el ciclo de vida de las órdenes de los clientes: recibe la solicitud de compra, la procesa y registra su estado.

---
*Nota: Para instrucciones específicas sobre dependencias, configuración o ejecución local de cada servicio, consulta la documentación interna dentro de cada subdirectorio.*
