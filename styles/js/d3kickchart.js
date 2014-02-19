
function dataset(){

  var n = 6, // number of layers
      m = 13; // number of samples per layer

  var margin = {top: 40, right: 10, bottom: 20, left: 10},
      width = 660 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var svg = d3.select("#chart-svg").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




  d3.csv("kick.csv", function (data){
    
    var headers = ["Under $1000","$1000-$9999","$10000-19999","$20000-99999","100K - $999999","Over $1 Million"]
  
      var layers = d3.layout.stack()(headers.map(function(priceRange) {
            return data.map(function(d) {
              return {x: d.Category, y: +d[priceRange]};
            });
      }));
      console.log(layers);

    var yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
    var yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

var xScale = d3.scale.ordinal()
    .domain(layers[0].map(function(d) { return d.x; }))
    .rangeRoundBands([0, width], .08);

var y = d3.scale.linear()
    .domain([0, yStackMax])
    .range([height, 0]);

var color = d3.scale.ordinal()
    .range(["#98ABC5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
  

var xAxis = d3.svg.axis()
    .scale(xScale)
    .tickSize(0)
    .tickPadding(6)
    .orient("bottom");


var layer = svg.selectAll(".layer")
    .data(layers)
  .enter().append("g")
    .attr("class", "layer")
    .style("fill", function(d, i) { return color(i); });

var rect = layer.selectAll("rect")
    .data(function(d) { return d; })
  .enter().append("rect")
    .attr("x", function(d) { return xScale(d.x); })
    .attr("y", height)
    .attr("width", xScale.rangeBand())
    .attr("height", 0);

rect.transition()
    .delay(function(d, i) { return i * 10; })
    .attr("y", function(d) { return y(d.y0 + d.y); })
    .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });


svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);



d3.selectAll("input").on("change", change);

var timeout = setTimeout(function() {
  d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
}, 2000);

function change() {
  clearTimeout(timeout);
  if (this.value === "grouped") transitionGrouped();
  else transitionStacked();
}

function transitionGrouped() {
  y.domain([0, yGroupMax]);

  rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("x", function(d, i, j) { return xScale(d.x) + xScale.rangeBand() / n * j; })
      .attr("width", xScale.rangeBand() / n)
    .transition()
      .attr("y", function(d) { return y(d.y); })
      .attr("height", function(d) { return height - y(d.y); });

  rect.on("mouseover", function() { tooltip.style("display", null); })
    .on("mouseout", function() { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
      var xPosition = d3.mouse(this)[0] - 15;
      var yPosition = d3.mouse(this)[1] - 25;
      tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      tooltip.select("text").text("hello world");
    });
}

function transitionStacked() {
  y.domain([0, yStackMax]);

  rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("y", function(d) { return y(d.y0 + d.y); })
      .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
    .transition()
      .attr("x", function(d) { return xScale(d.x); })
      .attr("width", xScale.rangeBand());

  rect.on("mouseover", function() { tooltip.style("display", null); })
    .on("mouseout", function() { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
      var xPosition = d3.mouse(this)[0] - 15;
      var yPosition = d3.mouse(this)[1] - 25;
      console.log(xPosition);
      tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      tooltip.select("text").text("hello world");
    });
}



    // Prep the tooltip bits, initial display is hidden
var tooltip = svg.append("g")
  .attr("class", "tooltip");
    
tooltip.append("rect")
  .attr("width", 30)
  .attr("height", 20)
  .attr("fill", "red")
  .style("opacity", 0.5);
 
tooltip.append("text")
  .attr("x", 15)
  .attr("dy", "1.2em")
  .style("text-anchor", "middle")
  .attr("font-size", "12px")
  .attr("font-weight", "bold");


  })
};

dataset();

