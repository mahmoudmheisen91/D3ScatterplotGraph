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
      Doping: item.Doping,
      Name: item.Name,
      Nationality: item.Nationality
    };
  });
  return data_set;
};

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
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .call(g =>
        g
          .append("text")
          .attr("class", "xlabel")
          .attr("x", width - margin.horizantal)
          .attr("y", margin.vertical * 0.5)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("Year")
      );

  let yAxis = g =>
    g
      .attr("transform", `translate(${margin.horizantal},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S")))
      .call(g => g.select(".domain").remove())
      .call(g =>
        g
          .append("text")
          .attr("class", "ylabel")
          .attr("transform", "rotate(-90)")
          .attr("x", -margin.horizantal * 0.5)
          .attr("y", -margin.vertical * 0.75)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("Time (Minutes)")
      );

  // Grid:
  let grid = g =>
    g
      .call(g =>
        g
          .append("g")
          .selectAll("line")
          .data(xScale.ticks())
          .enter()
          .append("line")
          .attr("class", "grid")
          .attr("x1", d => xScale(d))
          .attr("x2", d => xScale(d))
          .attr("y1", margin.vertical)
          .attr("y2", height - margin.vertical)
      )
      .call(g =>
        g
          .append("g")
          .selectAll("line")
          .data(yScale.ticks())
          .enter()
          .append("line")
          .attr("class", "grid")
          .attr("x1", margin.horizantal)
          .attr("x2", width - margin.horizantal)
          .attr("y1", d => yScale(d))
          .attr("y2", d => yScale(d))
      );

  // Create SVG:
  let svg = d3
    .select(".vis-container")
    .append("svg")
    .attr("class", "svg-graph")
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Append Axes:
  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
  svg.append("g").call(grid);

  // ToolTip:
  let toolTip = d3
    .select("main")
    .append("div")
    .attr("id", "tooltip");

  // Append Main PLot:
  let color = d3.scaleOrdinal(d3.schemeSet1);

  let scatterPlot = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 6)
    .attr("cx", d => xScale(d.Year))
    .attr("cy", d => yScale(d.Time))
    .attr("fill", d => color(!!d.Doping))
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .on("mouseover", d => {
      toolTip.style("display", "block");
      // toolTip.attr("data-year", d.Year);
      toolTip
        .html(
          d.Name +
            ": " +
            d.Nationality +
            "<br/>" +
            "Year: " +
            d.Year +
            ", Time: " +
            d3.timeFormat("%M:%S")(d.Time) +
            "<br/>" +
            "Doping: " +
            (d.Doping ? '"' + d.Doping + '"' : '"' + '"')
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", d => {
      toolTip.style("display", "none");
    });

  // Title
  let title = svg
    .append("text")
    .attr("id", "title")
    .attr("x", width / 2)
    .attr("y", margin.vertical / 2)
    .text("Doping in Bicycle Racing");

  // Legend:
  let legend = svg
    .selectAll(".legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("id", "legend")
    .attr("transform", (d, i) => "translate(0," + (height / 2 - i * 20) + ")");

  legend
    .append("rect")
    .attr("x", width - 1.25 * margin.horizantal + 10)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", color)
    .attr("stroke", "white");

  legend
    .append("text")
    .attr("x", width - 1.25 * margin.horizantal)
    .attr("y", 10)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => (d ? "Doping" : "No Doping"));
};
