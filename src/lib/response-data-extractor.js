/**
 * Response Data Extractor - Extracts actual data from AI responses for dynamic charts
 */

export class ResponseDataExtractor {
  constructor() {
    this.tablePatterns = [
      // Standard markdown table
      /\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g,
      // Table with headers
      /\|\s*Date[^|]*\|\s*([^|]+)\s*\|/gi,
      /\|\s*([^|]*\d{4}[^|]*)\s*\|\s*([^|]*\d+\.?\d*[^|]*)\s*\|/g
    ];
  }

  /**
   * Extract data from AI response content
   */
  extractData(content) {
    if (!content || typeof content !== 'string') return null;

    try {
      // Try different extraction methods
      const extractors = [
        () => this.extractFromMarkdownTable(content),
        () => this.extractFromInlineData(content),
        () => this.extractFromBulletPoints(content)
      ];

      for (const extractor of extractors) {
        try {
          const result = extractor();
          if (result && result.data.length > 0) {
            console.log('Successfully extracted data using extractor');
            return result;
          }
        } catch (error) {
          console.error('Extractor failed:', error);
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('Error in extractData:', error);
      return null;
    }
  }

  /**
   * Extract data from markdown tables
   */
  extractFromMarkdownTable(content) {
    console.log('Extracting from markdown table...');
    const lines = content.split('\n');
    const data = [];
    let headers = null;
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Check if this is a table line
      if (line.includes('|')) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);

        // Skip separator lines
        if (line.match(/^[\s|:-]+$/)) continue;

        if (cells.length >= 2) {
          // First table row - check if it's headers
          if (!inTable) {
            headers = cells;
            console.log('Found table headers:', headers);
            inTable = true;
            continue;
          }

          // Data row - take first two columns for x,y data
          const [xValue, yValue] = cells;
          console.log('Processing row:', xValue, '|', yValue);

          // Skip if we don't have both values
          if (!xValue || !yValue) {
            console.log('Skipping row - missing values');
            continue;
          }

          // Parse x-axis (date or category)
          let x = xValue;

          try {
            // Handle different date formats
            if (xValue.match(/\d{4}-\d{2}-\d{2}/)) {
              x = xValue; // Keep full date format
            } else if (xValue.match(/^\d{4}$/)) {
              x = parseInt(xValue); // Convert year to number
            } else if (xValue.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}$/i)) {
              // Handle "Sep 03" format - convert to a sortable format
              const parts = xValue.trim().split(/\s+/);
              console.log('Date parts:', parts);
              if (parts.length === 2) {
                const [month, day] = parts;
                const monthMap = {
                  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                  'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                  'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                };
                if (monthMap[month] && day && !isNaN(parseInt(day))) {
                  x = `2025-${monthMap[month]}-${day.padStart(2, '0')}`;
                  console.log('Converted date:', xValue, '→', x);
                }
              }
            }
          } catch (error) {
            console.error('Error parsing date:', xValue, error);
            x = xValue; // Fallback to original value
          }

          // Parse y-axis (numeric value) - handle decimal numbers better
          const yMatch = yValue.match(/(\d+\.?\d*)/);
          if (yMatch) {
            const y = parseFloat(yMatch[1]);
            if (!isNaN(y)) {
              console.log('Adding data point:', { x, y, label: xValue });
              data.push({
                x: x || xValue, // Fallback to original if parsing failed
                y: y,
                label: xValue
              });
            } else {
              console.log('Invalid y value:', yValue);
            }
          } else {
            console.log('No numeric value found in:', yValue);
          }
        }
      } else if (inTable && data.length > 0) {
        // End of table
        console.log('End of table detected');
        break;
      }
    }

    console.log('Extracted data points:', data.length);
    if (data.length === 0) return null;

    // Determine chart type and labels from content and headers
    const chartType = this.determineChartType(content, headers);
    const { title, xAxisTitle, yAxisTitle } = this.extractLabels(content, headers);

    console.log('Chart config:', { chartType, title, xAxisTitle, yAxisTitle });

    return {
      data: data,
      chartType: chartType,
      title: title,
      xAxisTitle: xAxisTitle,
      yAxisTitle: yAxisTitle,
      metadata: {
        source: 'markdown_table',
        dataPoints: data.length
      }
    };
  }

  /**
   * Extract data from inline text descriptions
   */
  extractFromInlineData(content) {
    const data = [];

    // Look for patterns like "Date: value" or "2025-09-05: 34.8"
    const patterns = [
      /(\d{4}-\d{2}-\d{2})[^\d]*(\d+\.?\d*)/g,
      /(\d{4})[^\d]*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/g
    ];

    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern)];
      for (const match of matches) {
        const x = match[1];
        const y = parseFloat(match[2].replace(/,/g, ''));
        if (!isNaN(y)) {
          data.push({
            x: x,
            y: y,
            label: x
          });
        }
      }
    }

    if (data.length === 0) return null;

    const chartType = this.determineChartType(content);
    const { title, xAxisTitle, yAxisTitle } = this.extractLabels(content);

    return {
      data: data,
      chartType: chartType,
      title: title,
      xAxisTitle: xAxisTitle,
      yAxisTitle: yAxisTitle,
      metadata: {
        source: 'inline_text',
        dataPoints: data.length
      }
    };
  }

  /**
   * Extract data from bullet points
   */
  extractFromBulletPoints(content) {
    const data = [];
    const bulletPattern = /[-•*]\s*([^:]+):\s*([0-9.]+)/g;

    const matches = [...content.matchAll(bulletPattern)];
    for (const match of matches) {
      const x = match[1].trim();
      const y = parseFloat(match[2]);
      if (!isNaN(y)) {
        data.push({
          x: x,
          y: y,
          label: x
        });
      }
    }

    if (data.length === 0) return null;

    const chartType = this.determineChartType(content);
    const { title, xAxisTitle, yAxisTitle } = this.extractLabels(content);

    return {
      data: data,
      chartType: chartType,
      title: title,
      xAxisTitle: xAxisTitle,
      yAxisTitle: yAxisTitle,
      metadata: {
        source: 'bullet_points',
        dataPoints: data.length
      }
    };
  }

  /**
   * Determine appropriate chart type based on content
   */
  determineChartType(content, headers = []) {
    const contentLower = content.toLowerCase();

    // Check for explicit chart type mentions
    if (contentLower.includes('line chart') || contentLower.includes('trend')) return 'line';
    if (contentLower.includes('bar chart') || contentLower.includes('column')) return 'bar';
    if (contentLower.includes('pie chart') || contentLower.includes('distribution')) return 'pie';
    if (contentLower.includes('scatter')) return 'scatter';

    // Determine from data characteristics
    if (contentLower.includes('over time') || contentLower.includes('daily') || contentLower.includes('trend')) {
      return 'line';
    }

    if (contentLower.includes('temperature') || contentLower.includes('salinity')) {
      return 'line'; // Time series data
    }

    if (contentLower.includes('count') || contentLower.includes('total') || contentLower.includes('annual')) {
      return 'bar';
    }

    // Default based on headers
    if (headers && headers.length >= 2) {
      const firstHeader = headers[0].toLowerCase();
      if (firstHeader.includes('date') || firstHeader.includes('time') || firstHeader.includes('day')) {
        return 'line';
      }
    }

    return 'line'; // Default for time series data
  }

  /**
   * Extract chart labels from content
   */
  extractLabels(content, headers = []) {
    let title = 'Data Visualization';
    let xAxisTitle = 'Category';
    let yAxisTitle = 'Value';

    // Extract title from headers or content
    const titlePatterns = [
      /^#+\s*([^\n]+)/m, // Markdown headers
      /\*\*([^*]+)\*\*/, // Bold text
      /([A-Z][^.!?]*(?:Trend|Data|Chart|Analysis|Measurements?))/i
    ];

    for (const pattern of titlePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        title = match[1].trim();
        break;
      }
    }

    // Extract axis titles from headers or content
    if (headers && headers.length >= 2) {
      xAxisTitle = headers[0].replace(/[()]/g, '').trim();
      yAxisTitle = headers[1].replace(/[()]/g, '').trim();
    } else {
      // Try to extract from content
      if (content.includes('Date')) xAxisTitle = 'Date';
      else if (content.includes('Year')) xAxisTitle = 'Year';
      else if (content.includes('Time')) xAxisTitle = 'Time';

      if (content.toLowerCase().includes('temperature')) yAxisTitle = 'Temperature (°C)';
      else if (content.toLowerCase().includes('salinity')) yAxisTitle = 'Salinity (PSU)';
      else if (content.toLowerCase().includes('count')) yAxisTitle = 'Count';
      else if (content.toLowerCase().includes('activation')) yAxisTitle = 'Activations';
    }

    return { title, xAxisTitle, yAxisTitle };
  }

  /**
   * Check if content has chartable data
   */
  hasChartableData(content) {
    if (!content || typeof content !== 'string') return false;

    // Check for table patterns (more aggressive detection)
    const hasTable = /\|[^|]*\|[^|]*\|/.test(content);

    // Check for numeric data in tables
    const hasNumericTable = /\|\s*[^|]*\d+\.?\d*[^|]*\|/.test(content);

    // Check for date patterns
    const hasDatePattern = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/.test(content) ||
      /\d{4}-\d{2}-\d{2}/.test(content) ||
      /\d{4}/.test(content);

    // Check for data patterns
    const hasDataPattern = /\d{4}-\d{2}-\d{2}[^\d]*\d+\.?\d*/.test(content) ||
      /\d{4}[^\d]*\d{1,3}(?:,\d{3})*/.test(content);

    // Check for chart keywords (more inclusive)
    const hasChartKeywords = /chart|graph|plot|trend|data.*show|visualization|salinity|temperature|analysis/i.test(content);

    // More aggressive detection - show chart if we have a table with numbers OR data patterns
    return (hasTable && hasNumericTable) || (hasDataPattern && hasChartKeywords) || (hasDatePattern && hasNumericTable);
  }
}

// Export singleton instance
export const responseDataExtractor = new ResponseDataExtractor();