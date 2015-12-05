datasets1= ["View Hourly Utilisation Rate", "View Hourly Change in Utilisation Rate"];

var datasetpicker1 = d3.select("#dataset-picker1").selectAll(".dataset-button")
  .data(datasets1);
var defaultChecked = 0;

datasetpicker1.enter()
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
    //heatmapChart(d);
  });
  
  