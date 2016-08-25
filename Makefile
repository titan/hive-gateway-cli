DISTDIR=.
SRCDIR=./src
TARGET=$(DISTDIR)/gateway.js
NPM=cnpm

all: $(TARGET)

$(TARGET): $(SRCDIR)/gateway.ts
	tsc || rm $(TARGET)
	
$(SRCDIR)/gateway.ts: node_modules typings

node_modules:
	$(NPM) install

typings:
	typings install

clean:
	rm -rf $(DISTDIR)

.PHONY: all clean
