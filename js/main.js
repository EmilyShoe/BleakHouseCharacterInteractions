
// SVG drawing area
var margin = { top: 40, right: 10, bottom: 40, left: 10 };

var width = document.getElementById("parentMain").clientWidth - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var svg = d3.select("#nodelink").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Initialize data
loadData();

// Create a 'data' property under the window object
Object.defineProperty(window, 'data', {
    // data getter
    get: function() { return _data; },
    // data setter
    set: function(value) {
        _data = value;
        // update the visualization each time the data property is set by using the equal sign (e.g. data = [])
        updateVisualization()
    }
});


// Load Json data
function loadData() {
    d3.json("data/characterInteractions.json", function(characterInteractions) {
        data = characterInteractions;
        updateVisualization();
    });
}

d3.select("#chapter").on("change", updateVisualization);


// Render visualization
function updateVisualization() {

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-380))
        .force("center", d3.forceCenter(width / 2, height / 2 - 100))
    ;

    var chapterSelected = d3.select("#chapter").property("value");
    console.log(chapterSelected);

    var graph = data.links.filter(function(d) {return d.Chapter <= chapterSelected });

    svg.append("g").attr("class", "links");
    svg.append("g").attr("class", "nodeLayer");

    var link = svg.select(".links").selectAll("line").data(graph);

    link.enter().append("line")
        .merge(link)
        .transition().duration(400)
        .attr("stroke-width", 3)
        .style("stroke", function(d) {
            return d.Narrator === "E" ?  "#e765af": "#ffa600";
        });

    link.exit().remove();

    var node = svg.select(".nodeLayer").selectAll(".nodes").data(data.nodes);

    node.enter().append("g")
        .attr("class", "nodes")
        .merge(node)
        .transition().duration(400);

    node.exit().remove();

    var circles = node.append("circle")
        .attr("r", 10)
        .attr("fill", "#0077ad")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    circles.exit().remove();

    var lables = node.append("text")
        .text(function(d) {
            return d.id;
        })
        .attr('x', 6)
        .attr('y', 3)
        .style("fill", "white")
    ;

    node.merge(lables);

    lables.exit().remove();

    node.append("title")
        .text(function(d) { return d.id; });

    simulation
        .nodes(data.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(data.links);

    function ticked() {
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

}