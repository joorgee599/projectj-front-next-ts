# ProjectJ Frontend

Aplicación frontend desarrollada con Next.js 14+ y TypeScript para el proyecto ProjectJ.

## 🚀 Características

- **Autenticación**: Sistema de login/logout integrado con backend Java
- **Dashboard**: Panel de control con estadísticas y métricas
- **Chat con Agente IA**: Widget de chat integrado con agente conversacional Python/LangGraph
- **Design System**: Componentes reutilizables (Button, Input, Header)
- **Responsive**: Diseño adaptable a diferentes dispositivos

## 📋 Requisitos Previos

- Node.js 18+ 
- npm, yarn, pnpm o bun
- Backend Java (puerto 8080)
- Backend Python Agent (puerto 5000)

## ⚙️ Configuración

1. **Clonar e instalar dependencias**:
```bash
npm install
# o
yarn install
```

2. **Configurar variables de entorno**:
```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con tus URLs:
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_AGENT_API_URL=http://localhost:5000
```

3. **Ejecutar el servidor de desarrollo**:
```bash
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗️ Estructura del Proyecto

```
src/
├── app/                      # Pages y layouts (App Router)
│   ├── dashboard/           # Dashboard principal
│   ├── login/               # Página de login
│   └── layout.tsx           # Layout raíz
├── core/
│   ├── api/                 # Cliente API
│   │   └── client.ts        # Configuración de fetch
│   └── design-system/       # Componentes base
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Header.tsx
│       └── tokens.css       # Variables de diseño
└── modules/
    ├── auth/                # Módulo de autenticación
    │   ├── components/      # LoginForm
    │   ├── services/        # authService
    │   └── types/           # Tipos de auth
    └── chat/                # Módulo de chat con agente
        ├── components/      # ChatWidget
        ├── services/        # chatService
        └── types/           # Tipos de chat
```

## 💬 Chat con Agente

El widget de chat está integrado en el dashboard y permite comunicarse con el agente conversacional.

**Características**:
- Botón flotante para abrir/cerrar
- Historial de conversación
- Mantiene contexto con `thread_id`
- Indicador de escritura
- Diseño moderno y responsive

**Uso**:
1. Inicia sesión en la aplicación
2. Navega al dashboard
3. Haz clic en el botón flotante 💬
4. Escribe tu mensaje y envía

El agente mantiene el contexto de la conversación usando un `thread_id` único por sesión.

## 🔐 Autenticación

El sistema de autenticación se conecta al backend Java:

- **Login**: `POST /api/auth/login`
- **Logout**: `POST /api/auth/logout` (invalida token)
- Storage: Tokens en `localStorage`

## 🎨 Design System

Las variables de diseño están en `src/core/design-system/tokens.css`:

```css
--primary: #4f46e5
--background: #f8fafc
--foreground: #0f172a
```

## 📦 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run start    # Servidor de producción
npm run lint     # Linter ESLint
```

## 🔗 APIs Integradas

- **Backend Java** (puerto 8080): Autenticación, gestión de datos
- **Backend Python** (puerto 5000): Agente conversacional con LangGraph

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
