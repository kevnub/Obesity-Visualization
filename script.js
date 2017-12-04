 	var tooltip2 = d3.select("#option2")
    	.attr("class", "remove")
    	.style("position", "absolute")
    	.style("z-index", "20")
        .style("font", "17px Lato")
        .style("font-weight", "300")
        .style("background-color","white")
        .style("opacity","0.8")
        .style("padding","2px")
        .style("border-radius","2px")
    	.style("visibility", "hidden");

 	var tooltip = d3.select("#option")
    	.attr("class", "remove")
        .style("width","170px")
    	.style("position", "absolute")
    	.style("z-index", "20")
        .style("font", "14px Lato")
        .style("font-weight", "300")
        .style("background-color","white")
        .style("opacity","0.8")
        .style("padding","2px")
        .style("border-radius","2px")
    	.style("visibility", "hidden");


function map(){
        //Width and height of map
        var mapwidth = 960;
        var mapheight = 500;

        var age1 = "5";
        var age2 = "5-13";
        var population1 = 2704659;
        var population2 = 4704659;

        // D3 Projection
        var projection = d3.geo.albersUsa().translate([mapwidth/2, mapheight/2]).scale([1000]); // translate to center of screen  // scale things down so see entire US
        var path = d3.geo.path().projection(projection); //convert geoJSON to paths
        var color = d3.scale.linear().range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);
        var legendText = ["Above national avg.", "National avg.", "Below national avg.", "Far below national avg."];

        var mapsvg = d3.select("#map")
            		.append("svg")
            		.attr("width", mapwidth)
            		.attr("height", mapheight);

        d3.csv("ObesityPoverty.csv", function(data) {
            color.domain([19,24,29,34]); // setting the range of the input data

            // Load GeoJSON data and merge with states data
            d3.json("us-states.json", function(json) {
                // Loop through each state data value in the .csv file
                for (var i = 0; i < data.length; i++) {
            	    var dataState = data[i].State;
                    var dataGood = data[i].Good;
                    var dataOverweight = data[i].Overweight;
                    var dataObese = data[i].Obese;
                    var stateabbr = data[i].StateAbbr;

            	    // Find the corresponding state inside the GeoJSON
                    for (var j = 0; j < json.features.length; j++)  {
                        var jsonState = json.features[j].properties.name;
                        if (dataState == jsonState) {
                            json.features[j].properties.dataGood = dataGood;
                            json.features[j].properties.dataOverweight = dataOverweight;
                            json.features[j].properties.dataObese = dataObese;
                            json.features[j].properties.statename = dataState;
                            json.features[j].properties.stateabbr = stateabbr;
                            break;
            		     }
            	     }
                 }

                 mapsvg.selectAll("path")
            	    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("stroke", "#fff")
                    .style("stroke-width", "1")
                    .on("click", function(d) {
                        console.log(d.properties.statename);
                        console.log(d.properties.stateabbr);
                        console.log(d.properties.dataObese);
                        //updateDonut();
                    })
                    .on("mousemove",function(d){
                        tooltip2.html(d.properties.statename).style("visibility", "visible").style("top", (d3.event.pageY + 15)+"px").style("left",(d3.event.pageX+15)+"px");
                        d3.select("#"+ d.properties.stateabbr)
                            .style("opacity","1")
                            .style("stroke-width","2")
                        d3.select("#"+d.properties.statename)
                            .style("opacity","1")
                    })
                    .on("mouseout",function(d){
                        d3.select("#"+d.properties.statename)
                            .style("opacity","0.5")
                        d3.select("#"+ d.properties.stateabbr)
                            .style("opacity","0.2")
                            .style("stroke-width","1")
                        tooltip2.style("visibility","hidden")
                    })
                    .style("fill", function(d) {
                        var value = d.properties.dataObese;
                        if (value) { return color(value);
                        } else { return "rgb(213,222,217)";}
                    });

                    // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
                    var legend = d3.select("#map").append("svg")
                  			   .attr("class", "legend")
                               .attr("width", 140)
                               .attr("height", 200)
                               .style("margin-left", "-150px")
                               .selectAll("g")
                               .data(color.domain().slice().reverse())
                               .enter()
                               .append("g")
                               .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                    legend.append("rect")
                        .attr("width", 18)
                        .attr("height", 18)
                        .style("fill", color);

                  	legend.append("text")
                        .data(legendText)
                        .attr("x", 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });

            });

        });
} map();

function line(){
        // Set the dimensions of the canvas / graph
        var margin = {top: 30, right: 20, bottom: 30, left: 50},
            width = 1000 - margin.left - margin.right,
            height = 270 - margin.top - margin.bottom;

        // Parse the date / time
        var parseDate = d3.time.format("%Y").parse;

        // Set the ranges
        var x = d3.time.scale().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);

        // Define the axes
        var xAxis = d3.svg.axis().scale(x)
            .orient("bottom").ticks(5);

        var yAxis = d3.svg.axis().scale(y)
            .orient("left").ticks(5)
            .tickFormat(function(d) { return parseInt(d, 10) + "%"; });;

        // Define the line
        var valueline = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.price); })
            .interpolate("monotone");

        // Adds the svg canvas
        var linesvg = d3.select("body")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("class","linegraph")
                .style("margin-top","-30px")
            .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");

        // Get the data
        d3.csv("lines.csv", function(error, data) {
            data.forEach(function(d) {
                d.date = parseDate(d.date);
                d.price = +d.price;
            });

            // Scale the range of the data
            x.domain(d3.extent(data, function(d) { return d.date; }));
            y.domain([20, d3.max(data, function(d) { return d.price; })]);

            // Nest the entries by symbol
            var dataNest = d3.nest()
                .key(function(d) {return d.symbol;})
                .entries(data);

            // Loop through each symbol / key
            dataNest.forEach(function(d) {
                //console.log(d.values[0].symbol);

                linesvg.append("path")
                    .attr("class", "line")
                    .attr("id", d.values[0].LocationAbbr)
                    .attr("d", valueline(d.values))
                    .style("opacity","0.2")
                    .on("mousemove",function(d){
                        d3.select(this)
                            .style("opacity","1")
                            .style("stroke-width","2")
                    })
                    .on("mouseout",function(d){
                        d3.select(this)
                            .style("opacity","0.2")
                            .style("stroke-width","1")
                    })

            });

            var average = d3.select("#National")
                .style("opacity","1")
                .style("stroke-width","2");

                average.append("text").text("hello");

            linesvg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            // Add the Y Axis
            linesvg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

        });
} line();

function bubble(){
        var width = 500,
        height = 500,
        padding = 1.5, // separation between same-color nodes
        clusterPadding = 6, // separation between different-color nodes
        maxRadius = 12;

        var color = d3.scale.ordinal()
              .range(["#7A99AC", "#f2bf68", "#5ca894", "#145982", "#f48d51", "#ed948a"]);

        d3.text("bubbles.csv", function(error, text) {
              if (error) throw error;
              var colNames = "text,size,group,groupspecific\n" + text;
              var data = d3.csv.parse(colNames);

        var rscale = d3.scale.linear()
                .domain([7,22])
                .range([5,25])

        data.forEach(function(d) {
                d.size = +d.size;
                d.size = rscale(d.size);
              });

        //unique cluster/group id's
        var cs = [];
        data.forEach(function(d){
                if(!cs.contains(d.group)) {
                    cs.push(d.group);
                }
        });

        var n = data.length, // total number of nodes
            m = cs.length; // number of distinct clusters

        //create clusters and nodes
        var clusters = new Array(m);
        var nodes = [];
        for (var i = 0; i<n; i++){
            nodes.push(create_nodes(data,i));
        }

        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(.02)
            .charge(0)
            .on("tick", tick)
            .start();

        var svg = d3.select("#narrow").append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("margin-left", "-100px")
            //.style("z-index","1")
            .style("overflow","visible");

        var node = svg.selectAll("circle")
            .data(nodes)
            .enter().append("g").call(force.drag)

        node.append("circle")
            .style("fill", function (d) {
            return color(d.cluster);
            })
            .attr("id", function(d){return d.text})
            .attr("r", function(d){return d.radius})
            .style("opacity","0.5")
            //.attr("opacity","0.5")
            .on("mousemove",function(d){
                console.log(d)
                tooltip.html("<b>"+ d.text + "</b><br>" + "Favourite Cereal: " + d.cereal + "<br> Poverty Rate: " + d.poverty).style("visibility", "visible").style("top", (d3.event.pageY + 15)+"px").style("left",(d3.event.pageX+15)+"px");
                d3.select(this)
                    .style("opacity","1");
            })
            .on("mouseout",function(d){
                d3.select(this)
                    .style("opacity","0.5")
                tooltip.style("visibility","hidden")

            });

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.text.substring(0, d.radius / 3); })
            .style("visibility", "hidden");

        function create_nodes(data,node_counter) {
            var i = cs.indexOf(data[node_counter].group),
                r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
                d = {
                    cluster: i,
                    radius: data[node_counter].size*1.5,
                    text: data[node_counter].text,
                    cereal: data[node_counter].group,
                    poverty: data[node_counter].size,
                    x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
                    y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
                };
            if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
            return d;
        };

        function tick(e) {
            node.each(cluster(10 * e.alpha * e.alpha))
                .each(collide(.5))
                .attr("transform", function (d) {
                    var k = "translate(" + d.x + "," + d.y + ")";
                    return k;
                })
        }

        // Move d to be adjacent to the cluster node.
        function cluster(alpha) {
            return function (d) {
                var cluster = clusters[d.cluster];
                if (cluster === d) return;
                var x = d.x - cluster.x,
                    y = d.y - cluster.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + cluster.radius;
                if (l != r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    cluster.x += x;
                    cluster.y += y;
                }
            };
        }

        // Resolves collisions between d and all other circles.
        function collide(alpha) {
            var quadtree = d3.geom.quadtree(nodes);
            return function (d) {
                var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function (quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        var x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                        if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            };
        }

        var legendTexts = ["Fiber One", "Ancient Grains Cheerios", "Cinnamon Toast Crunch", "Rice Krispies", "Other", "Special K"];
                            // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
        var legend = d3.select("#narrow").append("svg")
            .attr("class", "legend")
            .attr("width", 200)
            .attr("height", 200)
            .style("margin-left", "400px")
            .selectAll("g")
            .data(color.domain().slice().reverse())
            .enter()
            .append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .data(legendTexts)
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d) { return d; });

    });

        Array.prototype.contains = function(v) {
            for(var i = 0; i < this.length; i++) {
                if(this[i] === v) return true;
            }
            return false;
        };

}bubble();
