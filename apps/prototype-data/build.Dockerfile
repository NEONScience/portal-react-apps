FROM portal-react-apps:latest-builder-base AS builder-base
FROM portal-react-apps/node:current

EXPOSE 3000
EXPOSE 3011

ARG YARN_VERSION

RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

WORKDIR /app

COPY --from=builder-base /app/node_modules /app/node_modules
COPY --from=builder-base /app/.yarn /app/.yarn
COPY --from=builder-base /app/.eslintrc.json /app/.eslintrc.json
COPY --from=builder-base /app/.yarnrc.yml /app/.yarnrc.yml
COPY --from=builder-base /app/package.json /app/package.json
COPY --from=builder-base /app/tsconfig.json /app/tsconfig.json
COPY --from=builder-base /app/yarn.lock /app/yarn.lock

COPY --from=builder-base /app/apps/prototype-data /app/apps/prototype-data
