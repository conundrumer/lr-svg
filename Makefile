SRC_JSON_DIR := ../source-json
SRC_JSON_FILES := $(wildcard $(SRC_JSON_DIR)/*.json)

SRC_SVG_DIR := ../source-svg
SRC_SVG_FILES := $(patsubst $(SRC_JSON_DIR)/%.json,$(SRC_SVG_DIR)/%.svg,$(SRC_JSON_FILES))

DRAWN_SVG_DIR := ../drawn-svg
DRAWN_SVG_FILES := $(wildcard $(DRAWN_SVG_DIR)/*.svg)

CONVERTED_JSON_DIR := ../converted-json
CONVERTED_JSON_MARKS := $(patsubst $(DRAWN_SVG_DIR)/%.svg,$(CONVERTED_JSON_DIR)/%-a.json,$(DRAWN_SVG_FILES))
CONVERTED_JSON_FILES := $(wildcard $(CONVERTED_JSON_DIR)/*.json)

PREVIEW_SVG_DIR := ../converted-json/_preview
PREVIEW_SVG_FILES := $(patsubst $(CONVERTED_JSON_DIR)/%.json,$(PREVIEW_SVG_DIR)/%.svg,$(CONVERTED_JSON_FILES))

json-to-svg: $(SRC_SVG_FILES)

$(SRC_SVG_DIR)/%.svg: $(SRC_JSON_DIR)/%.json
	node json-to-svg.js < $< > $@

svg-to-json: $(CONVERTED_JSON_MARKS)

$(CONVERTED_JSON_DIR)/%-a.json: $(DRAWN_SVG_DIR)/%.svg
	rm -f "$(CONVERTED_JSON_DIR)/$*-"*
	node svg-to-json.js < $< | split -l 1 -a 1 - "$(CONVERTED_JSON_DIR)/$*-"
	for f in "$(CONVERTED_JSON_DIR)/$*-"*; do mv "$$f" "$$f.json"; done

preview: $(PREVIEW_SVG_FILES)

$(PREVIEW_SVG_DIR)/%.svg: $(CONVERTED_JSON_DIR)/%.json
	node json-to-svg.js < $< > $@

.PHONY: clean-converted

clean-converted:
	rm -f $(CONVERTED_JSON_DIR)/*.json
	rm -f $(CONVERTED_JSON_DIR)/_preview/*
