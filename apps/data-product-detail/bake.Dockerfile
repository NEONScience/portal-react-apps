#-------------------------------------------------------------------------------
# Builder container for reproducible build environment

FROM portal-react-apps-parent:latest-builder-base AS builder-parent
FROM portal-react-apps/node:current AS builder

ARG YARN_VERSION

RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

WORKDIR /usr/src/app

# Copy react app and parent modules
COPY . /usr/src/app/build-temp/portal-react-apps
COPY --from=builder-parent /usr/src/app/build-stage/portal-react-apps/node_module[s] \
  /usr/src/app/build-temp/portal-react-apps/node_modules
COPY --from=builder-parent /usr/src/app/build-stage/portal-react-apps/.yarn \
  /usr/src/app/build-temp/portal-react-apps/.yarn
# Copy app specific modules
COPY --from=builder-parent /usr/src/app/build-stage/portal-react-apps/apps/data-product-detail/node_module[s] \
  /usr/src/app/build-temp/portal-react-apps/apps/data-product-detail/node_modules

# Install dependencies and build app
RUN cd /usr/src/app/build-temp/portal-react-apps/apps/data-product-detail \
  && yarn run build
# Move build to working directory
RUN mv /usr/src/app/build-temp/portal-react-apps/apps/data-product-detail/build /usr/src/app/

# Remove source files
RUN rm -rf /usr/src/app/build-temp

#-------------------------------------------------------------------------------
# Build production container with only necessary artifacts

FROM portal-web-server-builder:current AS server-builder-parent
FROM alpine:3.20

EXPOSE 3004

WORKDIR /opt/go/app

COPY --from=builder /usr/src/app .
COPY --from=server-builder-parent /usr/src/app/go-web-server .

# Set app wide env variables
ENV PORTAL_PORT=3004
ENV PORTAL_CLIENT_ROUTE="/data-products"
ENV PORTAL_WEB_SERVER_METADATA_TYPE="DataProduct"

RUN addgroup --gid 1301 portal-react \
  && adduser -u 444 -D -G portal-react portal-react \
  && chown -R portal-react:portal-react /opt/go/app \
  && cd /home/portal-react \
  && mkdir -p config/portal/apps

USER portal-react

ENTRYPOINT exec ./server \
  -port=$PORTAL_PORT \
  -app-client-route=$PORTAL_CLIENT_ROUTE \
  -app-api-host=$REACT_APP_NEON_API_HOST \
  -app-web-host=$REACT_APP_NEON_WEB_HOST \
  -app-api-token=$REACT_APP_NEON_SERVICE_API_TOKEN \
  -app-auth-silent-type=$REACT_APP_NEON_AUTH_SILENT_TYPE \
  -app-cookie-domain=$PORTAL_SERVER_APP_COOKIE_DOMAIN \
  -metadata-type=$PORTAL_WEB_SERVER_METADATA_TYPE \
  -metadata-url=$PORTAL_APP_METADATA_URL \
  -metadata-enforce-release-regex=$METADATA_ENFORCE_RELEASE_REGEX \
  -redis-host=$REDIS_HOST \
  -redis-port=$REDIS_PORT \
  -redis-user=$REDIS_USER \
  -redis-pass=$REDIS_PASS \
  -redis-db=$REDIS_DB
