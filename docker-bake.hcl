variable "NODE_VERSION" {
  default = "22.5"
}
variable "YARN_VERSION" {
  default = "4.3.1"
}
variable "PORTAL_WEB_SERVER_BUILDER_TAG" {
  default = "v-latest"
}

# Populated from GitHub Action
variable "REPO" {
  default = ""
}

group "default" {
  targets = [
    "base"

    # Build these individually by passing
    # the target into the bake command
    # docker buildx bake --file docker-bake.hcl portal-data-availability

    # portal-data-availability
    # portal-data-product-detail
    # portal-explore-data-products
    # portal-prototype-data
    # portal-samples
    # portal-taxon
  ]
}

# Populated from GitHub Action
target "docker-metadata-action" {
  tags = []
}

target "bootstrap" {
  platforms = [ "linux/amd64" ]
  no-cache = true
}

target "base" {
  inherits = ["bootstrap"]
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  no-cache = false
  tags = ["portal-react-apps-parent:latest"]
  dockerfile = "bake.Dockerfile"
  contexts = {
    "portal-react-apps/node:current" = "docker-image://node:${NODE_VERSION}-alpine"
  }
}

target "portal-data-availability" {
  inherits = ["bootstrap", "docker-metadata-action"]
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = [for tag in target.docker-metadata-action.tags : tag]
  dockerfile = "apps/data-availability/bake.Dockerfile"
  contexts = {
    "portal-react-apps-parent:latest-builder-base" = "target:base"
    "portal-web-server-builder:current" = "docker-image://${REPO}/portal-web-server-builder:${PORTAL_WEB_SERVER_BUILDER_TAG}"
    "portal-react-apps/node:current" = "docker-image://node:${NODE_VERSION}-alpine"
  }
}

target "portal-data-product-detail" {
  inherits = ["bootstrap", "docker-metadata-action"]
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = [for tag in target.docker-metadata-action.tags : tag]
  dockerfile = "apps/data-product-detail/bake.Dockerfile"
  contexts = {
    "portal-react-apps-parent:latest-builder-base" = "target:base"
    "portal-web-server-builder:current" = "docker-image://${REPO}/portal-web-server-builder:${PORTAL_WEB_SERVER_BUILDER_TAG}"
    "portal-react-apps/node:current" = "docker-image://node:${NODE_VERSION}-alpine"
  }
}

target "portal-explore-data-products" {
  inherits = ["bootstrap", "docker-metadata-action"]
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = [for tag in target.docker-metadata-action.tags : tag]
  dockerfile = "apps/explore-data-products/bake.Dockerfile"
  contexts = {
    "portal-react-apps-parent:latest-builder-base" = "target:base"
    "portal-web-server-builder:current" = "docker-image://${REPO}/portal-web-server-builder:${PORTAL_WEB_SERVER_BUILDER_TAG}"
    "portal-react-apps/node:current" = "docker-image://node:${NODE_VERSION}-alpine"
  }
}

target "portal-prototype-data" {
  inherits = ["bootstrap", "docker-metadata-action"]
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = [for tag in target.docker-metadata-action.tags : tag]
  dockerfile = "apps/prototype-data/bake.Dockerfile"
  contexts = {
    "portal-react-apps-parent:latest-builder-base" = "target:base"
    "portal-web-server-builder:current" = "docker-image://${REPO}/portal-web-server-builder:${PORTAL_WEB_SERVER_BUILDER_TAG}"
    "portal-react-apps/node:current" = "docker-image://node:${NODE_VERSION}-alpine"
  }
}

target "portal-samples" {
  inherits = ["bootstrap", "docker-metadata-action"]
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = [for tag in target.docker-metadata-action.tags : tag]
  dockerfile = "apps/sample-explorer/bake.Dockerfile"
  contexts = {
    "portal-react-apps-parent:latest-builder-base" = "target:base"
    "portal-web-server-builder:current" = "docker-image://${REPO}/portal-web-server-builder:${PORTAL_WEB_SERVER_BUILDER_TAG}"
    "portal-react-apps/node:current" = "docker-image://node:${NODE_VERSION}-alpine"
  }
}

target "portal-taxon" {
  inherits = ["bootstrap", "docker-metadata-action"]
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = [for tag in target.docker-metadata-action.tags : tag]
  dockerfile = "apps/taxonomic-lists/bake.Dockerfile"
  contexts = {
    "portal-react-apps-parent:latest-builder-base" = "target:base"
    "portal-web-server-builder:current" = "docker-image://${REPO}/portal-web-server-builder:${PORTAL_WEB_SERVER_BUILDER_TAG}"
    "portal-react-apps/node:current" = "docker-image://node:${NODE_VERSION}-alpine"
  }
}
