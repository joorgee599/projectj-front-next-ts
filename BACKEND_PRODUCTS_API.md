# 📘 Guía de Endpoints - API de Productos

## Base URL
```
http://localhost:8080/api/v1/products
```

## Endpoints Disponibles

### 1. 📝 Crear Producto
**POST** `/api/v1/products`

**Request Body:**
```json
{
  "name": "Laptop HP Pavilion",
  "description": "Laptop con procesador Intel i7, 16GB RAM",
  "code": "LP-001",
  "price": 899.99,
  "image": "https://example.com/image.jpg",
  "categoryId": 1,
  "brandId": 2,
  "status": 1,
  "stock": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Laptop HP Pavilion",
    "description": "Laptop con procesador Intel i7, 16GB RAM",
    "code": "LP-001",
    "price": 899.99,
    "image": "https://example.com/image.jpg",
    "categoryId": 1,
    "categoryName": "Electronics",
    "brandId": 2,
    "brandName": "HP",
    "status": 1,
    "stock": 50,
    "createdAt": "2026-03-16T10:30:00",
    "updatedAt": "2026-03-16T10:30:00"
  }
}
```

---

### 2. 📋 Listar Todos los Productos
**GET** `/api/v1/products`

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Laptop HP Pavilion",
      "description": "Laptop con procesador Intel i7",
      "code": "LP-001",
      "price": 899.99,
      "image": "https://example.com/image.jpg",
      "categoryId": 1,
      "categoryName": "Electronics",
      "brandId": 2,
      "brandName": "HP",
      "status": 1,
      "stock": 50,
      "createdAt": "2026-03-16T10:30:00",
      "updatedAt": "2026-03-16T10:30:00"
    }
  ]
}
```

---

### 3. 🔍 Obtener Producto por ID
**GET** `/api/v1/products/{id}`

**Ejemplo:** `GET /api/v1/products/1`

**Response:**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "name": "Laptop HP Pavilion",
    "description": "Laptop con procesador Intel i7",
    "code": "LP-001",
    "price": 899.99,
    "image": "https://example.com/image.jpg",
    "categoryId": 1,
    "categoryName": "Electronics",
    "brandId": 2,
    "brandName": "HP",
    "status": 1,
    "stock": 50,
    "createdAt": "2026-03-16T10:30:00",
    "updatedAt": "2026-03-16T10:30:00"
  }
}
```

---

### 4. ✏️ Actualizar Producto
**PUT** `/api/v1/products/{id}`

**Request Body:**
```json
{
  "name": "Laptop HP Pavilion UPDATED",
  "description": "Nueva descripción",
  "code": "LP-001-V2",
  "price": 999.99,
  "image": "https://example.com/new-image.jpg",
  "categoryId": 1,
  "brandId": 2,
  "status": 1,
  "stock": 45
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "name": "Laptop HP Pavilion UPDATED",
    // ... resto de campos actualizados
  }
}
```

---

### 5. 🗑️ Eliminar Producto
**DELETE** `/api/v1/products/{id}`

**Ejemplo:** `DELETE /api/v1/products/1`

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación con JWT:

```
Authorization: Bearer {tu_token}
```

---

## 📊 Códigos de Estado

- `200 OK` - Operación exitosa (GET, PUT, DELETE)
- `201 Created` - Producto creado exitosamente
- `400 Bad Request` - Datos inválidos
- `401 Unauthorized` - Token inválido o expirado
- `404 Not Found` - Producto no encontrado
- `500 Internal Server Error` - Error del servidor

---

## 📝 Validaciones

### Campos Requeridos:
- `name` - No puede estar vacío
- `code` - No puede estar vacío
- `price` - Debe ser un número positivo
- `categoryId` - Requerido
- `brandId` - Requerido

### Campos Opcionales:
- `description`
- `image`
- `status` - Default: 1 (activo)
- `stock` - Default: 0

---

## 🧪 Ejemplos con cURL

### Crear producto:
```bash
curl -X POST http://localhost:8080/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Mouse Logitech",
    "code": "M-001",
    "price": 29.99,
    "categoryId": 1,
    "brandId": 3,
    "stock": 100
  }'
```

### Listar productos:
```bash
curl -X GET http://localhost:8080/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Actualizar producto:
```bash
curl -X PUT http://localhost:8080/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Mouse Logitech UPDATED",
    "code": "M-001",
    "price": 34.99,
    "categoryId": 1,
    "brandId": 3,
    "stock": 95
  }'
```

### Eliminar producto:
```bash
curl -X DELETE http://localhost:8080/api/v1/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚀 Swagger UI

Puedes probar los endpoints visualmente en:
```
http://localhost:8080/swagger-ui.html
```
