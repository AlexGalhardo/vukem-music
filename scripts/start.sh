#!/bin/sh
set -eu
# Migrations must see the mounted SQLite volume. Never run them in pre-deploy.
/app/app migrate
exec /app/app
