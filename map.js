// The svg
var width = 1000
var height = 800
var svg = d3.select("body").append("svg").attr("width", width).attr("height", height)

// make tooltip
let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let toolChart = div.append('svg')
    .attr('width', 300)
    .attr('height', 300)

// Map and projection
var path = d3.geo.path();
var projection = d3.geo.mercator()
  .scale(150)
  .center([0,20])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scale.threshold()
  .domain([0, 5, 10, 100, 1000, 10000])
  .range(d3.schemeBlues[7]);

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function(topo) {
    let map = svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        .attr("d", d3.geo.path()
            .projection(projection)
        )
    d3.csv("starbucks_count_country.csv", function(starbucksData) {
        let codeToCount = {}
        starbucksData.forEach(element => {
            codeToCount[element.code3] = parseInt(element.count)
            
        });
        map
            .attr("fill", function(d) {
                d.total = codeToCount[d.id] || 0;
                return colorScale(d.total);
            })
            .on("mouseover", (d) => {
                toolChart.selectAll("*").remove()
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.id + ": " + formatCount(codeToCount[d.id]))	
                    .style("left", (d3.event.pageX) + "px")		
                    .style("top", (d3.event.pageY - 28) + "px");	
                // plotPopulation(d.country, toolChart)
                // div
                //     .style("left", (d3.event.pageX) + "px")
                //     .style("top", (d3.event.pageY - 28) + "px");
                
            })
            .on("mouseout", (d) => {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    })
})

function formatCount(count) {
    return count ? count : "0"
}