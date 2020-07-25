import { Component } from "@angular/core";
import * as d3 from "d3";

//declare var d3: any;
@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  gaugemap = {};
  constructor() {}
  ngOnInit() {
    this.draw();
  }

  draw() {
    var self = this;
    var gauge = function(container, configuration) {
      var config = {
        size: 710,
        clipWidth: 300,
        clipHeight: 110,
        ringInset: 20,
        ringWidth: 20,

        pointerWidth: 10,
        pointerTailLength: 5,
        pointerHeadLengthPercent: 0.9,

        minValue: 0,
        maxValue: 10,

        minAngle: -90,
        maxAngle: 90,

        transitionMs: 750,

        majorTicks: 5,
        labelFormat: d3.format("d"),
        labelInset: 10,

        gaugeValue: 0,

        pointerColor: "#000000",
        showMinValue: true,
        showMaxValue: true,
        arcColorFn: d3.interpolateHsl(d3.rgb("#0073D0"), d3.rgb("#E5E5E5"))
      };
      var range = undefined;
      var r = undefined;
      var pointerHeadLength = undefined;
      var value = 0;

      var svg = undefined;
      var arc = undefined;
      var scale = undefined;
      var ticks = undefined;
      var tickData = undefined;
      var pointer = undefined;

      var donut = d3.pie();

      function deg2rad(deg) {
        return (deg * Math.PI) / 180;
      }

      function newAngle(d) {
        var ratio = scale(d);
        var newAngle = config.minAngle + ratio * range;
        return newAngle;
      }

      function configure(configuration) {
        var prop = undefined;
        for (prop in configuration) {
          config[prop] = configuration[prop];
        }

        range = config.maxAngle - config.minAngle;
        r = config.size / 2;
        pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

        // a linear scale this.gaugemap maps domain values to a percent from 0..1
        scale = d3
          .scaleLinear()
          .range([0, 1])
          .domain([config.minValue, config.maxValue]);
        ticks = [0, config.gaugeValue, config.maxValue];
        tickData = d3.range(config.majorTicks).map(function() {
          return 1 / config.majorTicks;
        });
        // tickData = [0.6];
        console.log(tickData);
        arc = d3
          .arc()
          .innerRadius(r - config.ringWidth - config.ringInset)
          .outerRadius(r - config.ringInset)
          .startAngle(function(d, i) {
            var dAngle: any = d;
            var ratio: number = dAngle * i;
            return deg2rad(config.minAngle + ratio * range);
          })
          .endAngle(function(d, i) {
            var dAngle: any = d;
            var ratio: number = dAngle * (i + 1);
            return deg2rad(config.minAngle + ratio * range);
          });
      }
      self.gaugemap.configure = configure;

      function centerTranslation() {
        return "translate(" + r + "," + r + ")";
      }

      function isRendered() {
        return svg !== undefined;
      }
      self.gaugemap.isRendered = isRendered;

      function render() {
        var newValue = config.gaugeValue;
        svg = d3
          .select(container)
          .append("svg:svg")
          .attr("class", "gauge")
          .attr("width", config.clipWidth)
          .attr("height", config.clipHeight);

        var centerTx = centerTranslation();

        var arcs = svg
          .append("g")
          .attr("class", "arc")
          .attr("transform", centerTx);

        arcs
          .selectAll("path")
          .data(tickData)
          .enter()
          .append("path")
          .attr("fill", function(d, i) {
            return config.arcColorFn(d * i);
          })
          .attr("d", arc);

        var lg = svg
          .append("g")
          .attr("class", "label")
          .attr("transform", centerTx);
        lg.selectAll("text")
          .data(ticks)
          .enter()
          .append("text")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("font-family", "Source Sans Pro, sans-serif")
          .attr("font-size", "18px")
          .attr("font-weight", "bold")
          .attr("transform", function(d) {
            var ratio = scale(d);
            var newAngle = config.minAngle + ratio * range;
            if (d == config.minValue && config.showMinValue) {
              return (
                "translate(" +
                -(r - config.labelInset * 5) +
                ", " +
                2 * config.labelInset +
                ")"
              );
            } else if (d == config.maxValue && config.showMaxValue) {
              return (
                "translate(" +
                (r - config.labelInset * 4) +
                ", " +
                2 * config.labelInset +
                ")"
              );
            } else if (d != config.minValue && d != config.maxValue) {
              return (
                "rotate(" +
                newAngle +
                ") translate(0," +
                (config.labelInset / 2 - r) +
                ")"
              );
            } else {
              return "scale(0)";
            }
          })
          .text(config.labelFormat);

        var lineData = [
          [config.pointerWidth, -pointerHeadLength],
          [0, -pointerHeadLength],
          [-config.pointerWidth, 0],
          [0, config.pointerTailLength],
          [config.pointerWidth, 0]
        ];
        var pointerLine = d3.line();
        var pg = svg
          .append("g")
          .data([lineData])
          .attr("transform", centerTx);

        pointer = pg
          .append("path")
          .attr("d", pointerLine /*function(d) { return pointerLine(d) +'Z';}*/)
          .attr("fill", config.pointerColor)
          .attr("transform", "rotate(" + config.minAngle + ")");

        var circle = pg
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("fill", config.pointerColor)
          .attr("r", 10);

        update(newValue === undefined ? 0 : newValue);
      }
      self.gaugemap.render = render;
      function update(newValue, newConfiguration?) {
        if (newConfiguration !== undefined) {
          configure(newConfiguration);
        }
        var ratio = scale(newValue);
        var newAngle = config.minAngle + ratio * range;
        pointer
          .transition()
          .duration(config.transitionMs)
          .ease(d3.easeElastic)
          .attr("transform", "rotate(" + newAngle + ")");
      }
      self.gaugemap.update = update;

      configure(configuration);

      return self.gaugemap;
    };

    var powerGauge = gauge("#power-gauge", {
      size: 300,
      clipWidth: 300,
      clipHeight: 170,
      ringWidth: 40,
      maxValue: 300,
      transitionMs: 4000,
      pointerWidth: 5,
      pointerTailLength: 0,
      pointerHeadLengthPercent: 0.9,
      majorTicks: 4,
      gaugeValue: 200,
      pointerColor: "#C5C3C4",
      showMinValue: false,
      showMaxValue: false
    });
    powerGauge.render();
  }
}
