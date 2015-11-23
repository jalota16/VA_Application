var whichDay;
var url;
var radios = document.getElementsByName('day');

	for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
        whichDay = radios[i].value;
        break;
    }
  }
      var margin = { top: 50, right: 0, bottom: 100, left: 200 },
          width = 1000 - margin.left - margin.right,
          height = 1130 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 30),
          legendElementWidth = gridSize*2,
          //ask prof!!!!!!!!!!!!
          buckets = 9,
          colors = ['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#990000'], // alternatively colorbrewer.YlGnBu[9]
          days = ['Wrightiraptor Mountain','Galactousaurus Rage','Auvilotops Express','TerroSaur','Wendisaurus Chase',
            'Keimosaurus Big Spin','Firefall','Atmosfear','Jeradctyl Jump','Sauroma Bumpers','Flying TyrAndrienkos',
            'Cyndisaurus Asteroid','Beelzebufo','Enchanted Toadstools','Stegocycles','Blue Iguanodon','Wild Jungle Cruise','Stone Cups',
            'Scholz Express','Paleocarrie Carousel','Jurassic Road','Rhynasaurus Rampage','Kauf\'s Lost Canyon Escape','Maiasaur Madness',
            'Kristandon Kaper','Squidosaur','Eberlasaurus Roundup','Dykesadactyl Thrill','Ichyoroberts Rapids','Raptor Race',
            'Creighton Pavilion',
            'Grinosaurus Stage','SabreTooth Theatre','Flight of the Swingodon',"Daily Slab Maps and Info"],
          times = ["8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"];
          timingArray = ['800','900','1000','1100','1200','1300','1400','1500','1600','1700','1800','1900','2000','2100',
              '2200','2300'];
          datasets = ["fri", "sat", "sun"];

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
            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

      var timeLabels = svg.selectAll(".timeLabel")
          .data(times)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

      var heatmapChart = function(day) {
        var url = "data.php?day=" + day;
        d3.json(url,
        function(error, data) {
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
              .attr("x", function(d) { return (d.timing) * gridSize; })
              .attr("y", function(d) { return (d.name) * gridSize; })
              .attr("class", "hour bordered")
              .attr("width", gridSize)
              .attr("height", gridSize)
              .style("fill", colors[0])
              .on("mouseover", function(d){
                 //highlight text
                 d3.select(this).classed("cell-hover",true);
                 d3.selectAll(".day").classed("text-highlight",function(r,ri){ return ri==(d.name);});
                 d3.selectAll(".hour").classed("text-highlight",function(c,ci){ return ci==(d.timing);});
        
                 //Update the tooltip position and value
                 d3.select("#tooltip")
                   .style("left", (d3.event.pageX+10) + "px")
                   .style("top", (d3.event.pageY-10) + "px")
                   .select("#value")
                   .text("lables:"+days[d.name]+","+timingArray[d.timing]+"\ndata:"+d.value);  
                 //Show the tooltip
                 d3.select("#tooltip").classed("hidden", false);
              })
              .on("mouseout", function(){
                     d3.select(this).classed("cell-hover",false);
                     d3.selectAll(".rowLabel").classed("text-highlight",false);
                     d3.selectAll(".colLabel").classed("text-highlight",false);
                     d3.select("#tooltip").classed("hidden", true);
              });

          cards.transition().duration(1000)
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
            .attr("height", gridSize / 2)
            .style("fill", function(d, i) { return colors[i]; });

          legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return "≥ " + Math.round(d); })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height + gridSize);

          legend.exit().remove();

        });  
      };

      heatmapChart(datasets[0]);
      
      var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
        .data(datasets);

      /*datasetpicker.enter()
        .append("input")
        .attr("value", function(d){ return "Dataset " + d })
        .attr("type", "radio")
        .attr("class", "dataset-button")
        .on("click", function(d) {
          heatmapChart(d);
        });*/

      datasetpicker.enter()
        .append("label")
        .text(function(d) {return d;})
        .insert("input")
        .attr({
            type: "radio",
            class: "noClass",
            name: "mode",
            value: function(d, i) {return i;}
        })
        .property("checked", function(d, i) {return i===d;})
        .on("click", function(d) {
          heatmapChart(d);
        });