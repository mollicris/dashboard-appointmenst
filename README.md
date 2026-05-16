# Dashboard — React + Vite

Admin SPA donde los tenants (negocios) configuran su bot y gestionan citas.

## Arquitectura feature-based

Aplicación organizada por **dominio funcional**, alineada con los bounded contexts del backend:

```
src/
├── core/          # Bajo nivel: HTTP client, env, types globales
│   ├── api/       # HttpClient (interfaz + impl Axios)
│   ├── config/    # env validado con Zod
│   └── types/     # Tipos compartidos (UUID, Paginated, etc.)
├── shared/        # Reutilizable cross-feature
│   ├── components/  # UI components, layouts
│   ├── hooks/       # Hooks genéricos
│   └── lib/         # Utilidades puras
├── features/      # Un folder por dominio funcional
│   ├── auth/         # Login, onboarding wizard
│   ├── businesses/   # CRUD sucursales
│   ├── services/     # CRUD servicios
│   ├── appointments/ # Gestión de citas
│   ├── conversations/# Inbox unificado
│   └── analytics/    # Dashboard de métricas
├── routes/        # Definición de rutas (React Router)
└── styles/        # CSS global
```

## Principios SOLID aplicados al frontend

| Principio | Aplicación |
|-----------|-----------|
| **S** Single Responsibility | Cada feature folder es responsable de un dominio funcional. Cada componente, un propósito. |
| **O** Open/Closed | `HttpClient` extensible (interfaces), `shared/components` aceptan props para variar comportamiento sin modificarse. |
| **L** Liskov Substitution | Cualquier impl de `HttpClient` (fetch, axios, msw mock) intercambiable. |
| **I** Interface Segregation | Hooks específicos por caso de uso (no un mega-hook con todo). |
| **D** Dependency Inversion | Features importan **interfaces** desde `core/api`, no Axios directamente. |

## Multitenancy en el frontend

El JWT del usuario contiene `tenant_id`. El `HttpClient` lo adjunta automáticamente en el header `Authorization`. Los componentes nunca tocan `tenant_id` directamente — la sesión actual lo encapsula. Cambiar de tenant (caso "usuario con cuentas en varios negocios") = re-login en el otro tenant.

## Comandos

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # production build
pnpm typecheck
pnpm lint
pnpm test       # vitest
```
