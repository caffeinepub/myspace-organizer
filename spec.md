# MySpace Organizer — Advanced Productivity Enhancement

## Current State

The app is a full personal organizer with these existing sections:
- **Home** (`HomePage.tsx`) — greeting, streak widget, quote widget, today routine widget, FAB quick-add note
- **Routines** (`RoutinesPage.tsx`) — weekday/weekend profiles, drag-reorder, import/export TXT/DOC/JSON, speech-to-text, image/file upload
- **Notes** (`NotesPage.tsx`) — Google Keep-style, labels, pin/archive/trash, import/export TXT/DOC/JSON, speech-to-text, image upload with camera
- **Records** (`RecordsPage.tsx`) — journal/log entries, image attachment (camera), speech-to-text, import/export TXT/DOC/JSON, truncated list with full view modal
- **Settings** (`SettingsPage.tsx`) — theme (light/dark), accent color (9 presets incl. gold/yellow), font selector (12 fonts), background image, storage indicator, data management
- **Streak** (`StreakPage.tsx`) — daily check-in, streak calendar history
- **Quote** (`QuotePage.tsx`) — customizable motivational quote

Storage: IndexedDB via custom `idb.ts` wrapper. Tables: notes, routines, records, streak, quotes, labels, imageBlobs, settings.

Navigation: `BottomTabBar` (mobile, 5 tabs: Home/Routines/Notes/Records/Settings) + `AppSidebar` (desktop sidebar).

App routing in `App.tsx` — tab-based switch.

## Requested Changes (Diff)

### Add
1. **Memory module** — new `MemoryPage.tsx`: save/view/delete memories with title, content, tags, createdAt. Stored in new `memories` IDB table.
2. **Tasks/Todo module** — new `TasksPage.tsx`: create tasks (title, description, due date+time, priority: low/medium/high, status: pending/in-progress/completed). Filters: today/upcoming/completed. IDB `tasks` table.
3. **Reminders module** — new `RemindersPage.tsx`: one-time & recurring reminders, browser notification via Notification API, optional link to note/task. IDB `reminders` table. Background scheduler checks reminders.
4. **Habits/Streak tracker** — new `HabitsPage.tsx`: create named habits, daily check-in per habit, streak count, last check-in with date+time (AM/PM), prevent double check-in same day. IDB `habits` table.
5. **AI Assistant Chat Panel** — new `AssistantPage.tsx`: floating chat-like UI, local command handler (no external API needed) that understands: "remember this", "remind me tomorrow at 8 PM", "create task", "search notes", "summarize notes". Returns helpful inline responses.
6. **Global Search** — new `GlobalSearchPage.tsx`: search across notes, memory, tasks, routines, records — results grouped by section. Separate from Notes internal search.
7. **Home Dashboard enhancement** — add Today Tasks widget, Upcoming Reminders widget, Habits streak widget, Assistant summary panel, quick-add buttons for Tasks/Memory. Do NOT change existing widgets.
8. **Navigation expansion** — add new tabs/sections to `BottomTabBar` and `AppSidebar` for: Tasks, Memory, Habits, Assistant, Search. Add a "More" overflow button on mobile to avoid crowding (keeping the 5 existing tabs, adding a More button that reveals new sections).
9. **New IDB tables** — extend `idb.ts` with new object stores: `memories`, `tasks`, `reminders`, `habits`. Bump DB_VERSION to 2.
10. **Schema additions** — add `Memory`, `Task`, `Reminder`, `Habit` interfaces to `schema.ts`.
11. **DB class additions** — add `.memories`, `.tasks`, `.reminders`, `.habits` tables to `db.ts`.
12. **Seed data** — add example items for tasks, habits, memory in `seedData.ts` (additive only).

### Modify
- `App.tsx` — add new tab IDs and render cases for new pages. Do NOT change existing cases.
- `BottomTabBar.tsx` — add a "More" button (6th item) that opens an overlay with the new section links. Keep the 5 existing tabs unchanged.
- `AppSidebar.tsx` — add new nav items below existing ones with a separator. Keep existing items unchanged.
- `db/idb.ts` — bump DB_VERSION to 2, add new stores in `onupgradeneeded`. Fully backward compatible.
- `db/db.ts` — add new table instances. Existing tables unchanged.
- `db/schema.ts` — add new interfaces. Existing interfaces unchanged.
- `utils/seedData.ts` — add seed data for new tables only if tables are empty.
- `store/appStore.ts` — no changes needed.
- `pages/HomePage.tsx` — add new widgets (tasks, reminders, habits). Do NOT modify existing widgets.

### Remove
- Nothing removed.

## Implementation Plan

1. Extend schema: add Memory, Task, Reminder, Habit interfaces to `db/schema.ts`
2. Extend idb.ts: add new stores, bump to version 2
3. Extend db.ts: add new table instances
4. Create hooks: `useMemory.ts`, `useTasks.ts`, `useReminders.ts`, `useHabits.ts`
5. Create pages: `MemoryPage.tsx`, `TasksPage.tsx`, `RemindersPage.tsx`, `HabitsPage.tsx`, `AssistantPage.tsx`, `GlobalSearchPage.tsx`
6. Update navigation: BottomTabBar (More button), AppSidebar (new items)
7. Update App.tsx: new tab IDs + render cases
8. Update HomePage.tsx: add new dashboard widgets additively
9. Add reminder notification service
10. Extend seedData.ts
11. Validate and deploy
