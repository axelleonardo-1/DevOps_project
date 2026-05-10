# 04. Diagrama de Clases

El siguiente diagrama representa las entidades y responsabilidades principales alineadas con la implementacion actual. Aunque el proyecto esta escrito en JavaScript modular y no en clases de dominio completas, el diagrama abstrae la estructura real de controladores y repositorios.

```mermaid
classDiagram
    class Product {
      +string productId
      +string name
      +string description
      +number price
      +string currency
      +string category
      +number stock
      +boolean isActive
      +string imageKey
      +string imageUrl
      +string createdAt
      +string updatedAt
    }

    class Order {
      +string orderId
      +string userId
      +string customerName
      +string customerEmail
      +string status
      +number subtotal
      +number total
      +string currency
      +string createdAt
      +string updatedAt
      +OrderItem[] items
    }

    class OrderItem {
      +string productId
      +number price
      +number quantity
      +number total
    }

    class ProductRepository {
      +list(filters)
      +getById(productId)
      +create(productInput)
      +update(productId, updates)
      +updateStock(productId, stock)
    }

    class OrderRepository {
      +list()
      +getById(orderId)
      +create(orderInput)
      +updateStatus(orderId, status)
      +delete(orderId)
    }

    class ProductController {
      +getProducts()
      +getProductById()
      +createProduct()
      +updateProduct()
      +updateProductStock()
      +getProductImage()
    }

    class OrderController {
      +getOrders()
      +getOrderById()
      +createOrder()
      +updateOrderStatus()
      +deleteOrder()
    }

    ProductController --> ProductRepository : uses
    OrderController --> OrderRepository : uses
    OrderController --> ProductController : queries stock indirectly

    Order "1" *-- "many" OrderItem
```

## Relacion con el codigo implementado

- `ProductController` corresponde conceptualmente a las funciones definidas en `services/products/src/routes/products.routes.js`.
- `OrderController` corresponde conceptualmente a las funciones definidas en `services/orders/src/routes/orders.routes.js`.
- `ProductRepository` se implementa en `services/products/src/repositories/products.repository.js`.
- `OrderRepository` se implementa en `services/orders/src/repositories/orders.repository.js`.
- `Product`, `Order` y `OrderItem` reflejan las estructuras que circulan entre rutas, validaciones y persistencia D1.
