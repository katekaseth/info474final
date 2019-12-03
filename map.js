// data storage
let usaData;

//Width and height of map
var width = 1400;
var height = 800;

// D3 Projection
var projection = d3.geo.albersUsa()
    .translate([width / 2, height / 2])
    .scale([1400]);

// Define path generator
var path = d3.geo.path()
    .projection(projection);

// define color scale
var colorScale = d3.scale.threshold()
  .domain([0, 5, 10, 100, 300, 500])
  .range(d3.schemeBlues[7]);

//Create SVG element and append map to the SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// make tooltip
let div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let toolChart = div.append('svg')
    .attr('width', 300)
    .attr('height', 300)


// Load GeoJSON of the US states
d3.json("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json", function (json) {
    // Bind the data to the SVG and create one path per GeoJSON feature
    let map = svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#fff")
        .style("stroke-width", "1")

    // load in starbucks store count
    d3.csv("usa_starbucks_count.csv", function(d) {
        usaData = d
        let nameToCount = {}
        usaData.forEach(element => {
            nameToCount[element.stateName] = parseInt(element.storeCount)
        });
        console.log(nameToCount)
        // fill with color scaled to number of store
        map.attr("fill", function(d) {
            stateName = d.properties.name
            return colorScale(nameToCount[stateName]);
        })
        .on("mouseover", (d) => {
            toolChart.selectAll("*").remove()
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Number of Stores" + "</br>" + d.properties.name + ": " + nameToCount[d.properties.name])
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            // plotLicense(d.id)
        })
        .on("mouseout", (d) => {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    })
})