# TODO: Fix Dynamic Dashboard Updates for Sessions and Trainee Assignments

## Overview
The dashboards (Admin, Trainer, Trainee) are not updating dynamically to reflect the latest sessions and trainee assignments in real-time. This needs to be fixed by improving WebSocket message handling in the frontend to properly filter and update session data based on user roles.

## Steps to Complete

### 1. Update WebSocket Message Handler in AuthContext ✅
- Modify `handleWsMessage` in `frontend/src/contexts/AuthContext.jsx` to properly handle session-related WebSocket messages with role-based filtering.
- Add helper function `isSessionVisible` to check if a session should be visible to the current user.
- Ensure sessions are added/updated/removed only when appropriate for the user's role.
- For trainee additions/removals affecting the current user, trigger a full data refresh.

### 2. Test Real-Time Updates ✅
- Verify that when an admin/trainer creates a session, it appears immediately on relevant dashboards.
- Confirm that adding/removing trainees from sessions updates dashboards in real-time.
- Ensure trainees see only their assigned sessions, trainers see only their sessions, and admins see all.

### 3. Handle Edge Cases ✅
- Test scenarios where sessions are created without trainees and then trainees are added.
- Ensure session updates (status changes, etc.) propagate correctly.
- Verify that deleted sessions are removed from all relevant dashboards.

### 4. Performance Optimization ✅
- Minimize unnecessary API calls during WebSocket updates.
- Ensure state updates are efficient and don't cause unnecessary re-renders.

### 5. Final Testing ✅
- Test across different user roles (admin, trainer, trainee).
- Verify WebSocket reconnection works properly.
- Confirm no data inconsistencies after multiple updates.
