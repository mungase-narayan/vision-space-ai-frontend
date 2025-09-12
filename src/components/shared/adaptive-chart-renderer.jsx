import React, { useMemo } from 'react';
import ChartRenderer, { ENGINE } from './chart-renderer';

/**
 * Adaptive Chart Renderer - Intelligently renders charts based on data characteristics
 */
export default function AdaptiveChartRenderer({ data, chartType, title, xAxisTitle, yAxisTitle, config = {} }) {
  const chartSpec = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Analyze data characteristics
    const hasDateData = data.some(d => typeof d.x === 'string' && d.x.match(/\d{4}-\d{2}-\d{2}/));
    const hasYearData = data.some(d => typeof d.x === 'number' && d.x >= 1900 && d.x <= 2100);
    const isNumericX = data.every(d => typeof d.x === 'number');
    const isTemperatureData = yAxisTitle?.toLowerCase().includes('temperature') || title?.toLowerCase().includes('temperature');

    // Color schemes
    const colorSchemes = {
      temperature: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'],
      time: ['#3b82f6', '#1e40af', '#60a5fa', '#93c5fd', '#dbeafe'],
      count: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'],
      default: ['#8b5cf6', '#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe']
    };

    const colors = isTemperatureData ? colorSchemes.temperature :
      (hasDateData || hasYearData) ? colorSchemes.time :
        yAxisTitle?.toLowerCase().includes('count') ? colorSchemes.count :
          colorSchemes.default;

    // Common layout configuration
    const commonLayout = {
      title: {
        text: title,
        font: { size: 16, family: 'system-ui, -apple-system, sans-serif' },
        x: 0.5
      },
      height: config.height || 400,
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      showlegend: config.showLegend || false,
      margin: { t: 60, b: 60, l: 80, r: 40 }
    };

    // Chart type specific configurations
    if (chartType === 'pie') {
      return {
        engine: ENGINE.PLOTLY,
        spec: {
          data: [{
            type: 'pie',
            labels: data.map(d => d.label || d.x.toString()),
            values: data.map(d => d.y),
            hole: 0.3,
            textinfo: 'label+percent',
            textposition: 'outside',
            marker: { colors: colors },
            hovertemplate: '<b>%{label}</b><br>Value: %{value}<br>Percentage: %{percent}<extra></extra>'
          }],
          layout: {
            ...commonLayout,
            legend: config.showLegend ? {
              orientation: 'v',
              x: 1.02,
              y: 0.5
            } : undefined
          },
          config: {
            responsive: true,
            displayModeBar: true,
            displaylogo: false
          }
        }
      };
    }

    if (chartType === 'scatter') {
      return {
        engine: ENGINE.PLOTLY,
        spec: {
          data: [{
            type: 'scatter',
            mode: 'markers',
            x: data.map(d => d.x),
            y: data.map(d => d.y),
            name: yAxisTitle,
            marker: {
              color: colors[0],
              size: 10,
              opacity: 0.7,
              line: { color: colors[1], width: 1 }
            },
            hovertemplate: `<b>${xAxisTitle}: %{x}</b><br>${yAxisTitle}: %{y}<extra></extra>`
          }],
          layout: {
            ...commonLayout,
            xaxis: {
              title: { text: xAxisTitle, font: { size: 14 } },
              type: isNumericX ? 'linear' : 'category',
              gridcolor: config.showGrid ? '#e5e7eb' : 'rgba(0,0,0,0)'
            },
            yaxis: {
              title: { text: yAxisTitle, font: { size: 14 } },
              tickformat: isTemperatureData ? '.1f' : ',d',
              gridcolor: config.showGrid ? '#e5e7eb' : 'rgba(0,0,0,0)'
            },
            hovermode: 'closest'
          },
          config: {
            responsive: true,
            displayModeBar: true,
            displaylogo: false
          }
        }
      };
    }

    // Line and area charts
    if (chartType === 'line' || chartType === 'area') {
      return {
        engine: ENGINE.PLOTLY,
        spec: {
          data: [{
            type: 'scatter',
            mode: 'lines+markers',
            fill: chartType === 'area' ? 'tonexty' : 'none',
            x: data.map(d => d.x),
            y: data.map(d => d.y),
            name: yAxisTitle,
            line: {
              color: colors[0],
              width: 3,
              shape: hasDateData ? 'linear' : 'spline',
              smoothing: hasDateData ? 0 : 0.3
            },
            marker: {
              color: colors[0],
              size: 6,
              line: { color: colors[1], width: 1 }
            },
            fillcolor: chartType === 'area' ? colors[0] + '20' : undefined,
            hovertemplate: `<b>${xAxisTitle}: %{x}</b><br>${yAxisTitle}: %{y}<extra></extra>`
          }],
          layout: {
            ...commonLayout,
            xaxis: {
              title: { text: xAxisTitle, font: { size: 14 } },
              type: hasDateData ? 'date' : isNumericX ? 'linear' : 'category',
              tickformat: hasDateData ? '%Y-%m-%d' : undefined,
              gridcolor: config.showGrid ? '#e5e7eb' : 'rgba(0,0,0,0)'
            },
            yaxis: {
              title: { text: yAxisTitle, font: { size: 14 } },
              tickformat: isTemperatureData ? '.1f' : ',d',
              gridcolor: config.showGrid ? '#e5e7eb' : 'rgba(0,0,0,0)'
            },
            hovermode: 'x unified'
          },
          config: {
            responsive: true,
            displayModeBar: true,
            displaylogo: false
          }
        }
      };
    }

    // Default: Bar chart
    return {
      engine: ENGINE.PLOTLY,
      spec: {
        data: [{
          type: 'bar',
          x: data.map(d => d.x),
          y: data.map(d => d.y),
          name: yAxisTitle,
          marker: {
            color: colors[0],
            line: { color: colors[1], width: 1 },
            opacity: 0.8
          },
          hovertemplate: `<b>${xAxisTitle}: %{x}</b><br>${yAxisTitle}: %{y:,}<extra></extra>`
        }],
        layout: {
          ...commonLayout,
          xaxis: {
            title: { text: xAxisTitle, font: { size: 14 } },
            type: hasDateData ? 'date' : isNumericX ? 'linear' : 'category',
            tickformat: hasDateData ? '%Y-%m-%d' : undefined,
            gridcolor: config.showGrid ? '#e5e7eb' : 'rgba(0,0,0,0)'
          },
          yaxis: {
            title: { text: yAxisTitle, font: { size: 14 } },
            tickformat: isTemperatureData ? '.1f' : ',d',
            gridcolor: config.showGrid ? '#e5e7eb' : 'rgba(0,0,0,0)'
          },
          hovermode: 'x unified'
        },
        config: {
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          toImageButtonOptions: {
            format: 'png',
            filename: title?.toLowerCase().replace(/\s+/g, '_') || 'chart',
            height: config.height || 400,
            width: 800,
            scale: 2
          }
        }
      }
    };
  }, [data, chartType, title, xAxisTitle, yAxisTitle, config]);

  if (!chartSpec) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No chart data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ChartRenderer engine={chartSpec.engine} spec={chartSpec.spec} />
    </div>
  );
}