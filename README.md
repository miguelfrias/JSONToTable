# JSON to Table 📊

An interactive, high-performance web application that parses JSON data (from raw text or remote URLs) and renders it into a virtualized, customizable table with **multi-column filtering**, **column reordering**, **resizing**, **JSONPath query resolution**, and **IndexedDB snapshot persistence**.

---

## ✨ Key Features

### 1. 📥 Dual Ingestion Modes
- **Raw JSON Editor**: Paste, format, minify, copy, and clear raw JSON text with instant syntax validation and error line/column pointers.
- **Remote URL Fetching**: Fetch remote API endpoints via **TanStack Query** with automated error handling, CORS diagnostics, and preset APIs (`dummyjson.com/products`, `dummyjson.com/users`, etc.).
- **Built-in Sample Datasets**: Quickly test with preloaded samples (E-Commerce Products, User Directory, Crypto Market Tickers).

### 2. 🎯 JSONPath Target Path Resolution (`$.products`)
- Navigate directly into deeply nested payloads using standard JSONPath syntax (e.g., `$.products`, `$.data.markets`, `$.items[*]`).
- **Auto-Discovery**: Automatically inspects the payload and suggests detected array paths as clickable badges.

### 3. ⚡ Virtualized Data Table
- Powered by **TanStack Table v8** and **TanStack Virtual v3**.
- Virtualized row rendering handles thousands of records with zero DOM bloat and 60 FPS scrolling.
- Protected by a dedicated React **ErrorBoundary** to prevent application crashes on malformed cell data.

### 4. 🎛️ Interactive Column Controls
- **Hide / Show Columns**: Searchable column visibility menu with "Show All", "Hide All", and "Reset".
- **Column Reordering / Moving**:
  - Drag and drop column headers directly.
  - Hover over header for quick "Move Left" / "Move Right" buttons.
  - Dedicated **"Move Columns"** modal to rearrange the complete sequence.
- **Column Resizing**: Columns default to a non-overflowing max-width of 300px with interactive drag-to-resize handles.
- **Multi-Column Filtering**: Individual filter popovers on every column header allowing simultaneous filtering across multiple columns, combined with a global search input.
- **Total Item Counter**: Header bar displays total item count and filtered item count (e.g., `Showing 12 of 30 items`).
- **Data Export**: Export displayed/filtered data directly to **CSV** or **JSON**.

### 5. 🗄️ Local Multi-Snapshot Architecture & Storage Admin
- **UUID Snapshot Permalinks (`/#/v/<uuid>`)**: Save named snapshot views with unique client-side UUIDs stored in **IndexedDB** (`idb-keyval`), preserving large data dumps (640 KB to 50+ MB) and table layouts.
- **Saved Views Dropdown**: Browse, search, and switch between saved snapshot views or create new blank views.
- **Storage Manager (`/#/views`)**: Dedicated admin dashboard to inspect all IndexedDB entries, view raw stored payloads, delete individual keys, convert legacy data, or wipe database storage.
- **Collapsible Input Panel**: Smoothly toggle-collapse the input panel to give the table 100% viewport space.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Table Engine**: [@tanstack/react-table](https://tanstack.com/table) (v8)
- **Virtualization**: [@tanstack/react-virtual](https://tanstack.com/virtual) (v3)
- **Data Fetching**: [@tanstack/react-query](https://tanstack.com/query) (v5)
- **JSONPath**: [jsonpath-plus](https://github.com/JSONPath-Plus/JSONPath)
- **Client Storage**: [idb-keyval](https://github.com/jakearchibald/idb-keyval) (IndexedDB wrapper)
- **Testing**: [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm or pnpm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd JSONToTable

# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Running Tests

```bash
npm test
```
Executes all 27 unit and component tests with Vitest.

### Production Build

```bash
npm run build
```
Type-checks and compiles the application into the `dist/` directory.

---

## 🌐 Free Hosting on GitHub Pages

This app is 100% client-side (no backend required) and uses hash routing (`/#/v/<uuid>`, `/#/views`), making it **100% compatible with GitHub Pages for free**.

### Automatic Deployment via GitHub Actions (Included):
1. Push this repository to GitHub.
2. In your repository on GitHub, go to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Every push to the `main` branch will automatically run tests, build, and deploy your site to `https://<your-username>.github.io/<repo-name>/`.


---

## 🗺️ Routing & URL Navigation

| Route | Description |
| :--- | :--- |
| `/#/` | **Home / Default Workspace**: Clean editor and interactive virtual table. |
| `/#/v/<uuid>` | **Snapshot View**: Loads a specific saved snapshot from IndexedDB with its data payload and column layout. |
| `/#/views` | **Storage Admin Dashboard**: Inspect all raw IndexedDB keys, view sizes, delete entries, and manage database storage. |

---

## 📁 Project Structure

```
JSONToTable/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/
    │   └── table.ts                # TypeScript interfaces (TableSnapshot, ParseError, etc.)
    ├── hooks/
    │   ├── useJsonData.ts          # State management for raw/URL input & JSONPath
    │   ├── useFetchJson.ts         # TanStack Query remote endpoint fetcher
    │   └── useSnapshotManager.ts   # Multi-snapshot IndexedDB & URL hash routing hook
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx              # Top navigation, logo, snapshot controls & counters
    │   │   └── CollapsibleSidebar.tsx  # Smooth collapsible input panel wrapper
    │   ├── input/
    │   │   ├── JsonInputPanel.tsx      # Main input panel with tabs, editor & tools
    │   │   ├── UrlFetcher.tsx          # Remote URL input with CORS presets
    │   │   ├── JsonPathInput.tsx       # JSONPath input with auto-suggestions
    │   │   └── SampleDataPicker.tsx    # Preloaded sample datasets picker
    │   ├── table/
    │   │   ├── VirtualTable.tsx        # Core virtualized table component
    │   │   ├── TableToolbar.tsx        # Search, item count, save, and export toolbar
    │   │   ├── TableHeaderCell.tsx     # Sorting, drag-to-reorder & resize handles
    │   │   ├── TableRowCell.tsx        # Type-aware cell renderer with object modals
    │   │   ├── ColumnVisibilityMenu.tsx# Show/Hide column selector
    │   │   ├── ColumnFilterPopover.tsx # Per-column multi-filter popover
    │   │   ├── ColumnReorderModal.tsx  # Dedicated modal to rearrange columns
    │   │   └── EmptyTableState.tsx     # Empty / filtered-out / error states
    │   ├── admin/
    │   │   └── StorageAdminView.tsx    # IndexedDB storage inspector (/#/views)
    │   ├── snapshots/
    │   │   ├── SaveSnapshotModal.tsx   # Modal to save views with custom titles
    │   │   └── SnapshotsDropdown.tsx   # Header dropdown to browse/manage snapshots
    │   └── common/
    │       ├── ErrorBoundary.tsx       # React error boundary for table rendering
    │       ├── ErrorAlert.tsx          # Formatted error alert with line/col pointers
    │       ├── Modal.tsx               # Portal-rendered dialog modal
    │       └── Badge.tsx               # Reusable badge component
    ├── utils/
    │   ├── jsonHelper.ts           # JSON parsing, error position extractor, row normalizer
    │   ├── jsonPathHelper.ts       # JSONPath evaluation and array discovery
    │   ├── tableHelper.ts          # Column extraction, cell formatting, CSV export
    │   ├── storageHelper.ts        # General app state persistence in localStorage
    │   ├── snapshotStorage.ts      # IndexedDB CRUD operations for snapshots
    │   ├── adminStorageHelper.ts   # Full database scanning & size calculation
    │   ├── routerHelper.ts         # URL hash navigation helpers
    │   └── sampleData.ts           # Realistic sample datasets
    └── test/                       # Vitest unit and component tests
```

---

## 📄 License

MIT License. Free for open source and commercial use.
