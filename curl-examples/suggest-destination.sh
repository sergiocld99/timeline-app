# Usage: bash suggest-destination.sh <locationId>
curl -s "http://localhost:3000/api/travels/suggest-destination?origin=$1&startTime=2026-07-25T18:02&userId=1"