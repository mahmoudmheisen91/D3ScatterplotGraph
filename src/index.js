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
 * Parse data into array of objects
 * @param {object} data Object containing doping data of bicylce racing
 * data: {Year: Number, Time: Date, Doping: Boolean}
 */
let parseData = data => {
  let data_set = [];
  data.map((item, index) => {
    let time = item.Time.split(":");
    data_set[index] = {
      Year: +item.Year,
      Time: new Date(1970, 0, 1, 0, time[0], time[1]),
      Doping: !!item.Doping
    };
  });
  return data_set;
};

function make_x_axis() {
  return d3.svg
    .axis()
    .scale(x)
    .orient("bottom")
    .ticks(5);
}

function make_y_axis() {
  return d3.svg
    .axis()
    .scale(y)
    .orient("left")
    .ticks(5);
}

/**
 * Creates a scatterplot graph using D3.js
 * @param {object} data Object containing doping data of bicylce racing
 * data: {Year: Number, Time: Date, Doping: Boolean}
 */
let drawScatterPlot = data => {
  const width = 1200;
  const height = 600;
  const margin = {
    vertical: 75,
    horizantal: 150
  };

  // Scaleing:
  let xScale = d3
    .scaleLinear()
    .domain([d3.min(data, d => d.Year - 2), d3.max(data, d => d.Year + 1)])
    .range([margin.horizantal, width - margin.horizantal]);

  let yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, d => new Date(d.Time.getTime() - 0.5 * 60000)),
      d3.max(data, d => new Date(d.Time.getTime() + 0.5 * 60000))
    ])
    .range([height - margin.vertical, margin.vertical]);

  // Axes:
  let xAxis = g =>
    g
      .attr("transform", `translate(0,${height - margin.vertical})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

  let yAxis = g =>
    g
      .attr("transform", `translate(${margin.horizantal},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S")));

  // SVG:
  let svg = d3
    .select(".vis-container")
    .append("svg")
    .attr("class", "svg-graph")
    .attr("width", width)
    .attr("height", height);

  // Apend Axes:
  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);

  // GridLines:
  let xGridLine = svg
    .selectAll("line.Grid")
    .data(xScale.ticks(10))
    .enter()
    .append("line")
    .attr("class", "grid")
    .attr("x1", d => xScale(d))
    .attr("x2", d => xScale(d))
    .attr("y1", margin.vertical)
    .attr("y2", height - margin.vertical)
    .attr("fill", "none");

  let yGridLine = svg
    .selectAll("line.Grid")
    .data(yScale.ticks(10))
    .enter()
    .append("line")
    .attr("class", "grid")
    .attr("x1", margin.horizantal)
    .attr("x2", width - margin.horizantal)
    .attr("y1", d => yScale(d))
    .attr("y2", d => yScale(d))
    .attr("fill", "none");

  // Main PLot:
  let scatterPlot = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 6)
    .attr("cx", d => xScale(d.Year))
    .attr("cy", d => yScale(d.Time))
    .attr("fill", d => (d.Doping ? "red" : "green"))
    .attr("stroke", "black")
    .attr("stroke-width", 2);

  // Labels
  let xLabel = svg
    .append("text")
    .attr("class", "xlabel")
    .attr("x", 1000)
    .attr("y", 570)
    .text("Year");

  let yLabel = svg
    .append("text")
    .attr("class", "ylabel")
    .attr("transform", "rotate(-90)")
    .attr("x", -250)
    .attr("y", 100)
    .text("Time (Minutes)");
};
