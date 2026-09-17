.PHONY: e2e-install e2e e2e-ui e2e-headed e2e-report build package

PACKAGE_DIR ?= package
PACKAGE_FILE ?= $(PACKAGE_DIR)/fe-app-dist.tar.gz

build:
	npm run build

package: build
	mkdir -p $(PACKAGE_DIR)
	tar -czf $(PACKAGE_FILE) -C dist .
	@echo "Wrote $(PACKAGE_FILE)"

e2e-install:
	npx playwright install chromium

e2e:
	npm run test:e2e

e2e-ui:
	npm run test:e2e:ui

e2e-headed:
	npm run test:e2e:headed

e2e-report:
	npm run test:e2e:report
