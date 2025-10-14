# TODO: Implement Role-Based Session Filtering and Combined TraineeDashboard View

## Backend Changes
- [x] Update `/sessions/` endpoint in `backend/main.py` to filter sessions based on user role:
  - Trainees: only sessions they're assigned to (via trainees list)
  - Trainers: only sessions they created (trainer_id matches)
  - Admins: all sessions

## Frontend Changes
- [x] Modify `frontend/src/components/Dashboard/TraineeDashboard.jsx` to display a single combined section for all assigned sessions:
  - Remove separate "Upcoming Sessions" and "My Sessions" sections
  - Show all sessions with status indicators (upcoming/completed)
  - Join button only for upcoming sessions with classLink
  - Sort sessions by date/status

## Testing
- [ ] Test role-based access (login as different users)
- [ ] Verify join button works for upcoming sessions
- [ ] Ensure date formatting is correct (IST)
