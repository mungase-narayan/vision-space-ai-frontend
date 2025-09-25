import React from "react";
import FallbackChart from "./fallback-chart";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";

const ENGINE = {
  PLOTLY: "plotly",
  CHARTJS: "chartjs",
  D3: "d3",
};

function ChartJsRenderer({ spec }) {
  const { type = "line", data = {}, options = {} } = spec || {};
  const [components, setComponents] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      const [chartJs, chartReact] = await Promise.all([
        import("chart.js"),
        import("react-chartjs-2"),
      ]);
      const {
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Tooltip,
        Legend,
        Chart,
      } = chartJs;
      Chart.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Tooltip,
        Legend
      );
      if (mounted) setComponents(chartReact);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (!components)
    return (
      <div className="h-10 text-xs text-muted-foreground">Loading chart...</div>
    );

  const { Line, Bar, Pie, Doughnut, Scatter } = components;

  const normalizedOptions = React.useMemo(() => {
    const next = { responsive: true, maintainAspectRatio: false, ...options };
    if (options?.scales?.yAxes || options?.scales?.xAxes) {
      const yAxes = options.scales.yAxes?.[0] || {};
      const xAxes = options.scales.xAxes?.[0] || {};
      next.scales = {
        y: {
          ticks: yAxes.ticks || {},
          grid: yAxes.gridLines,
          title: yAxes.scaleLabel,
        },
        x: {
          ticks: xAxes.ticks || {},
          grid: xAxes.gridLines,
          title: xAxes.scaleLabel,
        },
      };
    }
    if (options?.title?.text || options?.title?.display) {
      next.plugins = next.plugins || {};
      next.plugins.title = {
        display: !!options.title.display,
        text: options.title.text,
      };
    }
    return next;
  }, [options]);

  const chartProps = {
    data,
    options: normalizedOptions,
    height: spec?.height || 360,
    width: options?.width,
  };

  switch (type) {
    case "bar":
      return <Bar {...chartProps} />;
    case "pie":
      return <Pie {...chartProps} />;
    case "doughnut":
      return <Doughnut {...chartProps} />;
    case "scatter":
      return <Scatter {...chartProps} />;
    case "line":
    default:
      return <Line {...chartProps} />;
  }
}

const Plot = createPlotlyComponent(Plotly);

function PlotlyRenderer({ spec }) {
  const { data = [], layout = {}, config = {} } = spec || {};

  try {
    return (
      <Plot
        data={data}
        layout={{ autosize: true, ...layout }}
        config={{ responsive: true, displayModeBar: false, ...config }}
        style={{ width: "100%", height: layout?.height || 400 }}
        useResizeHandler
      />
    );
  } catch (err) {
    console.error("Plotly rendering failed:", err);
    return (
      <div className="space-y-2">
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <p>⚠️ Using fallback chart renderer</p>
          <p className="text-xs text-gray-600">Error: {err.message}</p>
        </div>
        <FallbackChart spec={{ data, layout, config }} />
      </div>
    );
  }
}

function D3Renderer({ spec }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let d3;
    let mounted = true;

    async function draw() {
      d3 = (await import("d3")).default ?? (await import("d3"));
      if (!mounted) return;

      while (root.firstChild) root.removeChild(root.firstChild);

      const {
        type = "bar",
        data = [],
        xKey = "x",
        yKey = "y",
        width = root.clientWidth || 600,
        height = 400,
        margin = { top: 20, right: 20, bottom: 30, left: 40 },
      } = spec || {};

      const svg = d3
        .select(root)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      if (type === "line") {
        const x = d3
          .scalePoint()
          .domain(data.map((d) => d[xKey]))
          .range([0, innerWidth]);
        const y = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d) => Number(d[yKey]) || 0)])
          .nice()
          .range([innerHeight, 0]);

        const line = d3
          .line()
          .x((d) => x(d[xKey]))
          .y((d) => y(Number(d[yKey]) || 0));

        g.append("g")
          .attr("transform", `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x));
        g.append("g").call(d3.axisLeft(y));

        g.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 2)
          .attr("d", line);
      } else {
        const x = d3
          .scaleBand()
          .domain(data.map((d) => d[xKey]))
          .range([0, innerWidth])
          .padding(0.2);
        const y = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d) => Number(d[yKey]) || 0)])
          .nice()
          .range([innerHeight, 0]);

        g.append("g")
          .attr("transform", `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x));
        g.append("g").call(d3.axisLeft(y));

        g.selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", (d) => x(d[xKey]))
          .attr("y", (d) => y(Number(d[yKey]) || 0))
          .attr("width", x.bandwidth())
          .attr("height", (d) => innerHeight - y(Number(d[yKey]) || 0))
          .attr("fill", "#3b82f6");
      }
    }

    draw();
    return () => {
      mounted = false;
      while (root.firstChild) root.removeChild(root.firstChild);
    };
  }, [spec]);

  return (
    <div ref={ref} style={{ width: "100%", height: spec?.height || 400 }} />
  );
}

export default function ChartRenderer({ engine, spec }) {
  if (!engine || !spec) return null;

  if (engine === ENGINE.PLOTLY) return <PlotlyRenderer spec={spec} />;
  if (engine === ENGINE.CHARTJS) return <ChartJsRenderer spec={spec} />;
  if (engine === ENGINE.D3) return <D3Renderer spec={spec} />;

  return null;
}

export { ENGINE };
