# Catálogo Semillero

Proyecto desarrollado con Angular 17 como parte del semillero de desarrollo Frontend.

La aplicación permite consultar productos, filtrarlos por categoría, gestionar un carrito de compras y administrar productos mediante un sistema de autenticación con JWT y roles.

## Aplicación publicada

**Enlace:** https://catalogo-semillero-ebon.vercel.app/

**Repositorio:** https://github.com/kguerrero25-DOT/catalogo-semillero

## Tecnologías utilizadas

- Angular 17
- TypeScript
- Angular Material
- Angular Router
- Reactive Forms
- HttpClient
- RxJS
- Signals
- API REST
- JWT
- Vercel

## Requisitos

- Node.js 20
- npm
- Angular CLI 17

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/kguerrero25-DOT/catalogo-semillero.git
```

Entrar a la carpeta del proyecto:

```bash
cd catalogo-semillero
```

Instalar las dependencias:

```bash
npm install
```

## Ejecutar el proyecto

```bash
npx ng serve --port 4300
```

Abrir en el navegador:

http://localhost:4300

## Funcionalidades

### Catálogo de productos

- Consulta de productos desde una API REST.
- Visualización de productos mediante tarjetas.
- Filtro por categoría.
- Detalle de productos.
- Indicador de productos agotados.

### Carrito de compras

- Agregar y eliminar productos.
- Consultar cantidades y total.
- Persistencia de información mediante LocalStorage.

### Autenticación y seguridad

- Inicio de sesión mediante JWT.
- Almacenamiento y validación del token.
- Persistencia de sesión al actualizar la página.
- Protección de rutas mediante guards.
- Control de acceso según el rol del usuario.
- Interceptor HTTP para agregar el token a las peticiones.
- Manejo de errores de autenticación.

### Administración

- Acceso exclusivo para administradores.
- Tabla de productos con Angular Material.
- Paginación de productos.
- Creación y edición de productos.
- Eliminación con diálogo de confirmación.
- Formularios reactivos con validaciones.

### Interfaz

- Componentes standalone.
- Angular Material para formularios, tarjetas, botones y navegación.
- Indicadores de carga.
- Mensajes de confirmación mediante SnackBar.
- Diseño adaptable a diferentes tamaños de pantalla.

## Usuarios de prueba

La aplicación utiliza autenticación mediante una API externa.

| Rol | Correo |
|---|---|
| Administrador | admin@mail.com |
| Cliente | john@mail.com |

Las contraseñas deben corresponder a las cuentas disponibles en la API.

## Compilación de producción

```bash
npx ng build
```

Los archivos de producción se generan en:

```text
dist/catalogo-semillero/browser
```

## Despliegue

La aplicación está publicada en Vercel y conectada al repositorio de GitHub para realizar despliegues automáticos desde la rama principal.

**URL:** https://catalogo-semillero-ebon.vercel.app/

## Talleres realizados

- **Taller 01:** Componentes standalone, comunicación mediante Input y Output y catálogo de productos.
- **Taller 02:** Servicios, inyección de dependencias, HttpClient y consumo de API REST.
- **Taller 03:** Routing, guards, lazy loading y navegación.
- **Taller 04:** Formularios reactivos, validaciones y gestión de productos.
- **Taller 05:** Autenticación JWT, interceptores HTTP, protección de rutas, Angular Material y despliegue en Vercel.
