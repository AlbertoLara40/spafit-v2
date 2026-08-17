# SPAFIT v2 - Sistema de Gestión de Gimnasio

Aplicación web para la gestión de miembros, pagos y estadísticas de un gimnasio.

## Tecnologías

- **Frontend:** React 19 + Vite + Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Gráficos:** Recharts

## Características

### Gestión de Miembros (CRUD)
- Nombre, apellidos, fecha de nacimiento (calcula edad automáticamente)
- Dirección, correo, teléfono, foto
- Plan mensual con precio editable globalmente
- Fecha de inicio automática, vencimiento automático (+30 días)
- Estado automático: Activo / Por vencer (7 días antes) / Vencido
- Notas adicionales
- Editar y eliminar miembros

### Sistema de Pagos
- Registrar pago: monto, fecha, método (Efectivo, Transferencia, Pago Móvil, Zelle)
- Historial de pagos por miembro
- Editar y eliminar pagos

### Dashboard
- Total Miembros, Activos, Por Vencer, Vencidos
- Ingresos: Semana, Mes, Año (con gráfico de barras)
- Comparación vs período anterior
- Últimos pagos registrados

### Diseño
- Tema oscuro moderno
- Responsive (celular y PC)
- Sin login (acceso directo)
- Botón de salir de la app

## Instalación

```bash
# 1. Clonar o descargar el proyecto
cd spafit-v2

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Copiar .env.example a .env y configurar credenciales de Supabase

# 4. Ejecutar en desarrollo
npm run dev

# 5. Compilar para producción
npm run build
```

## Variables de Entorno

Crear archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

## Estructura de Base de Datos (Supabase)

### Tabla: members
- id (uuid, primary key)
- name (text)
- last_name (text)
- birth_date (date)
- address (text)
- email (text)
- phone (text)
- photo_url (text)
- plan_id (text)
- status (text)
- due_date (date)
- join_date (date)
- notes (text)
- created_at (timestamp)

### Tabla: payments
- id (uuid, primary key)
- member_id (uuid, foreign key)
- amount (numeric)
- payment_date (date)
- method (text)
- notes (text)
- created_at (timestamp)

### Tabla: settings
- id (int, primary key)
- monthly_price (numeric)
- updated_at (timestamp)

## Despliegue en Vercel

1. Crear cuenta en [Vercel](https://vercel.com)
2. Importar repositorio de GitHub
3. Configurar variables de entorno en Vercel Dashboard
4. Deploy automático en cada push a main

## Licencia

Proyecto privado - SPAFIT Gimnasio
