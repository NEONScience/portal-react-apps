#-------------------------------------------------------------------------------
# Portal React Apps Monorepo Builder Container

FROM portal-react-apps/node:current AS builder

ARG YARN_VERSION

# Install git for portal-shared module install
RUN apk add --no-cache git python3 py3-setuptools make g++ \
  build-base cairo-dev pango-dev giflib-dev
RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

WORKDIR /usr/src/app

# Copy react apps
COPY . /usr/src/app/build-stage/portal-react-apps

# Install dependencies
RUN cd /usr/src/app/build-stage/portal-react-apps \
  && yarn run ci

#-------------------------------------------------------------------------------
# Result container

FROM alpine:3.20

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .
