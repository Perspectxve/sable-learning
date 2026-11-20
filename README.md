# Sable

Sable is a local-first desktop learning application. The v0.1 shell organizes
sample projects, courses, notes, and PDF references into workspaces.

## Application shell

- `src/learning` defines the typed, in-memory catalog. Projects link to documents
  by ID, so the same document can appear in multiple project trees.
- `src/shell/navigation.ts` holds workspace sessions. Each session remembers its
  sidebar location, expanded folders, open tabs, and active tab while the app is
  running. Sidebar visibility and appearance are app-wide settings.
- `src/App.tsx` looks up the active workspace, project, and documents, then passes
  them to the top bar, sidebar, tab strip, and document pane. The pane renders the
  active document by kind.
- `src/App.css` defines the dark theme and background-ready surfaces. Appearance
  settings can supply a background and surface opacity. The sample configuration
  uses a solid background.

The catalog contains sample content. Notes are read-only, courses display
previews, and PDFs are reference entries. Workspace sessions reset on relaunch.

## Frontend checks

Run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`.
