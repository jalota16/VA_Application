var datasets= ["Friday", "Saturday", "Sunday"];
var datasets1= ["Alphabetical", "Ride Category"];
var defaultChecked = 0;
var defaultChecked1 = 0;

heatmapChart(datasets[defaultChecked],datasets1[defaultChecked1]);

var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button").data(datasets);

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
    heatmapChart(d,datasets1[defaultChecked1]);
  });

var datasetpicker1 = d3.select("#dataset-picker1").selectAll(".dataset-button").data(datasets1);

datasetpicker1.enter()
  .append("label")
  .text(function(d) {return d;})
  .insert("input")
  .attr({
      type: "radio",
      class: "radiobutton",
      name: "mode1",
      value: function(d, i) {return i;}
  })
  .property("checked", function(d, i) {return i===defaultChecked1;})
  .on("click", function(d,i) {
    defaultChecked1 = i;
    heatmapChart(datasets[defaultChecked],d);
  });

function heatmapChart(day,sortOrder) {
  $('#chart').text("");
  var margin = { top: 25, right: 0, bottom: 100, left: 150 },
  height = 750 - margin.left - margin.right,
  width = 1060 - margin.top - margin.bottom - 5,
  gridSize = Math.floor(width / 55),
  legendElementWidth = gridSize*3,
  buckets = 9,
  //colors = ['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#990000'], // alternatively colorbrewer.YlGnBu[9]
  //colors = ['#f7fbff', '#deebf7', '#c6dbef',"#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
  colors = ["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],
  days = ["Atmosfear","Auvilotops Express","Beelzebufo","Blue Iguanodon","Creighton Pavilion","Cyndisaurus Asteroid",
  "Daily Slab Maps and Info","Dykesadactyl Thrill","Eberlasaurus Roundup","Enchanted Toadstools","Firefall","Flight of the Swingodon",
  "Flying TyrAndrienkos","Galactousaurus Rage","Grinosaurus Stage","Ichyoroberts Rapids","Jeradctyl Jump","Jurassic Road",
  "Kauf's Lost Canyon Escape","Keimosaurus Big Spin","Kristandon Kaper","Maiasaur Madness","Paleocarrie Carousel","Raptor Race",
  "Rhynasaurus Rampage","SabreTooth Theatre","Sauroma Bumpers","Scholz Express","Squidosaur","Stegocycles","Stone Cups","TerroSaur",
  "Wendisaurus Chase","Wild Jungle Cruise","Wrightiraptor Mountain"],
  times = ["8am", "9am", "10am", "11am", "12am", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"];
  timingArray = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

  if(sortOrder == "Ride Category"){
    days = ["Daily Slab Maps and Info","Stone Cups","Wild Jungle Cruise","Blue Iguanodon","Stegocycles","Enchanted Toadstools",
    "Beelzebufo","Cyndisaurus Asteroid","Flying TyrAndrienkos","Sauroma Bumpers","Jeradctyl Jump","Kristandon Kaper","Maiasaur Madness",
    "Kauf's Lost Canyon Escape","Rhynasaurus Rampage","Jurassic Road","Paleocarrie Carousel","Scholz Express","Eberlasaurus Roundup",
    "Raptor Race","Ichyoroberts Rapids","Dykesadactyl Thrill","Squidosaur","SabreTooth Theatre","Grinosaurus Stage","Creighton Pavilion",
    "Wrightiraptor Mountain","Atmosfear","Firefall","Keimosaurus Big Spin","Wendisaurus Chase","TerroSaur","Auvilotops Express",
    "Galactousaurus Rage","Flight of the Swingodon"];
  }

  var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right + 150)
    .attr("height", height + margin.top + margin.bottom - 140)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var dayLabels = svg.selectAll(".dayLabel")
    .data(days)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", 0)
    .attr("y", function (d, i) { return i * gridSize; })
    .style("text-anchor", "start")
    .attr("transform", "translate(" + -gridSize * 9 + "," + gridSize / 1.5 + ")")
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
    .on("click", function(d){
      chordDiagram(day,timingArray[times.indexOf(d)],d);
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
         .style("top", (d3.event.pageY-70) + "px")
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
      .attr("x", function(d, i) { return legendElementWidth/1.25 * i + 775; })
      .attr("y", height - gridSize*4.5)
      .attr("width", legendElementWidth/1.25)
      .attr("height", gridSize / 1.5 )
      .style("fill", function(d, i) { return colors[i]; })
      .style("stroke", "#5c5c3d")
      .style("stroke-width", "0.5");

    legend.append("text")
      .attr("class", "mono")
      .style("fill", "#000")
      .text(function(d) { return "≥ " + Math.round(d); })
      .attr("x", function(d, i) { return legendElementWidth/1.25 * i + 775; })
      .attr("y", height - gridSize * 3);

    legend.exit().remove();
  }); 
}

var lineBarChart = function(position,day,name,time) {
  //$("#pleaseWaitDialog").modal('show');
  var nextPosition = "", buttonText = "", chosenCategory = "";
  if(time == 8) {
    position = "after";
  }
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
  //$("#pleaseWaitDialog").modal('hide');
    $("#myModal").modal({backdrop: "static"});
    if(time != 8 && time != 23) {
      $("#specialButton").text(buttonText).attr("class","btn btn-info active").click(function(){
        lineBarChart(nextPosition,day,name,time);
        event.stopPropagation();
      });
    } else {
      $("#specialButton").text(buttonText).attr("class","btn btn-info disabled").click(function(){
        event.stopPropagation();
      });
    }
  });
}

function chordDiagram(day,time,dayValue) {
  $('#chart2').text("");
  var matrix = [];
  var url = "controllers/hourlymovement.php?time=" + time + "&day=" + day;
  d3.json(url, function(result) {
    matrix = result;
    for (i = 0; i < 35; i++) { 
      if(matrix[i] == undefined){
        matrix[i] = [];
      }
      for (j = 0; j < 35; j++) { 
        if(matrix[i][j] == undefined){
          matrix[i][j] = 0;
        }
      }
    } 
    var chord = d3.layout.chord()
    .padding(.05)
    .sortSubgroups(d3.descending)
    .matrix(matrix);
    var width = 960,
        height = 700,
        innerRadius = Math.min(width, height) * .41,
        outerRadius = innerRadius * 1.1;

    var fill = d3.scale.ordinal()
        .domain(d3.range(35))
        .range(["#eda7c1","#4d99d2","#900080","#ff0000",
          "#666666","#000000","#ababab","#d6d6d6","#eeeeee","#0000cd","#ff00ff","#00ff00","#00bfff",
          "#7fff00","#00ffff","#89b524","#fbe2e5","#ffd9de","#eda7c1","#abd6a8","#bbdaf6","#857868","#ef9f26",
          "#411c01","#6a6a68","#56167d","#f7c003","#509d2b","#ac0123","#0b216d","#0091a0","#dd3f4e","#dd6ba7",
          "#97d0a7","#5c5b9d"]);

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
        .on("mouseover", fade(.1,svg))
        .on("mouseout", fade(1,svg));

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

    svg.selectAll("g.group")
    .data(chord.groups)
    .enter().append("svg:g")
    .attr("class", "group").append("svg:text")
    .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
    .attr("transform", function(d) {
      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + (innerRadius + 26) + ")"
          + (d.angle > Math.PI ? "rotate(180)" : "");
    })
    .text(function(d) { return ""; });

    $("#myModal1").modal({backdrop: "static"});
    $("#content").text("Movement of Visitors at " + dayValue);
  });
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
function fade(opacity,svg) {
  return function(g, i) {
    svg.selectAll(".chord path")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
      .transition()
        .style("opacity", opacity);
  };
}


