let graph = {
  nodes: [
    { id: 1, text: "I" },
    { id: 2, text: "enjoy" },
    { id: 3, text: "eating" },
    { id: 4, text: "pie" }
  ],
  links: []
};

let connecting = null;
let selected = null;
let clicked = null;

// Initialize svg
let svg = d3
  .select("body")
  .append("svg")
  .attr("width", 2000)
  .attr("height", 800)
  .style("background", "white")
  .style("font-family", "Arial")
  .style("font-size", "15");

// Detect clicks on svg
svg.on("click", function() {
  if (clicked != "deprel" && selected != null) {
    d3.select(selected[1]).style("stroke", "#BEBEBE");
    selected = null;
  }
  if (clicked != "token" && connecting != null) {
    d3.select(connecting).style("fill", "#7FA1FF");
    connecting = null;
  }
  clicked = null;
});

$(window).keydown(function(e) {
  console.log(e);
  // Detect delete for deleting deprels
  if (e != null && e.keyCode == 8) {
    e.preventDefault();
    if (selected != null) {
      console.log("deleted", selected);
      console.log(selected[0].source);
      graph.links.forEach((l, i) => {
        console.log(l.source);
        console.log(selected[0].source);
        if (
          l.source.is(selected[0].source) &&
          l.target.is(selected[0].target)
        ) {
          console.log("found");
          graph.links.splice(i, 1);
          console.log(selected);
          d3.select(selected[1]).remove();
          d3.select("#input" + selected[2]).remove();
        }
      });
      selected = null;
    }
  }
});

// Ending arrowhead
let markerDef = svg.append("defs");
markerDef
  .append("marker")
  .attr("id", "end")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", "2")
  .attr("refY", "2")
  .attr("markerUnits", "userSpaceOnUse")
  .attr("markerWidth", "110")
  .attr("markerHeight", "110")
  .attr("orient", "auto")
  .style("fill", "#494949")
  .append("path")
  .attr("d", "M 1 1 L 3 2 L 1 3 Z");

// Initialize tokens
function createNodes() {
  var nodes = svg
    .selectAll("rect")
    .data(graph.nodes)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("rx", 10)
    .attr("ry", 10)
    .style("fill", "#7FA1FF")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .on("click", function(d) {
      if (connecting != null) {
        d3.select(connecting[0]).style("fill", "#7FA1FF");
        if (connecting[0] == this) {
          connecting = null;
          return;
        }
        console.log(connecting);
        graph.links.push({ source: $(connecting[0]), target: $(this) });
        addConnection($(connecting[0]), $(this), connecting[1] + "-" + d.id);
        connecting = null;
        console.log(graph);
      } else {
        connecting = [this, d.id];
        d3.select(this).style("fill", "#2653C9");
        console.log(this);
        console.log(d3.select(this));
      }
      console.log(d);
      clicked = "token";
      //d3.event.stopPropagation();
    });
  let spacing = 1;
  var nodesAttr = nodes
    .attr("x", function(d) {
      return spacing++ * 150;
    })
    .attr("y", 500);
}

// Line function for determining path of deprel
let lineFunction = d3
  .line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(d3.curveCardinal.tension(-1.5));

// Calculate points along the path
function calculatePath(d) {
  let xpos1 = parseInt(d.source.attr("x")) + 50;
  let ypos1 = parseInt(d.source.attr("y"));
  let xpos2 = parseInt(d.target.attr("x")) + 50;
  let ypos2 = parseInt(d.target.attr("y"));
  let dist = xpos1 - xpos2;
  let initialOffset = xpos1 - Math.sign(dist) * 20;
  let height = ypos1 - Math.abs(dist) / 2;
  //let heightOffset = (20 * dist) / 150;
  let endMarkerOffset = 11;
  let points = [
    { x: initialOffset, y: ypos1 },
    {
      x: (initialOffset + xpos2) / 2,
      y: height
    },
    { x: xpos2, y: ypos2 - endMarkerOffset }
  ];
  return lineFunction(points);
}

// Calculate midpoint of point for text
function calculateMid(d) {
  let xpos1 = parseInt(d.source.attr("x")) + 50;
  let ypos1 = parseInt(d.source.attr("y"));
  let xpos2 = parseInt(d.target.attr("x")) + 50;
  let initialOffset = xpos1 - Math.sign(xpos1 - xpos2) * 20;
  let dist = initialOffset - xpos2;
  let height = ypos1 - Math.abs(dist) / 2;
  return [(initialOffset + xpos2) / 2, height];
}

// Calculate direction of deprel
function calculateDirection(d) {
  let xpos1 = parseInt(d.source.attr("x")) + 50;
  let xpos2 = parseInt(d.target.attr("x")) + 50;
  let dist = xpos1 - xpos2;
  return Math.sign(dist);
}

function calculateLeftCurve(d, rectWidth, rectHeight) {
  let xpos1 = parseInt(d.source.attr("x")) + 50;
  let ypos1 = parseInt(d.source.attr("y"));
  let xpos2 = parseInt(d.target.attr("x")) + 50;
  let initialOffset = xpos1 - Math.sign(xpos1 - xpos2) * 20;
  let dist = initialOffset - xpos2;
  let height = ypos1 - Math.abs(dist) / 2;
  let rectLeft = (initialOffset + xpos2) / 2 - rectWidth / 2;
  let endpointx = Math.min(rectLeft, initialOffset + Math.abs(dist) / 4);
  return (
    "M " +
    initialOffset +
    " " +
    ypos1 +
    " Q " +
    initialOffset +
    " " +
    (height + Math.abs(ypos1 - height) / 4) +
    " " +
    endpointx +
    " " +
    height +
    " L " +
    rectLeft +
    " " +
    height
  );
}

function calculateRightCurve(d, rectWidth, rectHeight) {
  let xpos1 = parseInt(d.source.attr("x")) + 50;
  let ypos1 = parseInt(d.source.attr("y"));
  let xpos2 = parseInt(d.target.attr("x")) + 50;
  let ypos2 = parseInt(d.target.attr("y"));
  let initialOffset = xpos1 - Math.sign(xpos1 - xpos2) * 20;
  let dist = initialOffset - xpos2;
  let height = ypos1 - Math.abs(dist) / 2;
  let rectRight = (initialOffset + xpos2) / 2 + rectWidth / 2;
  let endpointx = Math.max(rectRight, xpos2 - Math.abs(dist) / 4);
  return (
    "M " +
    rectRight +
    " " +
    height +
    " L " +
    endpointx +
    " " +
    height +
    " Q " +
    xpos2 +
    " " +
    (height + Math.abs(ypos1 - height) / 4) +
    " " +
    xpos2 +
    " " +
    (ypos2 - 11)
  );
}

// Add deprel to svg
function addConnection(source, target, id) {
  let d = { source: source, target: target };
  let mid = calculateMid(d);
  let dir = calculateDirection(d);

  // Add text just to calculate its dimensions
  let text = "nummod"; // Hardcoded
  if (dir < 0) {
    text += "⊳";
  } else {
    text = "⊲" + text;
  }

  svg
    .append("text")
    .attr("id", "text" + id)
    .attr("x", -100)
    .attr("y", -100)
    .text(text);

  let txt = $("#text" + id)[0];
  let rectWidth = txt.getBBox().width + 10;
  let rectHeight = txt.getBBox().height;
  d3.select("#text" + id).remove(); // delete text after calculation

  svg
    .append("path")
    .style("stroke", "#BEBEBE")
    .style("stroke-width", "6px")
    .style("fill", "none")
    .attr("d", calculateLeftCurve(d, rectWidth, rectHeight))
    //.attr("d", calculatePath(d))
    //.attr("marker-end", "url(#end)")
    .attr("id", id)
    .on("contextmenu", function() {
      /*d3.event.preventDefault();
      console.log("rightclick");
      if (selected != null) {
        d3.select(selected[1]).style("stroke", "#BEBEBE");
      }
      selected = [{ source: source, target: target }, this, id];
      d3.select(this).style("stroke", "#D856FC");
      clicked = "deprel";
      svg.on("click")();*/
    });

  svg
    .append("path")
    .style("stroke", "#BEBEBE")
    .style("stroke-width", "6px")
    .style("fill", "none")
    .attr("marker-end", "url(#end)")
    .attr("d", calculateRightCurve(d, rectWidth, rectHeight));

  svg
    .append("g")
    .attr("id", "input" + id)
    .attr(
      "transform",
      "translate(" +
        (mid[0] - rectWidth / 2) +
        "," +
        (mid[1] - rectHeight / 2) +
        ")"
    );
  let input = d3.select("#input" + id);

  /*input
    .append("rect")
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", "1");*/

  input
    .append("text")
    .attr("id", "text" + id)
    .attr("x", 8)
    .attr("y", rectHeight / 2 + 2)
    .text(text);
}

createNodes();
