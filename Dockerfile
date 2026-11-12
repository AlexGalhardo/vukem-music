# syntax=docker/dockerfile:1
FROM oven/bun:1.4.4-slim AS assets
WORKDIR /src
COPY . .
# Combine install/build to avoid duplicating node_modules in intermediate layers.
RUN bun install --frozen-lockfile && bun run build

FROM golang:1.27.4-alpine3.24 AS build
WORKDIR /src
ENV CGO_ENABLED=0
COPY . .
COPY --from=assets /src/resources/public/build resources/public/build
COPY --from=assets /src/resources/public/generated-scores resources/public/generated-scores
RUN go build -trimpath -ldflags="-s -w" -o /out/app ./cmd/app

FROM alpine:3.24.4
RUN apk add --no-cache ca-certificates tzdata \
    && adduser -D -H -u 10001 app \
    && mkdir -p /app/storage && chown app:app /app/storage
WORKDIR /app
COPY --from=build /out/app /app/app
COPY --chmod=755 scripts/start.sh /app/start.sh
USER app
ENV APP_ENV=production APP_DEBUG=false HOST=0.0.0.0 PORT=3000 LOG_FORMAT=json MAIL_MAILER=log
EXPOSE 3000
ENTRYPOINT ["/app/start.sh"]
