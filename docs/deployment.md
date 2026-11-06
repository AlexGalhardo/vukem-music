# Railway and SQLite operation

## Prepared configuration

The Dockerfile builds Vite assets and a static Go binary in separate stages.
The runtime embeds frontend assets, translations and course content; it needs no
Node/Bun runtime. `/app/start.sh` migrates SQLite, then uses `exec` to run Vukem.
A local production-image smoke test is recorded in [verification](verification.md).

[.railway/railway.ts](../.railway/railway.ts) defines one web replica, a persistent
1GB volume mounted at `/app/storage`, the healthcheck and production settings. It
uses Railway Infrastructure as Code. Railway does not register custom domains from
this IaC file; `music.vukem.dev` was added to the service separately.

## Live deployment

The production project is `cdc6c85c-775d-4923-bd02-2f4f01140bc3`, with service
`7f6187ef-ae65-46cf-b8d2-800acf4bdd3c` and environment
`80c707e2-9003-4025-b793-232c427e2d85`. The volume `music-storage` is mounted
at `/app/storage`. A private `APP_KEY` is set in Railway variables. The domain
routes to port 8080, the port assigned by Railway at runtime. Vercel DNS has a
`music` CNAME to `dbuyirpj.up.railway.app` and the Railway ownership TXT record.
Keep both records when updating the service. See [verification](verification.md)
for the observed deployment, HTTPS, database and backup checks.

## First production deployment

1. Connect the GitHub repository to the intended Railway project with your account.
2. Configure a generated `APP_KEY` through Railway's secret variables; never commit
   it. Set `APP_DEBUG=false`. Preserve that key across deploys and back it up safely.
3. Review the IaC plan using the current Railway CLI (`railway link`,
   `railway config plan`, `railway config apply`) or mirror its settings manually.
4. Ensure the volume is mounted at `/app/storage` and `DATABASE_URL` points to
   `file:/app/storage/database.sqlite`. The documented Railway volume workaround
   `RAILWAY_RUN_UID=0` is configured; review ownership for your deployment.
5. Run migrations in the application's start command, never pre-deploy: pre-deploy
   containers do not mount the volume. Use only one web replica for this SQLite MVP.
6. Verify `/up?checks=1`. Confirm that the configured trusted proxy range matches
   actual Railway peers before relying on forwarded IP/scheme headers.
7. Add `music.vukem.dev` to the service, obtain Railway's exact DNS target, then set
   that record at the DNS provider. Match the domain target port to the app's
   runtime port. Wait for HTTPS.
8. Open lessons and the piano over HTTPS, then redeploy and verify lesson records
   remain unchanged. Record the deployed SHA, live URL and checks in the roadmap.

No ElevenLabs key is required to serve the synthesized-preview app. Generation
runs separately as documented in [audio](audio.md), followed by a rebuild. Do not
turn generation into a publicly billable endpoint.

## Backups

Run the bundled CLI inside the service with a new filename:

```sh
/app/app db:backup --to /app/storage/music-backup-2026-11-05.sqlite
```

The command uses SQLite `VACUUM INTO` for a consistent committed snapshot, including
WAL data, creates a private file and refuses to overwrite an existing path.
Copy the snapshot off the volume to private backup storage, apply retention and
periodically verify restoration. A second file on the same volume does not protect
against losing that volume. Enable Railway volume backups as another protection.
This database backup does not include browser-local learner progress.

## Restore

1. Take a fresh backup of current production and stop application writes/the service.
2. Restore the selected snapshot into a separate directory or replacement volume;
   keep the original database for rollback. Do not overwrite an open database or
   combine a restored database with stale `-wal`/`-shm` sidecars.
3. Use a compatible application build, check SQLite `PRAGMA integrity_check`, and
   inspect lesson counts. Start the service; pending migrations run normally.
4. Check health, lessons and persistence after restart before switching traffic.

The backup/restore test verifies schema, lesson records, integrity and refusal to
overwrite. The production snapshot was downloaded and restored into a separate local
copy on 2026-11-06. A full production cutover restore drill remains outstanding.

References: [Vukem deployment](https://vukem.dev/docs/deployment/docker-and-railway),
[Railway volumes](https://docs.railway.com/volumes/reference),
[SQLite VACUUM INTO](https://www.sqlite.org/lang_vacuum.html#vacuuminto).
