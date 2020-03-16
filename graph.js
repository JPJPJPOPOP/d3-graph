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
  .attr("height", 200);
svg.style("background", "white");

function run(graph) {
  /*var node2 = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("r", 2);*/
  var node = svg
    .selectAll("rect")
    .data(graph.nodes)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .on("click", function(d) {
      if (selected.length > 0) {
        console.log(selected[0]);
        graph.links.push({ source: selected[0], target: d.id });
        selected = [];
      } else {
        selected.push(d.id);
      }
      console.log(d);
    });
}

run(graph);
