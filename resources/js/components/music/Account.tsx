import { useCallback, useEffect, useState } from "react";
import {
  downloadBackup,
  type LearningBackup,
  learningBackup,
  parseBackup,
  restoreBackup,
  validBackup,
} from "../../lib/backup";
import { useI18n } from "../../lib/i18n";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface Cloud {
  user: { id: string; handle: string };
  revision: number;
  snapshot: LearningBackup;
}
async function request(path: string, method = "GET", body?: unknown) {
  const response = await fetch(`/api/account${path}`, {
    method,
    credentials: "same-origin",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data: unknown = await response.json();
  if (!response.ok) {
    const e = data as { error?: string };
    throw new Error(e.error ?? "account-error");
  }
  return data;
}
function cloudData(value: unknown): Cloud {
  const v = value as Cloud;
  if (
    !v?.user ||
    typeof v.user.handle !== "string" ||
    typeof v.user.id !== "string" ||
    !Number.isSafeInteger(v.revision) ||
    v.revision < 0 ||
    !validBackup(v.snapshot)
  )
    throw new Error("invalid-progress");
  return v;
}
export function Account() {
  const { t } = useI18n();
  const [cloud, setCloud] = useState<Cloud | null>(null);
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try {
      setCloud(cloudData(await request("")));
    } catch (e) {
      if (e instanceof Error && e.message !== "signed-out") setError(e.message);
      setCloud(null);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const action = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "account-error");
    } finally {
      setBusy(false);
      setPassword("");
    }
  };
  return (
    <section className="space-y-7">
      <header>
        <p className="eyebrow mb-3">{t("nav.account")}</p>
        <h1 className="section-title text-4xl">{t("ui.accountTitle")}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{t("ui.accountBody")}</p>
      </header>
      <Card className="gap-4 p-5 shadow-none">
        <h2 className="text-xl font-semibold">{t("ui.progressBackup")}</h2>
        <Button className="w-fit" variant="outline" onClick={downloadBackup}>
          {t("ui.exportProgress")}
        </Button>
        <label htmlFor="progress-backup" className="text-sm">
          {t("ui.importProgress")}
        </label>
        <input
          id="progress-backup"
          type="file"
          accept="application/json,.json"
          className="max-w-full text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 65536) {
              setError("invalid-progress");
              return;
            }
            void file
              .text()
              .then((raw) => {
                const value = parseBackup(raw);
                if (window.confirm(t("ui.restoreConfirm"))) {
                  restoreBackup(value);
                  setMessage("ui.progressRestored");
                  setError("");
                }
              })
              .catch(() => setError("invalid-progress"));
          }}
        />
      </Card>
      <Card className="gap-4 p-5 shadow-none">
        <h2 className="text-xl font-semibold">{t("ui.optionalSync")}</h2>
        <p className="text-sm leading-7 text-muted-foreground">{t("ui.accountPolicy")}</p>
        {!cloud ? (
          <form
            className="grid max-w-md gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void action(async () => {
                setCloud(cloudData(await request("/login", "POST", { handle, password })));
                setMessage("ui.signedIn");
              });
            }}
          >
            <label className="grid gap-2 text-sm" htmlFor="account-handle">
              {t("ui.accountHandle")}
              <input
                id="account-handle"
                required
                minLength={3}
                maxLength={32}
                pattern="[A-Za-z0-9_]+"
                autoComplete="username"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="rounded border bg-card p-2"
              />
            </label>
            <label className="grid gap-2 text-sm" htmlFor="account-password">
              {t("ui.accountPassword")}
              <input
                id="account-password"
                type="password"
                required
                minLength={12}
                maxLength={256}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded border bg-card p-2"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button disabled={busy} type="submit">
                {t("ui.signIn")}
              </Button>
              <Button
                disabled={busy || handle.length < 3 || password.length < 12}
                variant="outline"
                type="button"
                onClick={() =>
                  void action(async () => {
                    setCloud(cloudData(await request("/register", "POST", { handle, password })));
                    setMessage("ui.signedIn");
                  })
                }
              >
                {t("ui.createAccount")}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="font-semibold">
              {cloud.user.handle} · {t("ui.cloudVersion")} {cloud.revision}
            </p>
            <p className="text-sm leading-7 text-muted-foreground">{t("ui.syncPolicy")}</p>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={busy}
                onClick={() =>
                  void action(async () => {
                    setCloud(
                      cloudData(
                        await request("/progress", "PUT", { revision: cloud.revision, snapshot: learningBackup() }),
                      ),
                    );
                    setMessage("ui.progressSaved");
                  })
                }
              >
                {t("ui.saveCloud")}
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void action(async () => {
                    const current = cloudData(await request(""));
                    setCloud(current);
                    if (window.confirm(t("ui.restoreConfirm"))) {
                      restoreBackup(current.snapshot);
                      setMessage("ui.progressRestored");
                    }
                  })
                }
              >
                {t("ui.restoreCloud")}
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() =>
                  void action(async () => {
                    await request("/logout", "POST");
                    setCloud(null);
                  })
                }
              >
                {t("ui.signOut")}
              </Button>
            </div>
            <label className="grid max-w-md gap-2 text-sm" htmlFor="delete-password">
              {t("ui.deletePassword")}
              <input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded border bg-card p-2"
              />
            </label>
            <Button
              variant="outline"
              disabled={busy || !password}
              onClick={() => {
                if (window.confirm(t("ui.deleteAccountConfirm")))
                  void action(async () => {
                    await request("", "DELETE", { password });
                    setCloud(null);
                    setMessage("ui.accountDeleted");
                  });
              }}
            >
              {t("ui.deleteAccount")}
            </Button>
          </div>
        )}
      </Card>
      {error && (
        <p role="alert" className="text-sm">
          {t(`ui.account-${error}`) === `ui.account-${error}`
            ? t("ui.account-account-error")
            : t(`ui.account-${error}`)}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm">
          {t(message)}
        </p>
      )}
    </section>
  );
}
