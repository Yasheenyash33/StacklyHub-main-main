# TODO: Connect "My Trainees" Section to Backend

## Backend Changes
- [x] Add `get_trainees_for_trainer(db, trainer_id)` function in backend/crud.py
- [x] Add new endpoint `/trainers/{trainer_id}/trainees` in backend/main.py with proper authorization

## Frontend Changes
- [x] Update TrainerDashboard.jsx to fetch data from new endpoint
- [x] Update "My Trainees" section to display trainee name, session title, and creation time in IST

## Testing
- [ ] Test the new endpoint for correct data retrieval
- [ ] Verify IST formatting in the UI
- [ ] Ensure proper error handling for fetch failures
