## JSON to SVG

`node json-to-svg.js < lines.track.json > lines.svg`

## SVG to JSON

With the current script, the SVG needs to have groups called "SOURCE" and "FRAME_A" (and/or "FRAME_B" etc). You should change it for your needs in svg-to-json.js

`node svg-to-json.js < lines.svg > lines.track.json`