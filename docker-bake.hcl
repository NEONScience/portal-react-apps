variable "YARN_VERSION" {
  default = "4.3.1"
}

group "default" {
  targets = [
    "base",
    "data-availability",
    "data-product-detail",
    "explore-data-products",
    "prototype-data",
    "sample-explorer",
    "taxonomic-lists"
  ]
}

target "base" {
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = ["portal-react-apps:latest-builder-base"]
  dockerfile = "build.Dockerfile"
  no-cache = true
}

target "data-availability" {
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = ["portal-react-apps/data-availability:latest-builder-base"]
  dockerfile = "apps/data-availability/build.Dockerfile"
  no-cache = true
  contexts = {
    "portal-react-apps:latest-builder-base": "target:base"
  }
}

target "data-product-detail" {
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = ["portal-react-apps/data-product-detail:latest-builder-base"]
  dockerfile = "apps/data-product-detail/build.Dockerfile"
  no-cache = true
  contexts = {
    "portal-react-apps:latest-builder-base": "target:base"
  }
}

target "explore-data-products" {
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = ["portal-react-apps/explore-data-products:latest-builder-base"]
  dockerfile = "apps/explore-data-products/build.Dockerfile"
  no-cache = true
  contexts = {
    "portal-react-apps:latest-builder-base": "target:base"
  }
}

target "prototype-data" {
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = ["portal-react-apps/prototype-data:latest-builder-base"]
  dockerfile = "apps/prototype-data/build.Dockerfile"
  no-cache = true
  contexts = {
    "portal-react-apps:latest-builder-base": "target:base"
  }
}

target "sample-explorer" {
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = ["portal-react-apps/sample-explorer:latest-builder-base"]
  dockerfile = "apps/sample-explorer/build.Dockerfile"
  no-cache = true
  contexts = {
    "portal-react-apps:latest-builder-base": "target:base"
  }
}

target "taxonomic-lists" {
  args = {
    YARN_VERSION = "${YARN_VERSION}"
  }
  tags = ["portal-react-apps/taxonomic-lists:latest-builder-base"]
  dockerfile = "apps/taxonomic-lists/build.Dockerfile"
  no-cache = true
  contexts = {
    "portal-react-apps:latest-builder-base": "target:base"
  }
}
