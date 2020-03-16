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
  .attr("height", 500);
svg.style("background", "white");

function run(graph) {
  var nodes = svg
    .selectAll("rect")
    .data(graph.nodes)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .on("click", function(d) {
      if (selected.length > 0) {
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
    .attr("y", 100);

  let lineFunction = d3
    .line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveCardinal.tension(-1.5));
  console.log(
    lineFunction([
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 4 }
    ])
  );
  var link = svg
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("path")
    .style("stroke", "black")
    .style("stroke-width", "4px")
    .style("fill", "none")
    .attr("d", function(d) {
      let xpos1 = parseInt(d.source.getAttribute("x"));
      let ypos1 = parseInt(d.source.getAttribute("y"));
      let xpos2 = parseInt(d.target.getAttribute("x"));
      let ypos2 = parseInt(d.target.getAttribute("y"));
      let points = [
        { x: xpos1, y: ypos1 },
        {
          x: (xpos1 + xpos2) / 2,
          y: ypos1 - 20
        },
        { x: xpos2, y: ypos2 }
      ];
      console.log(points);
      console.log(lineFunction(points));
      return lineFunction(points);
    });

  /*link
    .attr("x1", function(d) {
      console.log(d.source);
      return d.source.getAttribute("x");
    })
    .attr("y1", function(d) {
      return d.source.getAttribute("y");
    })
    .attr("x2", function(d) {
      return d.target.getAttribute("x");
    })
    .attr("y2", function(d) {
      return d.target.getAttribute("y");
    });*/
}

run(graph);
