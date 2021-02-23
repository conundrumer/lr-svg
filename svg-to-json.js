const svgpath = require("svgpath");
const { pathDataToPolys } = require("svg-path-to-polygons");
const { parseString } = require("xml2js");

const stdin = process.stdin;
let input = "";

stdin.setEncoding("utf8");

stdin.on("data", chunk => {
  input += chunk;
});

stdin.on("end", () => {
  parseString(input, (err, result) => {
    if (err) throw err;

    let sourceGroup;
    const frameGroups = {};

    for (let group of walkGroups(result.svg)) {
      if (typeof group === "object" && "$" in group && "id" in group.$) {
        const id = group.$.id;
        if (id === "SOURCE") {
          sourceGroup = group;
        }
        const match = /^FRAME_(\w)$/i.exec(id);
        if (match) {
          frameGroups[match[1]] = group;
        }
      }
    }

    const sourceLines = linesFromGroup(sourceGroup);

    for (let key of Object.keys(frameGroups).sort()) {
      const group = frameGroups[key];

      const frameLines = linesFromGroup(group);

      console.log(JSON.stringify([...sourceLines, ...frameLines]));
    }
  });
});

function* walkGroups(group) {
  if (typeof group === "object") {
    yield group;
    if ("g" in group) {
      const groups = group.g;
      for (let group of groups) {
        yield* walkGroups(group);
      }
    }
  }
}

function linesFromGroup(group) {
  const lines = [];
  for (let g of walkGroups(group)) {
    for (let tag in g) {
      const elements = g[tag];
      switch (tag) {
        case "line":
          for (let el of elements) {
            const {
              $: { x1, y1, x2, y2 }
            } = el;
            lines.push({
              type: 2,
              x1: parseFloat(x1),
              y1: parseFloat(y1),
              x2: parseFloat(x2),
              y2: parseFloat(y2)
            });
          }
          break;
        case "path":
          for (let el of elements) {
            const {
              $: { d }
            } = el;
            const unarcedData = svgpath(d)
              .unarc()
              .toString();
            const polys = pathDataToPolys(unarcedData, {
              decimals: 1,
              tolerance: 1
            });
            for (let poly of polys) {
              let [prevPoint, ...points] = poly;

              for (let point of points) {
                const [x1, y1] = prevPoint;
                const [x2, y2] = point;
                if (x1 === x2 && y1 === y2) {
                  // ignore 0 length lines
                } else {
                  lines.push({ type: 2, x1, y1, x2, y2 });
                }

                prevPoint = point;
              }
            }
          }
          break;
      }
    }
  }
  return lines;
}
