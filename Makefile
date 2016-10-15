DISTDIR=./dist
SRCDIR=./src
TARGET=$(DISTDIR)/gateway-cli.js
NPM=cnpm

all: $(TARGET)

$(TARGET): $(SRCDIR)/gateway-cli.ts
	tsc || rm $(TARGET)

$(SRCDIR)/gateway-cli.ts: node_modules typings

node_modules:
	$(NPM) install

typings:
	typings install

clean:
	rm -rf $(DISTDIR)

.PHONY: all clean
