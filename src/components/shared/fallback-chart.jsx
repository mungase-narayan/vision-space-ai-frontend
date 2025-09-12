import React from 'react';

/**
 * Simple SVG-based chart fallback when Plotly fails to load
 */
export default function FallbackChart({ spec }) {
  const { data = [], layout = {} } = spec || {};

  if (!data.length || !data[0]?.x || !data[0]?.y) {
    return (
      <div className="p-4 border border-gray-200 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">No chart data available</p>
      </div>
    );
  }

  const trace = data[0];
  const xData = trace.x || [];
  const yData = trace.y || [];

  if (xData.length === 0 || yData.length === 0) {
    return (
      <div className="p-4 border border-gray-200 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">Invalid chart data</p>
      </div>
    );
  }

  // Calculate dimensions and scales
  const width = 600;
  const height = 400;
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Find data ranges
  const yMin = Math.min(...yData);
  const yMax = Math.max(...yData);
  const yRange = yMax - yMin || 1;
  const yPadding = yRange * 0.1;

  // Scale functions
  const xScale = (i) => (i / (xData.length - 1)) * chartWidth;
  const yScale = (val) => chartHeight - ((val - yMin + yPadding) / (yRange + 2 * yPadding)) * chartHeight;

  // Generate path for line chart
  const pathData = xData.map((_, i) => {
    const x = xScale(i);
    const y = yScale(yData[i]);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate bars for bar chart
  const isBarChart = trace.type === 'bar';
  const barWidth = chartWidth / xData.length * 0.8;

  return (
    <div className="w-full">
      <svg width={width} height={height} className="border border-gray-200 bg-white">
        {/* Title */}
        {layout.title && (
          <text
            x={width / 2}
            y={20}
            textAnchor="middle"
            className="text-sm font-semibold fill-gray-800"
          >
            {layout.title}
          </text>
        )}

        {/* Chart area */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <g key={ratio}>
              <line
                x1={0}
                y1={chartHeight * ratio}
                x2={chartWidth}
                y2={chartHeight * ratio}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            </g>
          ))}

          {/* Y-axis */}
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#374151" strokeWidth={2} />

          {/* X-axis */}
          <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#374151" strokeWidth={2} />

          {/* Data visualization */}
          {isBarChart ? (
            // Bar chart
            xData.map((label, i) => (
              <g key={i}>
                <rect
                  x={xScale(i) - barWidth / 2}
                  y={yScale(yData[i])}
                  width={barWidth}
                  height={chartHeight - yScale(yData[i])}
                  fill={trace.marker?.color || '#3b82f6'}
                  opacity={0.8}
                />
                <text
                  x={xScale(i)}
                  y={chartHeight + 15}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {String(label).length > 8 ? String(label).substring(0, 8) + '...' : label}
                </text>
              </g>
            ))
          ) : (
            // Line chart
            <>
              <path
                d={pathData}
                fill="none"
                stroke={trace.line?.color || trace.marker?.color || '#3b82f6'}
                strokeWidth={2}
              />
              {xData.map((label, i) => (
                <g key={i}>
                  <circle
                    cx={xScale(i)}
                    cy={yScale(yData[i])}
                    r={3}
                    fill={trace.marker?.color || '#3b82f6'}
                  />
                  <text
                    x={xScale(i)}
                    y={chartHeight + 15}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {String(label).length > 8 ? String(label).substring(0, 8) + '...' : label}
                  </text>
                </g>
              ))}
            </>
          )}

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const value = yMin - yPadding + (yRange + 2 * yPadding) * (1 - ratio);
            return (
              <text
                key={ratio}
                x={-10}
                y={chartHeight * ratio + 4}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {value.toFixed(1)}
              </text>
            );
          })}
        </g>

        {/* Axis labels */}
        {layout.xaxis?.title && (
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-sm fill-gray-700"
          >
            {layout.xaxis.title}
          </text>
        )}

        {layout.yaxis?.title && (
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${height / 2})`}
            className="text-sm fill-gray-700"
          >
            {layout.yaxis.title}
          </text>
        )}
      </svg>
    </div>
  );
}