// API URL to fetch doping data in bicycle racing:
let api_url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

/*
 * Loading data from API when DOM Content has been loaded:
 */
document.addEventListener("DOMContentLoaded", () => {
  fetch(api_url)
    .then(response => response.json())
    .then(data => {
      let data_set = parseData(data);
      drawScatterPlot(data_set);
    })
    .catch(err => console.error(err));
});

/**
 * Parse data function
 * @param {object} data Object containing doping data of bicylce racing
 */
let parseData = data => {
  data.map(item => {
    let time = item.Time.split(":");
    item.Time = new Date(1970, 0, 1, 0, time[0], time[1]);
    item.Year = +item.Year;
    item.Place = +item.Place;
    item.Seconds = +item.Seconds;
  });
  return data;
};

/**
 * Creates a scatterplot graph using D3.js
 * @param {object} data Object containing doping data of bicylce racing
 * data: {Year: Number, Time: Date, Doping: Boolean}
 */
let drawScatterPlot = data => {
  // Globals:
  const width = 1200;
  const height = 500;
  const margin = {
    top: 75,
    right: 0,
    bottom: 0,
    left: 175
  };
  let color = d3.scaleOrdinal(d3.schemeSet1);
  let timeFormat = d3.timeFormat("%M:%S");

  // Scaleing:
  let xScale = d3
    .scaleLinear()
    .domain([d3.min(data, d => d.Year - 0), d3.max(data, d => d.Year + 0)])
    .range([margin.right + margin.left, width - margin.right - margin.left]);

  let yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, d => new Date(d.Time.getTime() - 0.0 * 60000)),
      d3.max(data, d => new Date(d.Time.getTime() + 0.0 * 60000))
    ])
    .range([height - margin.top - margin.bottom, margin.top + margin.bottom]);

  // Axes:
  let xAxis = g =>
    g
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .call(g =>
        g
          .append("text")
          .attr("class", "x-label")
          .attr("x", width - (margin.right + margin.left))
          .attr("y", (margin.top + margin.bottom) * 0.5)
          .text("Year")
      );

  let yAxis = g =>
    g
      .attr("id", "y-axis")
      .attr("transform", `translate(${margin.right + margin.left}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S")))
      .call(g => g.select(".domain").remove())
      .call(g =>
        g
          .append("text")
          .attr("class", "y-label")
          .attr("transform", "rotate(-90)")
          .attr("x", -(margin.right + margin.left) * 0.5)
          .attr("y", -(margin.top + margin.bottom) * 0.75)
          .text("Time (Minutes)")
      );

  // Gridlines:
  let grid = g =>
    g
      .call(g =>
        g
          .append("g")
          .selectAll("line")
          .data(xScale.ticks(20))
          .enter()
          .append("line")
          .attr("class", "grid-line")
          .attr("x1", d => xScale(d))
          .attr("x2", d => xScale(d))
          .attr("y1", margin.top + margin.bottom)
          .attr("y2", height - (margin.top + margin.bottom))
      )
      .call(g =>
        g
          .append("g")
          .selectAll("line")
          .data(yScale.ticks(20))
          .enter()
          .append("line")
          .attr("class", "grid-line")
          .attr("x1", margin.right + margin.left)
          .attr("x2", width - (margin.right + margin.left))
          .attr("y1", d => yScale(d))
          .attr("y2", d => yScale(d))
      );

  // ToolTip:
  let toolTip = d3
    .select("main")
    .append("div")
    .attr("id", "tooltip");

  // Main PLot:
  let scatterPlot = g =>
    g
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("data-xvalue", d => d.Year)
      .attr("data-yvalue", d => d.Time)
      .attr("r", 6)
      .attr("cx", d => xScale(d.Year))
      .attr("cy", d => yScale(d.Time))
      .attr("fill", d => color(!!d.Doping))
      .on("mouseover", d => {
        toolTip.style("display", "block");
        toolTip.attr("data-year", d.Year);
        toolTip
          .html(
            d.Name +
              ", " +
              d.Nationality +
              ", " +
              d.Place +
              "<br/>" +
              "Year: " +
              d.Year +
              ", Time: " +
              timeFormat(d.Time) +
              "<br/>" +
              "Doping: " +
              (d.Doping ? '"' + d.Doping + '"' : '"' + '"') +
              "<br/>" +
              "Seconds: " +
              d.Seconds
          )
          .style("left", d3.event.pageX + 20 + "px")
          .style("top", d3.event.pageY - 20 + "px");
      })
      .on("mouseout", d => {
        toolTip.style("display", "none");
      });

  // Title:
  let title = g =>
    g.call(g =>
      g
        .append("text")
        .attr("id", "title")
        .attr("x", width / 2)
        .attr("y", (margin.top + margin.bottom) / 2)
        .text("Doping in Bicycle Racing")
    );

  // Legend:
  let legend = g =>
    g
      .selectAll(".legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("id", "legend")
      .attr("transform", (d, i) => "translate(0," + (height / 2 - i * 20) + ")")
      .call(g =>
        g
          .append("rect")
          .attr("class", "legend-shape")
          .attr("x", width - (margin.right + margin.left) + 10)
          .attr("width", 120)
          .attr("height", 20)
          .attr("fill", color)
          .attr("stroke", "white")
      )
      .call(g =>
        g
          .append("text")
          .attr("class", "legend-text")
          .attr("x", width - (margin.right + margin.left) * 0.3)
          .attr("y", 10)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(d => (d ? "Doping" : "No Doping"))
      );

  // Create SVG:
  let svg = d3
    .select(".vis-container")
    .append("svg")
    .attr("class", "svg-graph")
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Append:
  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
  svg.append("g").call(grid);
  svg.append("g").call(scatterPlot);
  svg.append("g").call(title);
  svg.append("g").call(legend);
};
