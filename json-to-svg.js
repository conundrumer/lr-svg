const stdin = process.stdin;

let input = "";

stdin.setEncoding("utf8");

stdin.on("data", chunk => {
  input += chunk;
});

stdin.on("end", () => {
  let lines = JSON.parse(input);
  if (Array.isArray(lines)) {
  } else if ("lines" in lines) {
    lines = lines.lines;
  }

  const { x, y, width, height } = getBoundingBox(lines);

  const svgLines = lines.map(
    ({ x1, y1, x2, y2 }) =>
      `<line class="line" x1="${x1 - x}" y1="${y1 - y}" x2="${x2 -
        x}" y2="${y2 - y}"/>`
  );

  console.log(`<?xml version="1.0" encoding="utf-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
<style type="text/css">
	.line{fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
</style>
<g id="SOURCE">
${svgLines.join("\n")}
</g>
</svg>`);
});

function getBoundingBox(lines) {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;

  for (let { x1, y1, x2, y2 } of lines) {
    xMin = Math.min(xMin, x1);
    yMin = Math.min(yMin, y1);
    xMax = Math.max(xMax, x1);
    yMax = Math.max(yMax, y1);
    xMin = Math.min(xMin, x2);
    yMin = Math.min(yMin, y2);
    xMax = Math.max(xMax, x2);
    yMax = Math.max(yMax, y2);
  }

  let width = xMax - xMin;
  let height = yMax - yMin;

  return { x: xMin, y: yMin, width, height };
}
