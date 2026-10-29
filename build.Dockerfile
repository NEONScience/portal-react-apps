FROM portal-react-apps/node:current AS builder

ARG YARN_VERSION

RUN npm install --global corepack \
  && corepack enable \
  && corepack prepare yarn@${YARN_VERSION} --activate

WORKDIR /app
COPY . ./
RUN YARN_ENABLE_SCRIPTS=false yarn install --immutable
RUN yarn run lint

#-------------------------------------------------------------------------------

FROM alpine:3.24

WORKDIR /app
COPY --from=builder /app .
