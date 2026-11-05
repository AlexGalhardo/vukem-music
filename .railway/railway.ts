import { defineRailway, github, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const storage = volume("music-storage", { region: "us-west2", sizeMB: 1024 });
  const web = service("vukem-music", {
    source: github("AlexGalhardo/vukem-music", { branch: "main" }),
    replicas: 1,
    healthcheck: "/up?checks=1",
    start: "/app/start.sh",
    domains: ["music.vukem.dev"],
    volumeMounts: { "/app/storage": storage },
    env: {
      APP_NAME: "Vukem Music",
      APP_ENV: "production",
      APP_DEBUG: "false",
      APP_KEY: preserve(),
      APP_URL: "https://music.vukem.dev",
      APP_LOCALE: "en",
      DATABASE_URL: "file:/app/storage/database.sqlite",
      HOST: "0.0.0.0",
      MAIL_MAILER: "log",
      LOG_FORMAT: "json",
      RAILWAY_RUN_UID: "0",
      TRUSTED_PROXIES: "100.64.0.0/24",
      CLIENT_IP_HEADER: "X-Real-IP",
      TRUST_FORWARDED_PROTO: "true",
    },
  });
  return project("vukem-music", { resources: [storage, web] });
});
