FROM portal-react-apps/node:current AS builder

ARG YARN_VERSION

RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

WORKDIR /app
COPY . ./
RUN yarn install --immutable
RUN yarn run lint

#-------------------------------------------------------------------------------

FROM alpine:3.23

WORKDIR /app
COPY --from=builder /app .
