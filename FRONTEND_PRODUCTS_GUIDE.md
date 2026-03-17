# 🚀 Guía Completa - Sistema de Productos

## ✅ Implementación Completada

### Backend (Java Spring Boot)
Ya está implementado con todos los endpoints CRUD:
- ✅ `POST /api/v1/products` - Crear producto
- ✅ `GET /api/v1/products` - Listar todos
- ✅ `GET /api/v1/products/{id}` - Obtener por ID
- ✅ `PUT /api/v1/products/{id}` - Actualizar
- ✅ `DELETE /api/v1/products/{id}` - Eliminar

### Frontend (Next.js/TypeScript)
Recién implementado con funcionalidad completa:
- ✅ Tabla de productos con información detallada
- ✅ Modal para crear/editar productos
- ✅ Eliminación con confirmación
- ✅ Validaciones de formulario
- ✅ Estados de carga
- ✅ Formateo de precios
- ✅ Indicadores de stock (colores)
- ✅ Estados activo/inactivo
- ✅ Diseño responsive

---

## 📁 Archivos Creados

### Tipos TypeScript
```
src/modules/products/types/product.types.ts
```
Define las interfaces de Product, ProductRequest y ProductResponse.

### Servicio API
```
src/modules/products/services/product.service.ts
```
Conecta con el backend Java usando apiClient.

### Componentes
```
src/modules/products/components/ProductModal.tsx
src/modules/products/components/ProductModal.module.css
```
Modal reutilizable para crear/editar productos con validaciones.

### Página Principal
```
src/app/dashboard/products/page.tsx
src/app/dashboard/products/page.module.css
```
Vista principal con tabla de productos y acciones CRUD.

### Documentación
```
BACKEND_PRODUCTS_API.md
```
Guía completa de los endpoints del backend.

---

## 🎯 Funcionalidades

### 1. Listar Productos
- Tabla con columnas: Imagen, Producto (nombre + código), Categoría, Marca, Precio, Stock, Estado, Acciones
- Indicadores de stock con colores:
  - 🟢 Verde: Stock normal (>= 10)
  - 🟠 Naranja: Stock bajo (< 10)
  - 🔴 Rojo: Sin stock (0)
- Formato de precio en USD
- Estados: Activo/Inactivo

### 2. Crear Producto
Click en "Nuevo Producto" abre un modal con:
- **Campos requeridos**: Nombre, Código, Precio
- **Campos opcionales**: Descripción, Imagen, Stock
- **Selectores**: Categoría, Marca, Estado
- Validaciones en tiempo real
- Mensajes de error claros

### 3. Editar Producto
Click en el botón ✏️ abre el modal con datos pre-cargados.

### 4. Eliminar Producto
Click en el botón 🗑️ muestra confirmación antes de eliminar.

---

## 🚀 Cómo Usar

### 1. Inicia el Backend Java
```bash
cd c:\Proyectos\projectj_java
mvn spring-boot:run
```
Backend corriendo en: `http://localhost:8080`

### 2. Inicia el Frontend
```bash
cd c:\Proyectos\projectj-front-next-ts
npm run dev
```
Frontend corriendo en: `http://localhost:3000`

### 3. Navega a Productos
1. Haz login en la aplicación
2. En el sidebar, click en "📦 Productos"
3. La tabla cargará automáticamente los productos

### 4. Crear un Producto
1. Click en "Nuevo Producto"
2. Completa el formulario:
   - Nombre: "Laptop Dell Inspiron"
   - Código: "LP-002"
   - Precio: 1299.99
   - Descripción: "Laptop gaming con RTX 3060"
   - Categoría: Selecciona una
   - Marca: Selecciona una
   - Stock: 25
3. Click en "Crear Producto"

### 5. Editar un Producto
1. En la tabla, click en el botón ✏️ del producto
2. Modifica los campos que desees
3. Click en "Actualizar"

### 6. Eliminar un Producto
1. En la tabla, click en el botón 🗑️ del producto
2. Confirma en el diálogo
3. El producto se eliminará de la tabla

---

## 📊 Estructura del Producto

```typescript
{
  id: number;              // Autoincremental
  name: string;            // Nombre del producto
  description?: string;    // Descripción opcional
  code: string;            // Código único
  price: number;           // Precio decimal
  image?: string;          // URL de imagen
  categoryId: number;      // ID de categoría
  categoryName?: string;   // Nombre de categoría (solo lectura)
  brandId: number;         // ID de marca
  brandName?: string;      // Nombre de marca (solo lectura)
  status: number;          // 1: Activo, 0: Inactivo
  stock: number;           // Cantidad en inventario
  createdAt?: string;      // Fecha de creación
  updatedAt?: string;      // Fecha de actualización
}
```

---

## 🔐 Autenticación

Todos los requests al backend incluyen automáticamente el token JWT del localStorage:

```typescript
Authorization: Bearer {token}
```

El servicio `apiClient` maneja esto automáticamente.

---

## 🎨 Personalización

### Cambiar Categorías/Marcas
Edita el select en `ProductModal.tsx`:

```typescript
<select name="categoryId">
  <option value={1}>Tu Categoría 1</option>
  <option value={2}>Tu Categoría 2</option>
</select>
```

### Validaciones Personalizadas
Edita la función `validate()` en `ProductModal.tsx`:

```typescript
const validate = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  // Agrega tus validaciones aquí
  if (formData.stock < 0) {
    newErrors.stock = 'El stock no puede ser negativo';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Estilos
Todos los estilos están en archivos `.module.css` usando CSS Modules.

---

## 🐛 Troubleshooting

### Error: Failed to fetch
- Verifica que el backend Java esté corriendo en puerto 8080
- Verifica la variable `NEXT_PUBLIC_API_URL` en `.env.local`

### Error: 401 Unauthorized
- Tu token expiró, haz login nuevamente
- Verifica que el token se esté guardando en localStorage

### Error: 400 Bad Request
- Verifica que todos los campos requeridos estén completos
- Revisa las validaciones del backend

### La tabla no carga productos
- Abre DevTools (F12) > Network para ver los requests
- Verifica que la respuesta del backend tenga el formato correcto
- Chequea la consola por errores de JavaScript

---

## 📚 Próximos Pasos

### Mejoras Sugeridas:
1. **Paginación**: Agregar paginación para largas listas
2. **Búsqueda**: Filtro por nombre/código
3. **Ordenamiento**: Click en columnas para ordenar
4. **Categorías Dinámicas**: Cargar desde API
5. **Upload de Imágenes**: Subir archivos en lugar de URLs
6. **Validación de Código Único**: Check en tiempo real
7. **Vista de Detalles**: Modal con información completa
8. **Exportar a Excel/PDF**: Generar reportes
9. **Historial de Cambios**: Auditoría de modificaciones
10. **Múltiples Imágenes**: Galería de imágenes por producto

---

## 📝 Notas Importantes

- Los IDs de categoría y marca deben existir en el backend
- El código del producto debe ser único
- El precio debe ser mayor a 0
- Las imágenes son URLs (HTTP/HTTPS)
- El stock puede ser 0 (sin stock)
- Status: 1 = Activo, 0 = Inactivo

---

## ✅ Checklist de Testing

- [ ] Crear un producto nuevo
- [ ] Editar el producto creado
- [ ] Eliminar el producto
- [ ] Validar campos requeridos (dejar vacío)
- [ ] Validar precio negativo
- [ ] Verificar indicadores de stock
- [ ] Probar en móvil/responsive
- [ ] Cerrar sesión y verificar que redirija al login
- [ ] Verificar formato de precio USD

---

¡Sistema de productos completamente funcional! 🎉
