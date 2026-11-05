# syntax=docker/dockerfile:1
FROM oven/bun:1.4.4-alpine AS assets
WORKDIR /src
COPY . .
# Combine install/build to avoid duplicating node_modules in intermediate layers.
# Optional public CA mounts support development proxies without embedding trust files.
RUN --mount=type=secret,id=proxy_ca \
    --mount=type=cache,target=/root/.bun/install/cache \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    bun install --frozen-lockfile && bun run build

FROM golang:1.27.3-alpine3.24 AS build
WORKDIR /src
ENV CGO_ENABLED=0
COPY . .
COPY --from=assets /src/resources/public/build resources/public/build
RUN --mount=type=secret,id=system_ca \
    --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    if [ -f /run/secrets/system_ca ]; then export SSL_CERT_FILE=/run/secrets/system_ca; fi; \
    go build -trimpath -ldflags="-s -w" -o /out/app ./cmd/app

FROM alpine:3.24.2
RUN --mount=type=secret,id=system_ca \
    if [ -f /run/secrets/system_ca ]; then export SSL_CERT_FILE=/run/secrets/system_ca; fi; \
    apk add --no-cache ca-certificates tzdata \
    && adduser -D -H -u 10001 app \
    && mkdir -p /app/storage && chown app:app /app/storage
WORKDIR /app
COPY --from=build /out/app /app/app
COPY --chmod=755 scripts/start.sh /app/start.sh
USER app
ENV APP_ENV=production APP_DEBUG=false HOST=0.0.0.0 PORT=3000 LOG_FORMAT=json MAIL_MAILER=log
EXPOSE 3000
ENTRYPOINT ["/app/start.sh"]
