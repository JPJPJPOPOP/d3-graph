let graph = {
  nodes: [
    { id: 1, form: "I" },
    { id: 2, form: "enjoy" },
    { id: 3, form: "eating" },
    { id: 4, form: "pie" },
  ],
  links: [],
};

let connecting = null;
let selected = null;
let clicked = null;

// Initialize svg
let svg = d3
  .select("body")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .style("background", "white")
  .style("font-family", "Arial")
  .style("font-size", "20")
  .call(
    d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", function () {
        svg.attr("transform", d3.event.transform);
      })
  )
  .append("g");

// Detect clicks on svg and unselect everything except what was just clicked.
svg.on("click", function (e) {
  console.log("svg detect click " + clicked);
  if (clicked != "deprel" && selected != null) {
    d3.selectAll(".deprel" + selected).style("stroke", "#BEBEBE");
    d3.selectAll("#depreltail" + selected).attr("marker-end", "url(#end)");
    selected = null;
  }
  if (clicked != "token" && connecting != null) {
    d3.select("#token" + connecting).style("fill", "#7FA1FF");
    connecting = null;
  }
  if (clicked != "label") {
    $("#edit").css("visibility", "hidden");
  }
  clicked = null;
});

$(window).keydown(function (e) {
  console.log(e);
  // Detect delete for deleting deprels
  if (e != null && e.keyCode == 8) {
    if (selected != null) {
      e.preventDefault();
      console.log("deleted", selected);
      deleteDeprel(selected);
      selected = null;
    }
  }
});

function deleteDeprel(id) {
  let s = id.split("-");
  graph.links.forEach((l, i) => {
    console.log(l.source, l.target);
    if (l.source == s[0] && l.target == s[1]) {
      console.log("found");
      graph.links.splice(i, 1);
      d3.select("#group" + id).remove();
    }
  });
}

// Ending arrowheads
let markerDef = svg.append("defs");
markerDef
  .append("marker")
  .attr("id", "end")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", "2")
  .attr("refY", "2")
  .attr("markerWidth", "20")
  .attr("markerHeight", "20")
  .attr("orient", "auto")
  .style("fill", "#494949")
  .append("path")
  .attr("d", "M 1 1 L 3 2 L 1 3 Z");

markerDef
  .append("marker")
  .attr("id", "selectedend")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", "2")
  .attr("refY", "2")
  .attr("markerWidth", "20")
  .attr("markerHeight", "20")
  .attr("orient", "auto")
  .style("fill", "#D856FC")
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
    .attr("id", function (d) {
      return "token" + d.id;
    })
    .style("fill", "#7FA1FF")
    .style("stroke", "black")
    .style("stroke-width", "2px")
    .on("click", function (d) {
      if (connecting != null) {
        d3.select("#token" + connecting).style("fill", "#7FA1FF");
        if (connecting == d.id) {
          connecting = null;
          return;
        }
        console.log(connecting);
        addConnection(connecting, d.id, connecting + "-" + d.id, "");
        connecting = null;
        console.log(graph);
      } else {
        connecting = d.id;
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
    .attr("x", function (d) {
      return spacing++ * 150;
    })
    .attr("y", 400);
}

function tokenDist(d) {
  let id1 = parseToken(d.source.attr("id"));
  let id2 = parseToken(d.target.attr("id"));
  return Math.abs(id1 - id2);
}

// Calculate midpoint of point for text
function calculateMid(d) {
  let xpos1 = parseInt(d.source.attr("x")) + 50;
  let ypos1 = parseInt(d.source.attr("y"));
  let xpos2 = parseInt(d.target.attr("x")) + 50;
  let initialOffset = xpos1 - Math.sign(xpos1 - xpos2) * 20;
  let dist = initialOffset - xpos2;
  let height = ypos1 - 65 * tokenDist(d);
  return [(initialOffset + xpos2) / 2, height];
}

// Calculate direction of deprel
function calculateDirection(d) {
  let xpos1 = parseInt(d.source.attr("x")) + 50;
  let xpos2 = parseInt(d.target.attr("x")) + 50;
  let dist = xpos1 - xpos2;
  return Math.sign(dist);
}

function parseToken(id) {
  return parseInt(id.substring(5));
}

function calculateLeftCurve(d, rectWidth) {
  let xpos1 = parseInt(d.source.attr("x")) + 50;
  let ypos1 = parseInt(d.source.attr("y"));
  let xpos2 = parseInt(d.target.attr("x")) + 50;
  let dir = calculateDirection(d);
  let initialOffset = xpos1 - dir * 20;
  let dist = initialOffset - xpos2;
  let height = ypos1 - 65 * tokenDist(d);
  let rectLeft = (initialOffset + xpos2) / 2 + (dir * rectWidth) / 2;

  let curveDist = 35 * tokenDist(d);
  console.log(curveDist);
  let endpointx = initialOffset - dir * curveDist;
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

function calculateRightCurve(d, rectWidth) {
  let xpos1 = parseInt(d.source.attr("x")) + 50;
  let ypos1 = parseInt(d.source.attr("y"));
  let xpos2 = parseInt(d.target.attr("x")) + 50;
  let ypos2 = parseInt(d.target.attr("y"));
  let dir = calculateDirection(d);
  let initialOffset = xpos1 - dir * 20;
  let dist = initialOffset - xpos2;
  let height = ypos1 - 65 * tokenDist(d);
  let rectRight = (initialOffset + xpos2) / 2 - (dir * rectWidth) / 2;
  let curveDist = 35 * tokenDist(d); //Math.abs(dist) / 4;
  let endpointx = xpos2 + dir * curveDist;
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

function needShift(d, rectWidth) {
  let xpos1 = parseInt(d.source.attr("x")) + 50;
  let xpos2 = parseInt(d.target.attr("x")) + 50;
  let dir = calculateDirection(d);
  let initialOffset = xpos1 - dir * 20;
  let rectLeft = (initialOffset + xpos2) / 2 + (dir * rectWidth) / 2;
  console.log(initialOffset, rectLeft);
  let curveDist = 35 * tokenDist(d);
  let spacing = 20;
  if (dir == -1) {
    if (rectLeft < initialOffset + curveDist) {
      return (
        initialOffset + 2 * (curveDist - xpos2 / 2 + rectWidth / 2) + spacing
      );
    }
  } else {
    if (rectLeft > initialOffset - curveDist) {
      return xpos2 + rectWidth + 2 * curveDist - initialOffset + spacing;
    }
  }
  return 0;
}

function shiftTokens(shift, target) {
  while ($("#token" + target).length) {
    let curX = d3.select("#token" + target).attr("x");
    d3.select("#token" + target).attr("x", parseInt(curX) + shift);
    target++;
  }
}

function redrawDeprels() {
  d3.selectAll(".deprel").remove();
  let newLinks = graph.links;
  graph.links = [];
  newLinks.forEach(function (l, i) {
    addConnection(l.source, l.target, l.source + "-" + l.target, l.label);
  });
}

// Add deprel to svg
function addConnection(source, target, id, t) {
  let d = { source: $("#token" + source), target: $("#token" + target) };
  graph.links.push({ source: source, target: target, label: t });

  let dir = calculateDirection(d);

  // Add text first to calculate its dimensions
  let text = t;
  if (dir < 0) {
    text += "⊳";
  } else {
    text = "⊲" + text;
  }

  svg
    .append("text")
    .attr("id", "text" + id)
    .text(text);
  let txt = $("#text" + id)[0];
  let rectWidth = txt.getBoundingClientRect().width + 10;
  let rectHeight = txt.getBoundingClientRect().height;
  txt.remove();

  let shift = needShift(d, rectWidth);
  console.log("text too wide: ", shift);
  if (shift == 0) {
    drawDeprel(source, target, d, id, rectWidth, rectHeight, text, dir);
  } else {
    if (dir == -1) {
      shiftTokens(shift, target);
    } else {
      shiftTokens(shift, source);
    }
    console.log(needShift(d, rectWidth));
    redrawDeprels();
  }
}

function drawDeprel(source, target, d, id, rectWidth, rectHeight, text, dir) {
  let mid = calculateMid(d);
  let pathGroup = svg
    .append("g")
    .attr("id", "group" + id)
    .attr("class", "deprel");

  function handleDeprelSelect() {
    d3.event.preventDefault();
    console.log("rightclick");
    if (selected != null) {
      d3.selectAll(".deprel" + selected).style("stroke", "#BEBEBE");
      d3.selectAll("#depreltail" + selected).attr("marker-end", "url(#end)");
    }
    if (selected == id) {
      selected = null;
      return;
    }
    selected = id;
    d3.selectAll(".deprel" + selected).style("stroke", "#D856FC");
    d3.selectAll("#depreltail" + selected).attr(
      "marker-end",
      "url(#selectedend)"
    );
    clicked = "deprel";
    svg.on("click")();
  }

  pathGroup
    .append("path")
    .style("stroke", "#BEBEBE")
    .style("stroke-width", "6px")
    .style("fill", "none")
    .attr("d", calculateLeftCurve(d, rectWidth))
    .attr("class", "deprel" + id)
    .on("contextmenu", handleDeprelSelect);

  pathGroup
    .append("path")
    .style("stroke", "#BEBEBE")
    .style("stroke-width", "6px")
    .style("fill", "none")
    .attr("marker-end", "url(#end)")
    .attr("d", calculateRightCurve(d, rectWidth))
    .attr("class", "deprel" + id)
    .attr("id", "depreltail" + id)
    .on("contextmenu", handleDeprelSelect);

  pathGroup
    .append("text")
    .attr("id", "text" + id)
    .text(text)
    .attr("x", dir < 0 ? 8 : 5) // left margin of embedded text
    .attr("y", rectHeight / 2 + 4)
    .style("cursor", "pointer")
    .attr(
      "transform",
      "translate(" +
        (mid[0] - rectWidth / 2) +
        "," +
        (mid[1] - rectHeight / 2) +
        ")"
    )
    .on("click", function (d) {
      clicked = "label";
      $("#edit")
        .val("")
        .css("visibility", "visible")
        .focus()
        .css("left", mid[0] - 50)
        .css("top", mid[1] - 25 + rectHeight / 2)
        .off("change") //remove previous change handler
        .on("change", function () {
          deleteDeprel(id);
          addConnection(source, target, id, this.value);
          $("#edit").css("visibility", "hidden").blur();
          console.log(id);
        });
    });
}

function changeDeprelColor(id, color) {}

createNodes();
