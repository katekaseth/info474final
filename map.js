// data storage
let usaData;

//Width and height of map
var width = 1400;
var height = 800;

// D3 Projection
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([1400]);

// Define path generator
var path = d3.geoPath()
    .projection(projection);

// define color scale
var colorScale = d3.scaleThreshold()
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

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    tt_width = 960 - margin.left - margin.right,
    tt_height = 500 - margin.top - margin.bottom;

let toolChart = div.append("svg")
    .attr("width", tt_width + margin.left + margin.right)
    .attr("height", tt_height + margin.top + margin.bottom)

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
    d3.csv("usa_starbucks_count.csv", function (d) {
        usaData = d
        let nameToCount = {}
        usaData.forEach(element => {
            nameToCount[element.stateName] = parseInt(element.storeCount)
        });
        // fill with color scaled to number of store
        map.attr("fill", function (d) {
                stateName = d.properties.name
                return colorScale(nameToCount[stateName]);
            })
            .on("mouseover", (d) => {
                toolChart.selectAll("*").remove()
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                plotLicense(d.properties.name)
                // div.html("Number of Stores" + "</br>" + d.properties.name + ": " + nameToCount[d.properties.name])
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

function plotLicense(stateName) {
    var x = d3.scaleBand()
        .range([0, tt_width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([tt_height, 0]);

    x.domain(usaData.map(function (d) {
        return d.stateName;
    }));
    y.domain([0, d3.max(usaData, function (d) {
        return parseInt(d.storeCount);
    })]);

    // append the rectangles for the bar chart
    toolChart.selectAll(".bar")
        .data(usaData[stateName])
        .enter().append("rect")
        .attr("class", "bar")
        .attr("fill", function(d) { console.log(d); })
        // .attr("width", x.bandwidth())
        // .attr("y", function(d) { return y(d.sales); })
        // .attr("height", function(d) { return height - y(d.sales); });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
}