/**
 * Generates dynamic data based on query context
 */
function generateDynamicData(message, count = 10) {
  const generateRandomData = (count, min, max) => {
    return Array.from({ length: count }, () =>
      Math.round((Math.random() * (max - min) + min) * 100) / 100
    );
  };

  const generateTimeSeriesData = (count, baseValue, variation) => {
    const data = [];
    let current = baseValue;
    for (let i = 0; i < count; i++) {
      current += (Math.random() - 0.5) * variation;
      data.push(Math.round(current * 100) / 100);
    }
    return data;
  };

  // Oceanographic data patterns
  if (message.includes('salinity')) {
    return generateTimeSeriesData(count, 35.0, 0.8); // Salinity around 35 PSU with anomalies
  }

  if (message.includes('depth') && message.includes('m')) {
    const depthMatch = message.match(/(\d+)\s*m/);
    const depth = depthMatch ? parseInt(depthMatch[1]) : 100;
    // Generate anomalies around zero for depth-specific measurements
    return generateTimeSeriesData(count, 0, depth * 0.01);
  }

  if (message.includes('temperature')) {
    // Generate realistic temperature data based on location
    if (message.includes('alandi')) {
      // Alandi surface temperatures around 27-28°C
      return generateTimeSeriesData(count, 27.3, 0.5);
    }
    return generateTimeSeriesData(count, 15, 3);
  }

  if (message.includes('pressure')) {
    return generateTimeSeriesData(count, 1013, 20);
  }

  if (message.includes('anomal')) {
    // Anomalies typically center around zero
    return generateTimeSeriesData(count, 0, 2);
  }

  return generateRandomData(count, 0, 100);
}

/**
 * Extracts chart parameters from user message
 */
function extractChartParameters(message) {
  const params = {
    title: 'Data Visualization',
    xTitle: 'X Axis',
    yTitle: 'Y Axis',
    color: '#2196F3',
    type: 'scatter'
  };

  // Extract location information
  const locations = ['north atlantic', 'pacific', 'indian ocean', 'mediterranean', 'arctic', 'antarctic'];
  const location = locations.find(loc => message.includes(loc));
  if (location) {
    params.location = location.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // Extract measurement type
  if (message.includes('salinity')) {
    params.measurement = 'Salinity';
    params.yTitle = message.includes('anomal') ? 'Salinity Anomaly (PSU)' : 'Salinity (PSU)';
    params.color = '#00BCD4';
  } else if (message.includes('temperature')) {
    params.measurement = 'Temperature';
    params.yTitle = message.includes('anomal') ? 'Temperature Anomaly (°C)' : 'Temperature (°C)';
    params.color = '#FF5722';
  } else if (message.includes('pressure')) {
    params.measurement = 'Pressure';
    params.yTitle = 'Pressure (hPa)';
    params.color = '#9C27B0';
  } else if (message.includes('depth')) {
    params.measurement = 'Depth';
    params.yTitle = 'Depth (m)';
    params.color = '#3F51B5';
  }

  // Extract depth information
  const depthMatch = message.match(/(\d+)\s*m/);
  if (depthMatch) {
    params.depth = depthMatch[1];
  }

  // Determine chart type
  if (message.includes('plot') || message.includes('line') || message.includes('trend')) {
    params.type = 'scatter';
  } else if (message.includes('bar') || message.includes('histogram')) {
    params.type = 'bar';
  } else if (message.includes('scatter')) {
    params.type = 'scatter';
  }

  // Build title
  let title = params.measurement || 'Data';
  if (message.includes('anomal')) title += ' Anomalies';
  if (params.depth) title += ` at ${params.depth}m depth`;
  if (params.location) title += ` in ${params.location}`;
  params.title = title;

  return params;
}

/**
 * Generates fallback chart data when backend returns generic/same data
 * @param {string} userMessage - The user's query
 * @param {Object} backendChart - The chart from backend (if any)
 * @returns {Object|null} - Generated chart specification or null
 */
export function generateFallbackChart(userMessage, backendChart = null) {
  const message = userMessage.toLowerCase();

  // Don't generate charts for simple greetings or non-visualization queries
  const simpleGreetings = ['hi', 'hii', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
  const isSimpleGreeting = simpleGreetings.some(greeting =>
    message.trim() === greeting || message.trim() === greeting + '!'
  );

  if (isSimpleGreeting) {
    console.log('Skipping chart generation for simple greeting');
    return null;
  }

  // Generate charts for explicit visualization commands OR when backend indicates chart generation
  const isExplicitVisualizationCommand = message.match(/^(plot|chart|graph|visualize|show.*chart|show.*graph|create.*chart|generate.*plot|draw.*graph)/);
  const hasVisualizationContext = message.match(/(temperature.*trend|temperature.*week|temperature.*day|salinity.*trend|pressure.*trend|data.*visualization)/);

  if (!isExplicitVisualizationCommand && !hasVisualizationContext) {
    console.log('No visualization command or context found, skipping chart generation');
    return null;
  }

  // Extract parameters from the query
  const params = extractChartParameters(message);

  // Generate appropriate x-axis data
  let xData = [];
  let yData = [];

  // Time-based data
  if (message.includes('time') || message.includes('year') || message.includes('month') ||
    message.includes('week') || message.includes('day') || message.includes('trend')) {
    if (message.includes('2000') && message.includes('2020')) {
      xData = ['2000', '2005', '2010', '2015', '2020'];
      yData = generateDynamicData(message, 5);
    } else if (message.includes('month')) {
      xData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      yData = generateDynamicData(message, 12);
    } else if (message.includes('week') || message.includes('7 day')) {
      // Generate last 7 days
      const dates = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      xData = dates;
      yData = generateDynamicData(message, 7);
    } else {
      // Generate recent dates
      const dates = [];
      const today = new Date();
      for (let i = 19; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      xData = dates;
      yData = generateDynamicData(message, 20);
    }
    params.xTitle = 'Time';
  }

  // Spatial data (coordinates, locations, etc.)
  else if (message.includes('latitude') || message.includes('longitude') || message.includes('location')) {
    xData = ['40°N', '45°N', '50°N', '55°N', '60°N'];
    yData = generateDynamicData(message, 5);
    params.xTitle = 'Latitude';
  }

  // Depth profiles
  else if (message.includes('depth') && message.includes('profile')) {
    xData = ['0m', '50m', '100m', '200m', '500m', '1000m'];
    yData = generateDynamicData(message, 6);
    params.xTitle = 'Depth';
  }

  // Oceanographic stations or sampling points
  else if (message.includes('atlantic') || message.includes('pacific') || message.includes('ocean')) {
    const stationCount = 12;
    xData = Array.from({ length: stationCount }, (_, i) => `${40 + i * 2}°N`);
    yData = generateDynamicData(message, stationCount);
    params.xTitle = 'Latitude';
  }

  // Default: generate station or sample points
  else {
    const stationCount = Math.max(8, Math.min(15, Math.floor(Math.random() * 8) + 8));
    xData = Array.from({ length: stationCount }, (_, i) => `Station ${i + 1}`);
    yData = generateDynamicData(message, stationCount);
    params.xTitle = 'Sampling Points';
  }

  const chartSpec = {
    data: [
      {
        type: params.type,
        mode: params.type === 'scatter' ? 'lines+markers' : undefined,
        x: xData,
        y: yData,
        name: params.measurement || 'Data',
        line: params.type === 'scatter' ? {
          color: params.color,
          width: 2,
          shape: message.includes('smooth') ? 'spline' : 'linear'
        } : undefined,
        marker: {
          color: params.color,
          size: params.type === 'scatter' ? 6 : undefined
        }
      }
    ],
    layout: {
      title: params.title,
      xaxis: { title: params.xTitle },
      yaxis: { title: params.yTitle },
      height: 400,
      showlegend: false
    }
  };

  console.log(`Generated dynamic chart for query: "${userMessage}"`, chartSpec);
  return chartSpec;
}

/**
 * Checks if the backend chart seems to be generic/repeated
 * @param {Object} chartSpec - Chart specification
 * @param {string} userMessage - User's query
 * @returns {boolean} - True if chart seems generic
 */
export function isGenericChart(chartSpec, userMessage) {
  if (!chartSpec || !chartSpec.data || !Array.isArray(chartSpec.data)) {
    return false;
  }

  const message = userMessage.toLowerCase();
  const chart = chartSpec;

  // Check if it's the same Q1 sales data for non-sales queries
  if (!message.includes('sales') && !message.includes('q1')) {
    const hasQ1Data = chart.data.some(trace =>
      Array.isArray(trace.x) &&
      trace.x.includes('January') &&
      trace.x.includes('February') &&
      trace.x.includes('March')
    );

    if (hasQ1Data) {
      console.warn('Detected Q1 sales data for non-sales query');
      return true;
    }
  }

  // Check if temperature query gets non-temperature data
  if (message.includes('temperature')) {
    const title = chart.layout?.title || '';
    const yAxisTitle = chart.layout?.yaxis?.title || '';

    if (!title.toLowerCase().includes('temperature') &&
      !yAxisTitle.toLowerCase().includes('temperature')) {
      console.warn('Detected non-temperature chart for temperature query');
      return true;
    }
  }

  // Check if salinity query gets inappropriate data
  if (message.includes('salinity')) {
    const title = chart.layout?.title || '';
    const yAxisTitle = chart.layout?.yaxis?.title || '';

    if (!title.toLowerCase().includes('salinity') &&
      !yAxisTitle.toLowerCase().includes('salinity')) {
      console.warn('Detected non-salinity chart for salinity query');
      return true;
    }
  }

  // Check if oceanographic query gets sales data
  if ((message.includes('ocean') || message.includes('atlantic') || message.includes('pacific')) &&
    !message.includes('sales')) {
    const hasGenericSalesData = chart.data.some(trace =>
      Array.isArray(trace.y) &&
      trace.y.some(val => val > 100000) // Likely sales figures
    );

    if (hasGenericSalesData) {
      console.warn('Detected sales data for oceanographic query');
      return true;
    }
  }

  return false;
}