/**
 * Converts chart types based on user request and chart data
 * @param {Object} chartSpec - The chart specification
 * @param {string} userMessage - The user's original message
 * @returns {Object} - Modified chart specification
 */
export function convertChartType(chartSpec, userMessage) {
  if (!chartSpec || !chartSpec.data || !Array.isArray(chartSpec.data)) {
    return chartSpec;
  }

  const message = userMessage.toLowerCase();
  const requestedLineChart = message.includes('line chart') ||
    message.includes('line graph') ||
    message.includes('trend') ||
    (message.includes('line') && (message.includes('chart') || message.includes('graph')));

  const requestedBarChart = message.includes('bar chart') ||
    message.includes('bar graph') ||
    (message.includes('bar') && (message.includes('chart') || message.includes('graph')));

  // Create a deep copy to avoid mutating the original
  const convertedSpec = JSON.parse(JSON.stringify(chartSpec));

  // Convert bar chart to line chart if user requested line chart
  if (requestedLineChart && !requestedBarChart) {
    convertedSpec.data.forEach(trace => {
      if (trace.type === 'bar') {
        trace.type = 'scatter';
        trace.mode = 'lines+markers';

        // Update layout title to reflect the change
        if (convertedSpec.layout && convertedSpec.layout.title) {
          convertedSpec.layout.title = convertedSpec.layout.title.replace(/Bar Chart/i, 'Line Chart');
        }
      }
    });

    console.log('Converted bar chart to line chart based on user request');
  }

  // Convert line chart to bar chart if user requested bar chart
  else if (requestedBarChart && !requestedLineChart) {
    convertedSpec.data.forEach(trace => {
      if (trace.type === 'scatter' || trace.type === 'line') {
        trace.type = 'bar';
        delete trace.mode; // Remove mode property for bar charts

        // Update layout title to reflect the change
        if (convertedSpec.layout && convertedSpec.layout.title) {
          convertedSpec.layout.title = convertedSpec.layout.title.replace(/Line Chart/i, 'Bar Chart');
        }
      }
    });

    console.log('Converted line chart to bar chart based on user request');
  }

  return convertedSpec;
}

/**
 * Enhances chart based on data type and user request
 * @param {Object} chartSpec - The chart specification
 * @param {string} userMessage - The user's original message
 * @returns {Object} - Enhanced chart specification
 */
export function enhanceChart(chartSpec, userMessage) {
  if (!chartSpec || !chartSpec.data || !Array.isArray(chartSpec.data)) {
    return chartSpec;
  }

  const message = userMessage.toLowerCase();
  const enhanced = JSON.parse(JSON.stringify(chartSpec));

  // Enhance temperature charts
  if (message.includes('temperature')) {
    enhanced.data.forEach(trace => {
      if (trace.type === 'scatter' || trace.type === 'line') {
        trace.line = trace.line || {};
        trace.line.color = '#ff6b6b'; // Red color for temperature
        trace.marker = trace.marker || {};
        trace.marker.color = '#ff6b6b';
      }
    });

    // Update y-axis for temperature
    if (enhanced.layout) {
      enhanced.layout.yaxis = enhanced.layout.yaxis || {};
      if (!enhanced.layout.yaxis.title) {
        enhanced.layout.yaxis.title = 'Temperature (°C)';
      }
    }
  }

  // Enhance time series data (last X days/weeks/months)
  if (message.match(/last \d+ (days?|weeks?|months?)/)) {
    enhanced.data.forEach(trace => {
      if (trace.type === 'scatter' || trace.type === 'line') {
        trace.line = trace.line || {};
        trace.line.shape = 'spline'; // Smooth curves for time series
      }
    });
  }

  return enhanced;
}