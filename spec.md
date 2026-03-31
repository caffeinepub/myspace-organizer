# MySpace Organizer

## Current State
- Internet Identity (ICP) login is already implemented with full cross-device sync
- All modules sync to backend via `storeUserData`/`getUserData` using the ICP principal as the key
- `LoginButton` component shows only Internet Identity option
- Migration modal prompts on first login to upload local data

## Requested Changes (Diff)

### Add
- Username/password registration flow (shown alongside Internet Identity on login UI)
- Password hashing via SubtleCrypto SHA-256 in the browser
- Recovery code generation at registration (24-character alphanumeric, shown once)
- "Forgot password?" flow using recovery code to reset password
- `useUsernameAuth` hook managing username/password session state in localStorage (always remembered)
- Backend functions: `registerUser`, `loginUser`, `resetPasswordWithRecovery` storing hashed credentials per username
- Backend per-user-key sync functions: `storeUserDataByKey`, `getUserDataByKey` for username/password users
- Updated `LoginButton` to show both auth options (Internet Identity + Username/Password)
- `UsernameAuthModal` component for login, register, and forgot-password flows

### Modify
- `useSyncService` — detect which auth method is active (II vs username/password) and use the appropriate backend sync functions
- `App.tsx` — wire `useUsernameAuth` into the migration/sync flow the same way II is wired
- `LoginButton` — extend to show username login option alongside II

### Remove
- Nothing

## Implementation Plan
1. Extend `src/backend/main.mo` with user credential store and `registerUser`, `loginUser`, `resetPasswordWithRecovery`, `storeUserDataByKey`, `getUserDataByKey` functions
2. Create `src/frontend/src/hooks/useUsernameAuth.ts` — manages register/login/logout/reset with localStorage session persistence
3. Create `src/frontend/src/components/auth/UsernameAuthModal.tsx` — 3-panel modal: Login, Register, Forgot Password
4. Update `src/frontend/src/components/auth/LoginButton.tsx` — show both II and username/password options
5. Update `src/frontend/src/hooks/useSyncService.ts` — support syncing via userId key for username/password users
6. Update `src/frontend/src/App.tsx` — hook up username auth migration/sync the same as II
