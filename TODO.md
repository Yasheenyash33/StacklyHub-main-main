# TODO: Ensure Sessions Visible in Trainer and Trainee Dashboards

## Information Gathered
- Database structure: Sessions linked to trainees via `SessionTrainee` many-to-many table.
- API: `create_session` creates session and links trainees; returns `SessionWithTrainees` with `trainees` as `List[User]`.
- Frontend: Fetches all sessions via `/sessions/`, filters client-side in dashboards.
- Issues identified:
  - `crud.get_sessions_by_trainee` incorrectly filters on non-existent `trainee_id`; needs join with `SessionTrainee`.
  - Frontend session data inconsistent: initial fetch has `trainees` as objects, WS updates have `trainees` as IDs.
  - `TraineeDashboard` filter `s.trainees.includes(user.id)` fails if `trainees` are objects.
  - Field mapping: `scheduled_date` should be `startTime` in frontend; `trainer_id` should be `trainer`.

## Plan
1. **Fix CRUD function**: Update `get_sessions_by_trainee` in `backend/crud.py` to properly join `SessionTrainee`. ✅
2. **Fix frontend data mapping**: In `src/contexts/AuthContext.jsx`, map sessions to use `trainer` (ID), `trainees` (array of IDs), and `startTime` (from `scheduled_date`). ✅
3. **Update WS broadcasts**: Ensure `session_created` and `session_updated` send full/mapped data. ✅
4. **Update WS handler**: Merge new fields in updates. ✅
5. **Verify filtering**: Ensure `TraineeDashboard` and `TrainerDashboard` filter correctly with mapped data. ✅
6. **Test session creation and visibility**: Confirm sessions appear in respective dashboards after creation.

## Dependent Files
- `backend/crud.py`: Fix `get_sessions_by_trainee`. ✅
- `src/contexts/AuthContext.jsx`: Add data mapping in `fetchInitialData` and WS handler. ✅
- `backend/main.py`: Update WS broadcasts for sessions. ✅
- `src/components/Dashboard/TraineeDashboard.jsx`: Verified filter.
- `src/components/Dashboard/TrainerDashboard.jsx`: Verified filter.

## Followup Steps
- Run backend and frontend to test session creation and dashboard display.
- If issues, debug filtering or data mapping.
