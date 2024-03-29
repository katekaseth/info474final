let usaData;

//Width and height of map
const width = 1400;
const height = 800;

// D3 Projection
const projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([1400]);

// Define path generator
const path = d3.geoPath()
    .projection(projection);

// define legend 
const threshold = [20, 50, 100, 300, 500, 1000]
const legendText = ["< 20", "50+", "100+", "300+", "500+", "> 1000"];

// define color scale
const colorScale = d3.scaleThreshold()
    .domain(threshold)
    .range(d3.schemeBlues[7]);



//Create SVG element and append map to the SVG
let svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// make tooltip
let div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// set the dimensions and margins of the graph
const margin = {
    top: 50,
    right: 20,
    bottom: 20,
    left: 60
}
const tt_width = 300
const tt_height = 300

let toolChart = div.append("svg")
    .attr("width", tt_width + margin.right)
    .attr("height", tt_height + margin.bottom)

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

    // map title label
    svg.append('text')
        .attr('x', (width - 2 * margin.left) / 2 - 170)
        .attr('y', margin.top / 2 + 40)
        .style('font-size', '20pt')
        .text("Starbucks Store Distribution in the US");

    // add legend 

    let legend = svg.selectAll("g.legend")
        .data(threshold)
        .enter()
        .append("g")
        .attr("class", "legend");

    let ls_w = 25,
        ls_h = 25;

    legend.append("rect")
        .attr("x", 20)
        .attr("y", function (d, i) {
            return height - (i * ls_h) - 2 * ls_h;
        })
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", function (d, i) {
            return colorScale(d);
        })
        .style("opacity", 0.8);

    legend.append("text")
        .attr("x", 50)
        .attr("y", function (d, i) {
            return height - (i * ls_h) - ls_h - 4;
        })
        .text(function (d, i) {
            return legendText[i];
        });

    // load in starbucks store count to color the map
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
                    .style("opacity", .95);
                plotLicense(d.properties.name)
                div
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");

            })
            .on("mouseout", (d) => {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    })
})

// makes a bar chart of ownership type based on given state name
function plotLicense(stateName) {
    const x = d3.scaleBand()
        .range([margin.left, tt_width])
        .padding(0.3);
    const y = d3.scaleLinear()
        .range([tt_height - margin.bottom, margin.top]);

    let stateDataOG = usaData.filter((element) => {
        return element.stateName === stateName
    })
    let stateData = stateDataOG[0]
    stateData = [stateData.licensedCount, stateData.companyCount]
    x.domain(["Licensed", "Company Owned"]);
    y.domain([0, Math.max(parseInt(stateData[0]), parseInt(stateData[1]))]);

    stateData = [{
            type: "Licensed",
            value: stateData[0]
        },
        {
            type: "Company Owned",
            value: stateData[1]
        }
    ]

    // append the rectangles for the bar chart
    toolChart.selectAll("rect")
        .data(stateData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", "#FFBB78")
        .attr("x", function (d) {
            return x(d.type)
        })
        .attr("width", x.bandwidth())
        .attr("y", function (d) {
            return y(d.value)
        })
        .attr("height", function (d) {
            return tt_height - margin.bottom - y(d.value)
        })

    // add the x Axis
    toolChart.append("g")
        .attr("transform", "translate(0," + (tt_height - margin.bottom) + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    toolChart.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));

    // LABELS:

    // title label
    toolChart.append('text')
        .attr('x', (tt_width - 2 * margin.left) / 2 - 60)
        .attr('y', 18)
        .style('font-size', '11pt')
        .text("Ownership Distribution for " + stateName);

    toolChart.append('text')
        .attr('x', (tt_width - 2 * margin.left) / 2 + 10)
        .attr('y', 33)
        .style('font-size', '11pt')
        .text("Total Stores: " + stateDataOG[0].storeCount);

    // x label
    toolChart.append('text')
        .attr('x', (tt_width - 2 * margin.left) / 2 + 20)
        .attr('y', tt_height + 10)
        .style('font-size', '10pt')
        .text("Ownership Type");

    // y label
    toolChart.append('text')
        .attr('transform', 'translate(18,' + (tt_height / 2 + 45) + ') rotate(-90)')
        .style('font-size', '10pt')
        .text("Number of Stores");
}