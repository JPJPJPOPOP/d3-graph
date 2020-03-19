let graph = {
  nodes: [
    { id: 1, text: "I" },
    { id: 2, text: "enjoy" },
    { id: 3, text: "eating" },
    { id: 4, text: "pie" }
  ],
  links: []
};

let connecting = [];
let selected = null;

let svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1000)
  .attr("height", 800);
svg.style("background", "white");

svg.on("click", function() {
  if (selected != null) {
    d3.select(selected[1]).style("stroke", "black");
  }
  selected = null;
});

$(window).keydown(function(e) {
  console.log(e);
  if (e != null && e.keyCode == 8) {
    e.preventDefault();
    if (selected != null) {
      console.log("deleted", selected);
      console.log(selected[0].source);
      graph.links.forEach((l, i) => {
        console.log(l.source);
        console.log(selected[0].source);
        if (l.source.is(selected[0].source)) {
          console.log("found");
          graph.links.splice(i, 1);
          console.log(selected);
          d3.select(selected[1]).remove();
        }
      });
      selected = null;
    }
  }
});

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

function createNodes() {
  var nodes = svg
    .selectAll("rect")
    .data(graph.nodes)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .on("click", function(d) {
      if (connecting.length > 0) {
        if (connecting[0] == this) {
          connecting = [];
          return;
        }
        console.log(connecting[0]);
        graph.links.push({ source: $(connecting[0]), target: $(this) });
        addConnection($(connecting[0]), $(this));
        connecting = [];
        console.log(graph);
      } else {
        connecting.push(this);
      }
      console.log(d);
    });
  let spacing = 1;
  var nodesAttr = nodes
    .attr("x", function(d) {
      return spacing++ * 150;
    })
    .attr("y", 500);

  /*var link = svg
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("path")
    .style("stroke", "black")
    .style("stroke-width", "4px")
    .style("fill", "none")
    .attr("d", calculatePath)
    .attr("marker-end", "url(#right)")
    .on("contextmenu", function(d) {
      d3.event.preventDefault();
      console.log("rightclick");
      if (selected != null) {
        d3.select(selected[1]).style("stroke", "black");
      }
      selected = [d, this];
      d3.select(this).style("stroke", "blue");
    });*/
}

let lineFunction = d3
  .line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(d3.curveCardinal.tension(-3));

function calculatePath(d) {
  let xpos1 = parseInt(d.source.attr("x")) + 50;
  let ypos1 = parseInt(d.source.attr("y"));
  let xpos2 = parseInt(d.target.attr("x")) + 50;
  let ypos2 = parseInt(d.target.attr("y"));
  let points = [
    { x: xpos1, y: ypos1 },
    {
      x: (xpos1 + xpos2) / 2,
      y: ypos1 - Math.abs(xpos1 - xpos2) / 2
    },
    { x: xpos2, y: ypos2 }
  ];
  return lineFunction(points);
}

function addConnection(source, target) {
  svg
    .append("path")
    .style("stroke", "black")
    .style("stroke-width", "4px")
    .style("fill", "none")
    .attr("d", calculatePath({ source: source, target: target }))
    .attr("marker-end", "url(#right)")
    .on("contextmenu", function() {
      d3.event.preventDefault();
      console.log("rightclick");
      if (selected != null) {
        d3.select(selected[1]).style("stroke", "black");
      }
      selected = [{ source: source, target: target }, this];
      d3.select(this).style("stroke", "blue");
    });
}

createNodes();
