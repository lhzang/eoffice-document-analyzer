# EOffice V3 Webapp

Vue 3 + TypeScript enterprise document management system for educational institutions.

## Quick Facts

|                |                                                             |
| -------------- | ----------------------------------------------------------- |
| **Framework**  | Vue 3 (Composition API) + Vite                              |
| **State**      | Pinia (user, notifications) + TanStack Query (server state) |
| **UI**         | PrimeVue 4 + Tailwind CSS                                   |
| **Auth**       | OIDC/OAuth2 via `oidc-client-ts`                            |
| **Validation** | Vee-Validate + Zod                                          |
| **Modules**    | 16 feature domains                                          |

## 16 Feature Modules

**Documents:** `indoc` (incoming), `outDocument` (outgoing), `internalDocument` (internal)  
**Workflows:** `esign` (e-signature), `task` (task management), `clerical` (document books)  
**Management:** `organization`, `user`, `car`, `record` (work records), `system`  
**Utilities:** `dashboard`, `notification`, `search`, `verify` (document verification)

## Architecture

```
src/core/       → Layout, login, pages
src/modules/    → 16 feature domains (components, pages, services, schemas, composables/queries)
src/shared/    → Reusable: components/, composables/, services/, stores/, utils/, schemas/, constants/
src/            → App entry, router, main
```

**Data Flow:** Page → Query/Mutation Composable → Service → API Client → Backend

## Core Concepts (Read These First)

| Concept                | Location                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Auth flow & user state | `src/shared/composables/useAuth.ts`, `src/shared/stores/userProfileStore.ts`            |
| Data fetching patterns | `src/shared/composables/queries/` (factory pattern)                                     |
| Form validation        | `src/modules/[module]/schemas/` (Zod) + component `useForm`                             |
| API layer              | `src/shared/services/api-docs/` (generated), `src/shared/services/apiClientConfig.ts`   |
| Routing & permissions  | `src/router.ts`, `src/modules/[module]/router.ts`, `src/shared/constants/permission.ts` |
| Theming                | `src/presets/` (Noir dark theme), `tailwind.config.ts`                                  |

## Key Files

```
src/main.ts              → App initialization
src/App.vue              → Root + Toast notifications
src/router.ts            → Routes + guards (auth, permission, env)
src/shared/stores/       → Pinia stores (userProfile, notifications)
src/shared/services/     → API client configuration
src/core/layout/         → MainView, SideBar, TopBar
```

## Commands

```bash
pnpm dev          # Start dev server (localhost:5178)
pnpm build        # Type check + build
pnpm lint         # ESLint + Oxlint
pnpm format       # Prettier
pnpm test:unit    # Vitest
pnpm test:e2e     # Playwright
pnpm openapi:gen  # Regenerate API client from OpenAPI spec
```

## Environment

```bash
VITE_API_SERVER       # Required: Backend API URL
VITE_APP_NAME         # Application display name
VITE_ENV_NAME         # development | staging variants | prod variants
VITE_ESIGN_API_SERVER # Optional: E-signature service
```

## Adding a New Module

1. `src/modules/[name]/` with: `components/`, `composables/queries/`, `models/`, `pages/`, `schemas/`, `services/`, `router.ts`
2. Register routes in `src/router.ts`
3. Add permissions to `src/shared/constants/permission.ts`
4. Define Zod schemas in `schemas/`
5. Create service in `services/` using OpenAPI client
6. Export query composables from `composables/queries/`

## Commit Convention

```
<type>(<scope>): <subject>
```

Types: feat, fix, docs, style, refactor, test, chore

---

**v3.0.0** | Private | Built with Vue 3 + TypeScript
