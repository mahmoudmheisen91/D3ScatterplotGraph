let data_url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

let data_set = [];
fetch(data_url)
  .then(response => response.json())
  .then(data => {
    data.map((item, index) => {
      let time = item.Time.split(":");
      item.Time = new Date(1970, 0, 1, 0, time[0], time[1]);
      data_set[index] = {
        Year: +item.Year,
        Time: new Date(1970, 0, 1, 0, time[0], time[1]),
        Doping: item.Doping
      };
    });
    console.log(data_set.length);
  })
  .catch(err => console.log(err));

const width = 1000;
const height = 600;
const margin = 50;

console.log(data_set.length);

let svg = d3
  .select("#graphHolder")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

let xScale = d3
  .scaleLinear()
  .domain([
    d3.min(data_set, d => d.Year - 4),
    d3.max(data_set, d => d.Year + 4)
  ])
  .range([margin, width + margin]);

let yScale = d3
  .scaleLinear()
  .domain([d3.min(data_set, d => d.Time), d3.max(data_set, d => d.Time)])
  .range([height - margin, margin]);

// Main PLot:
svg
  .selectAll("circle")
  .data(data_set)
  .enter()
  .append("circle")
  .attr("class", "dot")
  .attr("r", 5)
  .attr("cx", d => xScale(d.Year))
  .attr("cy", d => yScale(d.Time))
  .style("fill", d => (d.Doping ? "red" : "green"));

// X Axis:
let yearFormat = d3.format("d");
let xAxis = d3.axisBottom(xScale).tickFormat(yearFormat);
svg
  .append("g")
  .attr("id", "x-axis")
  .attr("transform", "translate(0," + (height - margin) + ")")
  .call(xAxis);

// Y Axis:
let timeFormat = d3.timeFormat("%M:%S");
let yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);
svg
  .append("g")
  .attr("id", "y-axis")
  .attr("transform", "translate(" + margin + ", 0)")
  .call(yAxis);
