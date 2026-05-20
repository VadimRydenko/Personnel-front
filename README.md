# Personnel (frontend)

React SPA для системи «Штат»: авторизація, штатний розпис, адміністрування користувачів.

## Стек

- Vite + React 19 + TypeScript
- React Router 7
- TanStack React Query
- Tailwind CSS v4 (`@theme` токени в `src/index.css`)
- better-auth, Lucide icons
- ESLint + Prettier + Husky

## Швидкий старт

```bash
npm install
cp .env.example .env.local   # VITE_API_BASE_URL
npm run dev
```

## Команди

| Команда                           | Опис                |
| --------------------------------- | ------------------- |
| `npm run dev`                     | Dev server          |
| `npm run build`                   | Production build    |
| `npm run preview`                 | Preview build       |
| `npm run lint`                    | ESLint (0 warnings) |
| `npm run typecheck`               | `tsc -b`            |
| `npm run format` / `format:check` | Prettier            |

## Стилі

- **Токени дизайну** — `@theme` у `src/index.css` (`bg-main`, `text-ink`, `bg-sidebar`, `border-border`, …).
- **UI-примітиви** — `src/components/ui/` (`Button`, `Card`, `Field`, `Muted`, …).
- **`cn()`** — `src/lib/cn.ts` (clsx + tailwind-merge).

## Структура

```
src/
  app/           # router, API, auth, query client
  components/    # AppLayout, ui/
  lib/           # cn()
  pages/         # сторінки (OrgStructurePage/ — feature-модуль)
  hooks/
```

## ENV

`VITE_API_BASE_URL` — базовий URL бекенду (див. `.env.example`).
