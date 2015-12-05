var datasets= ["Friday", "Saturday", "Sunday"];
heatmapChart(datasets[0]);

var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
  .data(datasets);
var defaultChecked = 0;

datasetpicker.enter()
  .append("label")
  .text(function(d) {return d;})
  .insert("input")
  .attr({
      type: "radio",
      class: "radiobutton",
      name: "mode",
      value: function(d, i) {return i;}
  })
  .property("checked", function(d, i) {return i===defaultChecked;})
  .on("click", function(d,i) {
    defaultChecked = i;
    heatmapChart(d);
  });

function heatmapChart(day) {
  $('#chart').text("");
  var margin = { top: 35, right: 0, bottom: 100, left: 180 },
  height = 750 - margin.left - margin.right,
  width = 1055 - margin.top - margin.bottom,
  gridSize = Math.floor(width / 55),
  legendElementWidth = gridSize*3,
  buckets = 9,
  colors = ['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#990000'], // alternatively colorbrewer.YlGnBu[9]
  days = ['Wrightiraptor Mountain','Galactousaurus Rage','Auvilotops Express','TerroSaur','Wendisaurus Chase',
    'Keimosaurus Big Spin','Firefall','Atmosfear','Jeradctyl Jump','Sauroma Bumpers','Flying TyrAndrienkos',
    'Cyndisaurus Asteroid','Beelzebufo','Enchanted Toadstools','Stegocycles','Blue Iguanodon','Wild Jungle Cruise','Stone Cups',
    'Scholz Express','Paleocarrie Carousel','Jurassic Road','Rhynasaurus Rampage','Kauf\'s Lost Canyon Escape','Maiasaur Madness',
    'Kristandon Kaper','Squidosaur','Eberlasaurus Roundup','Dykesadactyl Thrill','Ichyoroberts Rapids','Raptor Race',
    'Creighton Pavilion',
    'Grinosaurus Stage','SabreTooth Theatre','Flight of the Swingodon',"Daily Slab Maps and Info"],
  times = ["8am", "9am", "10am", "11am", "12am", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"];
  timingArray = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

  var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var dayLabels = svg.selectAll(".dayLabel")
    .data(days)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", 0)
    .attr("y", function (d, i) { return i * gridSize; })
    .style("text-anchor", "end")
    .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
    .attr("class", function (d, i) { return ((i % 2 == 1) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

  var timeLabels = svg.selectAll(".timeLabel")
    .data(times)
    .enter().append("text")
    .text(function(d) { return d; })
    .attr("x", function(d, i) { return i * gridSize * 3; })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + gridSize/0.7  + ", -6)")
    .attr("class", "label-text")
    .on("mouseover", function(d){
      d3.select(this).classed("text-highlight",true);
    })
    .on("mouseout", function(){
       d3.select(this).classed("text-highlight",false);
    })
    .on("click", function(){
      chordDiagram();
    });

  var url = "controllers/data.php?day=" + day;
  d3.json(url,function(error, data) {
    var colorScale = d3.scale.quantile()
      .domain([0, buckets - 1, d3.max(data, function (d) {return +d.value; })])
      .range(colors);

    var cards = svg.selectAll(".hour")
      .data(data, function(d) {
      d.name = days.indexOf(d.name);
      d.timing = timingArray.indexOf(d.timing);
      return d.name+':'+d.timing;
    });

    cards.append("title");

    cards.enter().append("rect")
      .attr("x", function(d) { return (d.timing) * gridSize * 3; })
      .attr("y", function(d) { return (d.name) * gridSize; })
      .attr("class", "hour bordered")
      .attr("width", gridSize * 3)
      .attr("height", gridSize)
      .style("fill", colors[0])
      .on("mouseover", function(d){
       //highlight text
       d3.select(this).classed("cell-hover",true);
       d3.selectAll(".dayLabel").classed("text-highlight",function(r,ri){ return ri==(d.name);});
       d3.selectAll(".timeLabel").classed("text-highlight",function(c,ci){ return ci==(d.timing);});

         //Update the tooltip position and value
       d3.select("#tooltip")
         .style("left", (d3.event.pageX+10) + "px")
         .style("top", (d3.event.pageY-10) + "px")
         .select("#value")
         .html("Place: "+days[d.name]+"<br> Check-in Time: "+times[d.timing]+"<br> No. of Visitors: <b>"+d.value+"</b>");  
       //Show the tooltip
       d3.select("#tooltip").classed("hidden", false);
      })
      .on("mouseout", function(){
             d3.select(this).classed("cell-hover",false);
             d3.selectAll(".dayLabel").classed("text-highlight",false);
             d3.selectAll(".timeLabel").classed("text-highlight",false);
             d3.select("#tooltip").classed("hidden", true);
      })
      .on("click", function(d){
        lineBarChart("before",day,days[d.name],timingArray[d.timing]);
    });

    cards.transition().duration(500)
        .style("fill", function(d) { return colorScale(d.value); });

    cards.select("title").text(function(d) { return d.value; });
    
    cards.exit().remove();

    var legend = svg.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; });

    legend.enter().append("g")
        .attr("class", "legend");

    legend.append("rect")
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height)
      .attr("width", legendElementWidth)
      .attr("height", gridSize / 1.5 )
      .style("fill", function(d, i) { return colors[i]; })
      .style("stroke", "#5c5c3d")
      .style("stroke-width", "0.5");

    legend.append("text")
      .attr("class", "mono")
      .style("fill", "#000")
      .text(function(d) { return "≥ " + Math.round(d); })
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height + gridSize * 1.5);

    legend.exit().remove();
  }); 
}

var lineBarChart = function(position,day,name,time) {
  //$("#pleaseWaitDialog").modal('show');
  var nextPosition = "", buttonText = "", chosenCategory = "";
  if(position == "before"){
    nextPosition = "after";
    buttonText = "View Places Visited after Current Location";
  } else {
    nextPosition = "before";
    buttonText = "View Places Visited prior to Current Location";
  }
  $('#chart1').text("");
  $('#specialButton').text("");
  $('#title').text("");
  var url = "controllers/dataTopNextPlaces.php?day=" + day + "&place=" + name + "&time=" + time + "&position=" + position;
  var margin = {top: 80, right: 80, bottom: 80, left: 80},
      width = 1000 - margin.left - margin.right,
      height = 415 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var y0 = d3.scale.linear().domain([300, 1100]).range([height, 0]),
      y1 = d3.scale.linear().domain([0, 10]).range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
  // create left yAxis
  var yAxisLeft = d3.svg.axis().scale(y0).ticks(6).orient("left");
  // create right yAxis
  var yAxisRight = d3.svg.axis().scale(y1).ticks(6).orient("right");

  var svg = d3.select("#chart1").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("class", "graph")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json(url,function(error, data) {
    chosenCategory = data[0][0];
    data.shift();
    x.domain(data.map(function(d) { return d.name; }));
    y0.domain([0, d3.max(data, function(d) { return +d.number; })]);
    y1.domain([0, d3.max(data, function(d) { return +d.distance; })]);
    
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate("+ -x.rangeBand()/4 +"," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis axisLeft")
      .attr("transform", "translate(0,0)")
      .call(yAxisLeft)
      .append("text")
      .attr("y", 6)
      .attr("dy", "-2em")
      //.attr("dx", "1em")
      .style("text-anchor", "middle")
      .text("Number of Visitors");
    
    svg.append("g")
      .attr("class", "y axis axisRight")
      .attr("transform", "translate(" + (width) + ",0)")
      .call(yAxisRight)
      .append("text")
      .attr("y", 6)
      .attr("dy", "-2em")
      //.attr("dx", "1em")
      .style("text-anchor", "middle")
      .text("Estimated Proximity");

    bars = svg.selectAll(".bar").data(data).enter();

    bars.append("rect")
        .attr("class", "bar1")
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.rangeBand()/2)
        .attr("y", function(d) { return y0(+d.number); })
        .attr("height", function(d,i,j) { return height - y0(+d.number); }); 

    var lineFunc = d3.svg.line()
      .x(function(d) {
        return x(d.name) + x.rangeBand()/4;
      })
      .y(function(d) {
        return y1(d.distance);
      });

    svg.append("path")
      .attr("d", lineFunc(data))
      .attr("class", "line2");

    var tracciato = svg.selectAll(".line-group")
                    .data(data)
                    .enter().append("g")
                    .attr("class", "line-group");

    var point = tracciato.append("g").attr("class", "line-point");

    point.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", function(d, i) {return x(d.name) + x.rangeBand() / 4;})
    .attr("cy", function(d, i) { return y1(d.distance) })
    .attr("r", 4)
    .style("fill", "orange")
    .append("text")

  svg.selectAll(".text").data(data).enter()
    .append("text")
    .attr("class", "bartext")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .style("fontsize","9px")
    .attr("x", function(d) {
        return x(d.name);
    })
    .attr("y", function(d) {
        return y0(+d.number);
    })
    .attr("dy", function(d) {
      return (height - y0(+d.number))/2;
    })
    .attr("dx", x.rangeBand()/4)
    .text(function(d){return d.number;});

  var val = tracciato.append('g').attr('class','line-label');
  val.selectAll(".text")
    .data(data)
    .enter().append("text")
    .attr("x", function(d) {
        return x(d.name) + x.rangeBand() / 3;})
    .attr("y", function(d) { return y1(d.distance) })
    .attr('dy', 5)
    .attr("text-anchor", "start")
    .text(function(d) { 
      return d.distance; 
    })
    .style("fill", "orange");

    $("#title").html("Current Location: " + name + "<i class=\"title-text\">" + chosenCategory + "</i>");
  });
  //$("#pleaseWaitDialog").modal('hide');
  $("#myModal").modal({backdrop: "static"});
  $("#specialButton").text(buttonText).click(function(){
    lineBarChart(nextPosition,day,name,time);
    event.stopPropagation();
  });
}

function chordDiagram() {
  $('#chart2').text("");
  var matrix = [
    [11975,  5871, 8916, 2868],
    [ 1951, 10048, 2060, 6171],
    [ 8010, 16145, 8090, 8045],
    [ 1013,   990,  940, 6907]
  ];

  var chord = d3.layout.chord()
      .padding(.05)
      .sortSubgroups(d3.descending)
      .matrix(matrix);

  var width = 960,
      height = 450,
      innerRadius = Math.min(width, height) * .41,
      outerRadius = innerRadius * 1.1;

  var fill = d3.scale.ordinal()
      .domain(d3.range(4))
      .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

  var svg = d3.select("#chart2").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  svg.append("g").selectAll("path")
      .data(chord.groups)
    .enter().append("path")
      .style("fill", function(d) { return fill(d.index); })
      .style("stroke", function(d) { return fill(d.index); })
      .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
      .on("mouseover", fade(.1))
      .on("mouseout", fade(1));

  var ticks = svg.append("g").selectAll("g")
      .data(chord.groups)
    .enter().append("g").selectAll("g")
      .data(groupTicks)
    .enter().append("g")
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + outerRadius + ",0)";
      });

  ticks.append("line")
      .attr("x1", 1)
      .attr("y1", 0)
      .attr("x2", 5)
      .attr("y2", 0)
      .style("stroke", "#000");

  ticks.append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
      .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .text(function(d) { return d.label; });

  svg.append("g")
      .attr("class", "chord")
    .selectAll("path")
      .data(chord.chords)
    .enter().append("path")
      .attr("d", d3.svg.chord().radius(innerRadius))
      .style("fill", function(d) { return fill(d.target.index); })
      .style("opacity", 1);

  $("#myModal1").modal({backdrop: "static"});
}

// Returns an array of tick angles and labels, given a group.
function groupTicks(d) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, 1000).map(function(v, i) {
    return {
      angle: v * k + d.startAngle,
      label: i % 5 ? null : v / 1000 + "k"
    };
  });
}

// Returns an event handler for fading a given chord group.
function fade(opacity) {
  return function(g, i) {
    svg.selectAll(".chord path")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
      .transition()
        .style("opacity", opacity);
  };
}


