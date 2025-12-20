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