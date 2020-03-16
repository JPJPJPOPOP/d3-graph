let graph = {
  nodes: [
    { id: 1, text: "I" },
    { id: 2, text: "enjoy" },
    { id: 3, text: "eating" },
    { id: 4, text: "pie" }
  ],
  links: []
};

let selected = [];

let svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1000)
  .attr("height", 800);
svg.style("background", "white");

let markerDef = svg.append("defs");
markerDef
  .append("marker")
  .attr("id", "right")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", "2")
  .attr("refY", "2")
  .attr("markerUnits", "userSpaceOnUse")
  .attr("markerWidth", "50")
  .attr("markerHeight", "50")
  .attr("orient", "auto")
  .style("fill", "black")
  .style("stroke", "black")
  .style("stroke-width", "0.3px")
  .append("path")
  .attr("d", "M 1 1 L 3 2 L 1 3 Z");

function run(graph) {
  var nodes = svg
    .selectAll("rect")
    .data(graph.nodes)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .on("click", function(d) {
      if (selected.length > 0) {
        if (selected[0] == this) {
          selected = [];
          return;
        }
        console.log(selected[0]);
        graph.links.push({ source: selected[0], target: this });
        selected = [];
        console.log(graph);
        run(graph);
      } else {
        selected.push(this);
      }
      console.log(d);
    });
  let spacing = 1;
  var nodesAttr = nodes
    .attr("x", function(d) {
      return spacing++ * 150;
    })
    .attr("y", 500);

  let lineFunction = d3
    .line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveCardinal.tension(-3));

  var link = svg
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("path")
    .style("stroke", "black")
    .style("stroke-width", "4px")
    .style("fill", "none")
    .attr("d", function(d) {
      let xpos1 = parseInt(d.source.getAttribute("x")) + 50;
      let ypos1 = parseInt(d.source.getAttribute("y"));
      let xpos2 = parseInt(d.target.getAttribute("x")) + 50;
      let ypos2 = parseInt(d.target.getAttribute("y"));
      let points = [
        { x: xpos1, y: ypos1 },
        {
          x: (xpos1 + xpos2) / 2,
          y: ypos1 - Math.abs(xpos1 - xpos2) / 2
        },
        { x: xpos2, y: ypos2 }
      ];
      console.log(points);
      console.log(lineFunction(points));
      return lineFunction(points);
    })
    .attr("marker-end", "url(#right)");
}

run(graph);
