# W3A React SDK

This is a React SDK built with TypeScript and Vite.

## Development Setup

### Prerequisites

1. Install yalc globally (only needed once):

```bash
npm install -g yalc
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the SDK:

```bash
pnpm run build
```

4. Publish to yalc:

```bash
yalc publish
```

## Using the SDK in a Consumer App

In your consumer app (e.g., `test-react-app`):

1. Add the SDK to your project:

```bash
yalc add w3a-react
```

2. Install dependencies:

```bash
pnpm install
```

## 🛠️ Daily Dev Workflow

### In `w3a-react` (SDK):

1. Make code changes (e.g., to your provider or hook)
2. Rebuild the SDK:

```bash
pnpm run build
```

3. Push changes to the consumer app:

```bash
yalc push
```

---

### In `test-react-app` (consumer):

1. Start the dev server:

```bash
pnpm dev
```

2. Test your app using the latest SDK changes.

---

### 🔁 Resetting if Things Break

Sometimes local links get weird. If needed:

```bash
yalc remove w3a-react
pnpm install
yalc add w3a-react
pnpm install
```
