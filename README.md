# Morrow Storefront

A responsive e-commerce technical assignment built with Next.js, TypeScript, Tailwind CSS, Zustand, and the [DummyJSON Products API](https://dummyjson.com/docs/products).

## Features

- Server-rendered, searchable product catalogue sourced from DummyJSON
- Category, sale-price, and availability filters with shareable URL state
- Featured, price, rating, and alphabetical sorting
- Pagination with selectable 12, 24, or 48 products per page
- Product cards zoom smoothly while hovered or focused; multi-image cards cross-fade after 0.5 seconds and then every two seconds, while single-image cards remain static
- Dynamic product detail routes with a selected-thumbnail gallery and previous/next controls on the left; single-image products render without carousel chrome
- Session-persisted cart with add, remove, increment, decrement, and quick-buy actions
- Live cart item count and derived order totals
- Out-of-stock products are labelled and cannot be added to the cart
- Responsive catalogue, product-detail, and cart layouts
- Loading, API error, empty-result, empty-cart, and not-found states
- Optimized remote product images with `next/image`
- Accessible navigation, search and filter labels, gallery controls, focus states, and reduced-motion support
- Unit tests for catalogue logic, pricing, and cart behavior, plus browser tests for the main shopping flows

## Run locally

Requirements:

- Node.js 20.9 or later, used by Next.js for development and production builds
- Bun 1.3.5, pinned through the `packageManager` field

The repository uses `bun.lock` as its only lockfile.

If Bun is not installed, install the pinned version on macOS or Linux:

```bash
curl -fsSL https://bun.com/install | bash -s "bun-v1.3.5"
```

Windows users can follow the [official Bun installation guide](https://bun.com/docs/installation). Open a new terminal after installation, then verify the version:

```bash
bun --version
```

Install dependencies and start the development server:

```bash
bun install --frozen-lockfile
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests and quality gate

Install Chromium once before the first browser-test run:

```bash
bunx playwright install chromium
```

Run the complete reviewer quality gate with one command:

```bash
bun run check
```

The quality gate performs a frozen Bun installation, a formatting check, linting, TypeScript
validation, unit tests, a production build, and Playwright browser tests against that production
build.

Individual commands are also available:

```bash
bun run lint
bun run lint:fix
bun run format
bun run format:check
bun run fix
bun run typecheck
bun run test:unit
bun run build
bun run test:e2e
```

## Architecture and thought process

Product reads happen directly in React Server Components. There is no internal API proxy because it would add another network hop and an unnecessary maintenance layer. The data helper in `src/lib/products.ts` owns endpoint construction, response checks, typing, and the one-hour revalidation policy.

The complete catalogue is fetched in one cached request. Pure functions in `src/lib/catalog.ts` parse and validate URL parameters, combine search and filters, sort by effective sale price where appropriate, and paginate the result. Keeping catalogue state in the URL makes filtered views shareable and preserves expected browser back/forward behavior.

Interactive controls use a small client boundary to update the URL. Product content and result grids remain server-rendered. The listing gallery uses one continuous zoom layer so image changes cannot interrupt the scale animation. When more than one distinct gallery image is available, it cross-fades after a 0.5-second pause and continues on a two-second interval. The listing thumbnail is only a fallback and is not treated as an alternate gallery image, preventing duplicate first transitions and single-image flashes. The product-detail gallery keeps thumbnail, previous/next, and arrow-key selection state in a dedicated client component, while its single-image branch remains visually static and omits every carousel control.

Zustand owns cart actions and selector-based subscriptions. The store is instantiated inside a scoped provider rather than exported as shared module state, which keeps the setup compatible with Next.js server rendering. Zustand's persistence middleware stores only cart items in `sessionStorage`; manual rehydration prevents the server and first client render from disagreeing.

Totals are derived rather than stored. Prices are accumulated in integer cents to avoid floating-point rounding issues, and repeated additions increment quantity instead of creating duplicate rows.

Tailwind CSS provides the responsive layout and interaction states. The visual direction adapts common commerce patterns found through Mobbin: an image-led, low-chrome product grid; compact catalogue controls; a large split product-detail layout with a left gallery rail; and a cart with a clearly separated summary. Font Awesome supplies a consistent icon set.

## Test coverage

- Unit tests validate query parsing, combined search/filter behavior, each sorting mode, pagination, URL serialization, sale-price rounding, percentage formatting, cart persistence, blocked-storage fallback, and every cart mutation.
- Browser tests validate product search and reset, category/price/availability filters, sorting, products-per-page selection, pagination, immediate card zoom and deferred image rotation, multi-image gallery controls, the single-image no-carousel state, add-to-cart and cart overview behavior, short-viewport cart access, blocked-storage behavior, and the custom product not-found state.

## Trade-offs

- Catalogue filtering happens after one cached request for the full DummyJSON catalogue. This keeps combined filters and sorting deterministic for a small demo dataset. A production catalogue would push those operations into a search service or database.
- Cart entries retain the title, price, and thumbnail from the moment they are added. A production cart would normally revalidate pricing and stock against a backend before checkout.
- `sessionStorage` matches the requirement that persistence lasts within the session. Closing the browser tab clears the cart; `localStorage` would be appropriate for longer-lived persistence. If a browser blocks storage, the cart degrades to memory-only state instead of becoming unusable.
- A scoped Zustand provider introduces slightly more setup than a global client store, but avoids mutable state being shared across server requests.
- Browser tests use the public DummyJSON catalogue, so that service must be reachable when the suite starts.

## Known limitations

- Checkout, payment, authentication, and inventory reservation are not implemented.
- The cart is local to one browser tab and is not connected to a customer account.
- The application depends on the availability and response shape of the DummyJSON service.

## Deployment

The project is ready for Vercel's standard Next.js deployment flow and does not require environment variables. Import the Git repository into Vercel and use the default build settings; Vercel detects Bun from the committed `bun.lock` and `packageManager` field.
