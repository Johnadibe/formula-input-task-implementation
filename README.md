# Formula Input Component Implementation

A feature-complete implementation of Causal.app's formula input functionality with hybrid text/tag input and intelligent autocomplete suggestions.

## 🚀 Features

### Core Functionality

- **Hybrid Input System**

  - Seamless mixing of free-text numbers and autocomplete tags
  - Support for mathematical operators (`+`, `-`, `*`, `/`, `^`, `()`)
  - Intelligent backspace handling for tag deletion

- **Autocomplete Integration**

  - React Query-powered API integration
  - Context-aware suggestions (triggered after operands)
  - Debounced search with error handling

- **Tag Management**
  - Inline dropdown editing for existing tags
  - Visual tag boundaries with Tailwind styling
  - Zustand-powered state management

### Bonus Features

- Basic formula calculation system
- Responsive design implementation
- Full TypeScript type safety

## 🛠 Tech Stack

| Category         | Technologies                           |
| ---------------- | -------------------------------------- |
| Framework        | Next.js (App Router)                   |
| Language         | TypeScript                             |
| State Management | Zustand (Local) + React Query (Server) |
| UI Library       | shadcn/ui                              |
| Styling          | Tailwind CSS                           |
| Formula Parsing  | Custom implementation + Math.js        |

## ⚙️ Installation

1. Clone repository

```bash
git clone https://github.com/Johnadibe/formula-input-task-implementation.git
cd formula-input-task-implementation
```

2. Install dependencies

```bash
npm install
```

3. Start development server

```bash
npm run dev
```

4. Access at http://localhost:3000
