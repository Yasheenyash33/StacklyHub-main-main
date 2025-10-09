- [x] Debug why assigned trainees are not appearing in the trainer's dashboard.
- [x] Check if the backend is correctly linking trainees to trainers in the database.
- [x] Verify that the API endpoint fetching trainees is filtering by the logged-in trainer's ID.
- [x] Ensure the frontend is correctly calling the API and rendering the trainee list.
- [x] Suggest any fixes to make sure trainee assignments reflect properly in the UI.

Fixes implemented:
- Updated AssignTrainerModal to use assignStudent and unassignStudent from AuthContext instead of incorrectly setting assignedTrainer on user.
- Updated UserManagement to use assignments data for filtering and displaying trainer assignments.

Testing:
- Test assigning a trainer to a trainee via UserManagement.
- Verify that the assignment appears in TrainerDashboard "My Trainees" section.
- Check that unassigning removes the trainee from the dashboard.
