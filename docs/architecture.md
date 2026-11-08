# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep one React route component per capability (`Activities.tsx`, `Teams.tsx`, `Leaderboard.tsx`, `Workouts.tsx`). Each calls the shared `api/client.ts` and renders loading, error (`role="alert"`), empty, and data states. `CapabilityCard.tsx` is replaced by these components and no longer holds placeholder "Implementation pending" text. Components do not build URLs or validate data themselves.
- Logic tier decision: Routes in `backend/src/routes/api.ts` only parse requests and map errors to status codes. Business rules (points calculation, team totals, ranking, suggestion focus) live in `backend/src/services/octofitService.ts`. Invalid input returns `400`, unknown referenced records return `404`, and no cast error is allowed to surface as `500`.
- Data tier decision: Required-field and type rules live in the Mongoose schemas under `backend/src/models` (`User.ts`, `Team.ts`, `Activity.ts`, `Workout.ts`), so `validateSync()` reports them. Models hold no HTTP or Express concerns. Seed data in `src/scripts/seed.ts` must satisfy the same rules.
- Activity tracking approach: `POST /api/activities` accepts `userId`, `teamId`, `type`, and `minutes`. The service checks that both IDs are valid ObjectIds and that the user and team exist, then stores `user`, `team`, `type`, `minutes`, a computed `points` value, and `occurredAt`. `GET` lists activities.
- Team management approach: `POST /api/teams` requires a non-empty `name` and a `mascot`, with `members` defaulting to an empty array. `GET` lists teams with members populated. Create returns `400` when `name` is missing.
- Leaderboard approach: `GET /api/leaderboard` aggregates activity points per team in the service, sorts descending by `totalPoints`, and assigns a 1-based `rank`. Teams with no activity appear with `totalPoints` of `0`.
- Workout suggestions approach: `GET /api/workouts/suggestions/:userEmail` looks up the user by email (`404` if none), derives the focus from the user's goal and recent activity types, and returns suggestions with `focus` and a `reason` string. The first suggestion must match that focus.

Implementation order (smallest safe steps, one test file green before the next): data-tier model validation → team create/list → activity create/list → leaderboard → workout suggestions → frontend route states. The frontend mocks `fetch`, so it can proceed independently of the backend.

## Test plan

Record the commands you run and what each failure means.

Install first with `npm ci --prefix octofit-tracker/backend` and `npm ci --prefix octofit-tracker/frontend`. npm may warn that `esbuild` and `mongodb-memory-server` postinstall scripts were skipped; this does not block the tests.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Failure means a model is missing a required field or type rule (`validateSync()` returned `undefined`). Fix the schema in `backend/src/models`.
- API command: `npm run test:api --prefix octofit-tracker/backend`
  - `501` responses mean the route is still a stub. Expecting `400` but getting `501` means validation is not yet implemented.
  - An empty leaderboard `[]` means the aggregation is missing.
  - A wrong `focus` in suggestions means the derivation rule in the service does not match the seeded user.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - "Implementation pending" or missing `role="alert"`/empty-state text means the route still renders `CapabilityCard` instead of its data-driven component.
  - A `fetch` spy never called means the component does not use `api/client.ts`.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Runs `tsc --noEmit`. A failure is a type error in the backend source, usually a schema or route signature change.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Runs `tsc --noEmit` and `vite build`. A failure is a type error or an import of a removed component.

Baseline (before implementation, observed in this Codespace): backend 8 of 9 tests failing, frontend 15 of 15 failing. Each step in the implementation order should reduce these counts without introducing new failures. Every step must also keep both build commands passing.
