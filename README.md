
# Catálogo Semillero

Proyecto correspondiente al módulo Frontend 03 del semillero.

Aplicación realizada con Angular 17 para mostrar un catálogo de productos mediante componentes standalone.

## Requisitos

- Node.js 20
- npm
ng - Angular CLI 17

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

## Ejecutar el proyecto

```bash
npx ng serve
```

Luego abrir en el navegador:

http://localhost:4200

## Funcionalidades

- Vista de cliente con tarjetas de productos.
- Vista de administrador con tabla de productos.
- Cambio entre roles admin y customer.
- Filtro por categoría.
- Carrito con cantidad de productos y total.
- Productos agotados.
- Uso de signals y computed.
- Comunicación entre componentes mediante Input y Output.

## Compilar

```bash
npx ng build
```

## Taller 02 — Servicios, DI y HttpClient

- Productos y categorías obtenidos de la API mediante servicios.
- Filtro por categoría y operaciones de productos.
- Carrito con signals y persistencia en LocalStorage.

## Taller 03 — Routing, guards y lazy loading

- Navegación con rutas y menú.
- `/productos`: catálogo con filtros en la URL.
- `/productos/:id`: detalle de producto y relacionados.
- `/carrito`: carrito protegido por inicio de sesión.
- `/login`: inicio de sesión simulado.
- `/admin`: panel de administración protegido.
- Carga diferida de pantallas y protección de cambios sin guardar.

Para probar el inicio de sesión simulado, utiliza la clave `wposs123`. El usuario `admin` accede al panel de administración.

