## Build & Run
Run the Docker Compose command to start the Mongo DB, backend and frontend servers. the -d flag allows to keep the entire app up in the background, even after closing the terminal.

```
docker compose up --build -d
```

## User management Migration
### New User
Open the frontend in the browser, go to Profile button > Manage Users

Choose the ID and user that you want and click "Create User"

The backend will report the total of travels and visits that were created before the user management feature or the Guest Mode. Confirm the automatic data migration to assign your chosen ID to all the existent data, so it'll be hidden for guests and other logged in users.

### MongoDB Index Drop
Run commands interactively:

```
docker compose exec mongo mongosh

use timeline_db
show collections
```

Drop the legacy indexes. This DOES NOT delete the travels and visits data
```
db.travels.dropIndex({ startTime: 1, origin: 1 })
db.visits.dropIndex({ date: 1, location: 1, arrivalTime: 1 })

.exit
```

Finally, do a clean rebuild and run of the app.

## Software Design Documents (SDD)
All new features and architectural changes should be documented in the `docs/sdd` folder before implementation. 
1. Copy the `template.md` to a new file (e.g., `01-feature-name.md`).
2. Draft your design and get it reviewed.
3. Use it as a guide during implementation.

## 🛠️ Recommended Tools
### GitHub CLI (gh)
To streamline the Pull Request process, it is recommended to have the GitHub CLI installed.
- **Install (macOS)**: `brew install gh`
- **Auth**: `gh auth login`
- **Create PR**: `gh pr create --title "feat: descriptive title" --body "Summary of changes"`