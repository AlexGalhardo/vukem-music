# Optional accounts and portable progress

Learning requires no account. `/account` always offers a versioned JSON backup
of both foundation and course progress. Import validates the complete schema,
version, IDs and bounded counters before replacing local state. The file is
limited to 64 KiB; corrupt or unknown data is rejected. Keep a backup before
switching browsers or clearing browser storage.

## Identity and ownership

Optional accounts use a unique 3–32 character ASCII handle and a 12–256 character
password, hashed with Vukem's default Argon2id implementation. Passwords have an
additional 1,024-byte input bound. No email address is collected. There is no
email recovery: losing the password loses access to the cloud copy. This is
explained before account creation; the local copy remains usable.

The official Vukem session guard rotates sessions on login and invalidates them
on logout. State-changing endpoints inherit the framework CSRF/origin protection.
Login/registration/deletion have an IP rate limit; login additionally bounds
attempts by hashed handle. Never expose plaintext passwords in logs or exports.
Serve production through HTTPS and configure the application key/cookies as
specified in the deployment guide.

## Explicit synchronization and conflicts

Sign-in does not overwrite local progress. Choose **Save progress to account**
to upload the current local snapshot, or **Restore progress from account** to
fetch and confirm replacement with the latest cloud snapshot. There is no silent
merge or automatic background upload. Offline use remains local; export JSON to
transfer without an account.

The server uses compare-and-swap revisions. A stale save receives HTTP409;
review/restore the latest cloud snapshot before explicitly saving again. Attempts
are totals, not an append-only event log, so adding counters from two devices
would risk double counting. This design deliberately requires a human choice.
A restore fetch refreshes the known revision even if replacement is declined;
a subsequent explicit save can replace that reviewed revision with local data.

All `/api/account` operations derive ownership from the session, never a client
learner ID. GET returns only the current account and progress with `no-store`.
PUT checks the revision and snapshot inside the ownership condition. DELETE
requires password confirmation and deletes only the signed-in learner's server
record; it ends the session and preserves browser progress. Other outstanding
sessions for that deleted ID can no longer resolve an account.

Tests cover anonymous access, two-user isolation, malformed snapshots, stale
revisions, cross-origin writes, logout/login persistence, password confirmation,
and local backup/restore/deletion browser journeys. SQLite persistence, backups
and restore follow [deployment.md](deployment.md); operational backups may retain
old account records until the operator's retention period expires.
