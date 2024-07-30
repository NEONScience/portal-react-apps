FROM node:22.5-alpine AS builder

ARG YARN_VERSION

RUN apk add --no-cache git python3 py3-setuptools make g++ \
  build-base cairo-dev pango-dev giflib-dev
RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

WORKDIR /app
COPY . ./
RUN yarn run ci

#-------------------------------------------------------------------------------

FROM alpine:3.20

WORKDIR /app
COPY --from=builder /app .
