# Guidelines on fetching data

All data in this application is fetched via AJAX calls.
The api is defined in `src/lib/api.ts`
The request types are defined in `src/lib/request-types.ts`
The response types are defined in `src/lib/response-types.ts`
These files are immutable an must not be changed.

We use Tanstack query to fetch and mutate data. If its simpler to use the api definitions directly, we can do that.
We DO NOT USE raw fetch calls in components or pages.
All API calls are defined in api.ts and used from there.

# Guidelines on permissions.

Methods in ./src/lib/api.ts which have `tempToken` as a parameter need a temporary session token passed to them.
All pages under `/main/*` have this token provided to them via a zustand store. This is provided by `useUserData` hook defined in `./src/api/context.ts`. Whether this hook should be passed to child components or fetched directly inside children calls is up to the designer.

# Page architecture.

All pages under `app/main` directory (or `/main/*`) follow a skeleton architecture. The skeleton is wrapped inside a `<PageCanvas ... />` convenient. Look into `src/app/main/org/page.tsx` for reference.

# Component library

We use ShadCN as our component library.
Components are defined under src/components/ui
Our custom components are defined under src/components/custom-component-tray/ComponentName.tsx or under src/components/ComponentName.tsx if no logical grouping of components is available.

# Page architecture

Each page consists of a specific directory under either `src/main/` or `src/`.
A page that requires authentication available should be under `src/main`.
Pages that don't require should be under `src/`. Usually these pages are not necessary beyond login and sign-up flows.

Here's what the page structure looks like:

- Each page has a directory in dash case. For example, `spans-home` page is located under `src/main/spans-home`.
- Inside the page the directory there are various files.
- `page.tsx` contains the page component. All components must follow a standard template of first bootstrapping a page inside a `PageCanvas` component and then writing the rest of the page as a `<Inner>` component.
- `store.ts` contains a zustand backed store that stores data that must shared across different parts of a page. Contents of the store are upto the implementor.
- `queries.ts` contains all API queries (reads) required by the page. Each API call is wrapped in a hook and calls are done using react query.
- `mutations.ts` contains as writes that a page must do. If `queries.ts` has all reads then `mutations.ts` has all writes.
- `parts` directory contain parts of a page. Its important to split a page into manageable parts. Each part is defined in a single file in `parts` dir. One file should only contain one part.
- `lib.ts` contains data transformation functions required by a specific page. This is specific for each page. Before writing boilerplate code here, check if any equivalent code is already written in files in `src/lib/`. `src/lib` contains common library methods which are supposed to be used freely throughout components, pages and page parts.
- `lib.test.ts` contains unit tests for library methods.
- `page.test.tsx` contains unit tests for pages.
- Parts similarly contain unit tests in corresponding `.test.tsx` files.

Page parts are allowed to read from the Zustand store specific to that page and also from the global context defined in `src/lib/context.ts`.

# Components

All components are defined in `src/components`. One component is defined in one file. The file name is in dash case and component name is in camel case inside this file. E.g if the component is SafeDeleteButton, then its defined in file `src/components/safe-delete-button.tsx` as a component `SafeDeleteButton`.
Components must not depend on any external Zustand store (local or global).
