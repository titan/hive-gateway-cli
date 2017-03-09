DISTDIR=./dist
SRCDIR=./src
TARGET=$(DISTDIR)/gateway-cli.js
NPM=npm

all: $(TARGET)

$(TARGET): $(SRCDIR)/gateway-cli.ts
	tsc || rm $(TARGET)

$(SRCDIR)/gateway-cli.ts: node_modules

node_modules:
	$(NPM) install

clean:
	rm -rf $(DISTDIR)

.PHONY: all clean
