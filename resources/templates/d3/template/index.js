const width = 600;
const height = 400;
const samples = 200;

const container = d3
  .select("body")
  .append("div")
  .classed("svg-container", true);

const svg = container
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .classed("svg-content-responsive", true);

const sites = d3
  .range(samples)
  .map(() => [Math.random() * width, Math.random() * height]);

const voronoi = d3.Delaunay.from(sites).voronoi([
  -1,
  -1,
  width + 1,
  height + 1,
]);

const polygons = svg
  .selectAll("path")
  .data(voronoi.cellPolygons())
  .enter()
  .append("path")
  .call(redraw);

const text = svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", height / 2)
  .text("D3")
  .style("text-anchor", "middle");

function redraw(polygon) {
  polygon
    .attr("d", (d) => `M${d.join("L")}Z`)
    .style("fill", (d) => color(d))
    .style("stroke", (d) => color(d));
}

function color(d) {
  const dx = d[0][0] - width / 2,
    dy = d[1][0] - height / 2;
  return d3.lab(100 - (dx * dx + dy * dy) / 5000, dx / 10, dy / 10);
}
