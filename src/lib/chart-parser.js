/**
 * Advanced Chart Data Parser
 * Extracts chart data from various text formats and LLM responses
 */

export class ChartDataParser {
  constructor() {
    this.patterns = {
      // Table patterns
      tableWithHeaders: /\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g,
      simpleTable: /\|\s*(\d{4})\s*\|\s*([0-9,\s]+)\s*\|/g,

      // Descriptive patterns
      yearValue: /(\d{4}).*?(\d{1,3}(?:,\d{3})*|\d+)\s*(?:activations?|floats?|units?|count|total)/gi,
      bulletPoints: /[-•]\s*(\d{4}):\s*([0-9,]+)/g,

      // JSON patterns
      jsonArray: /\[[\s\S]*?\]/g,
      jsonObject: /\{[\s\S]*?\}/g,

      // Chart type indicators
      chartTypes: {
        bar: /bar\s+chart|bar\s+graph|column\s+chart/i,
        line: /line\s+chart|line\s+graph|trend\s+chart/i,
        pie: /pie\s+chart|donut\s+chart|circular\s+chart/i,
        scatter: /scatter\s+plot|scatter\s+chart/i,
        area: /area\s+chart|filled\s+chart/i
      }
    };
  }

  /**
   * Parse content and extract chart data
   */
  parse(content) {
    if (!content || typeof content !== 'string') return null;

    const result = {
      data: [],
      chartType: this.detectChartType(content),
      title: this.extractTitle(content),
      xAxisTitle: this.extractAxisTitle(content, 'x'),
      yAxisTitle: this.extractAxisTitle(content, 'y'),
      metadata: this.extractMetadata(content)
    };

    // Try different extraction methods in order of preference
    const extractors = [
      () => this.extractFromStructuredResponse(content),
      () => this.extractFromTable(content),
      () => this.extractFromDescriptiveText(content),
      () => this.extractFromJSON(content),
      () => this.extractFromBulletPoints(content),
      () => this.generateSampleData(content)
    ];

    for (const extractor of extractors) {
      const data = extractor();
      if (data && data.length > 0) {
        result.data = data;
        break;
      }
    }

    return result.data.length > 0 ? result : null;
  }

  /**
   * Detect chart type from content
   */
  detectChartType(content) {
    for (const [type, pattern] of Object.entries(this.patterns.chartTypes)) {
      if (pattern.test(content)) return type;
    }

    // Default based on content analysis
    if (content.includes('trend') || content.includes('over time')) return 'line';
    if (content.includes('distribution') || content.includes('percentage')) return 'pie';
    return 'bar'; // Default
  }

  /**
   * Extract title from content
   */
  extractTitle(content) {
    const titlePatterns = [
      /(?:chart|graph).*?[–-]\s*([^(\n]*)/i,
      /(?:title|heading):\s*([^\n]+)/i,
      /^#+\s*([^\n]+)/m,
      /\*\*([^*]+)\*\*/
    ];

    for (const pattern of titlePatterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }

    // Context-specific titles
    if (content.toLowerCase().includes('argo')) {
      return 'ARGO Float Activations by Year';
    }
    if (content.toLowerCase().includes('annual') && content.toLowerCase().includes('count')) {
      return 'Annual Count Data';
    }

    return 'Data Visualization';
  }

  /**
   * Extract axis titles
   */
  extractAxisTitle(content, axis) {
    const axisPatterns = {
      x: [
        /x[-\s]*axis[:\s]*([^\n,]+)/i,
        /horizontal[:\s]*([^\n,]+)/i,
        /year|time|date|period/i
      ],
      y: [
        /y[-\s]*axis[:\s]*([^\n,]+)/i,
        /vertical[:\s]*([^\n,]+)/i,
        /count|number|value|amount|total/i
      ]
    };

    const patterns = axisPatterns[axis] || [];
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) return match[1].trim();
    }

    // Default titles
    if (axis === 'x') {
      if (content.includes('year') || /\d{4}/.test(content)) return 'Year';
      return 'Category';
    } else {
      if (content.includes('activation')) return 'Number of Activations';
      if (content.includes('count')) return 'Count';
      return 'Value';
    }
  }

  /**
   * Extract metadata like units, descriptions
   */
  extractMetadata(content) {
    const metadata = {};

    // Extract units
    const unitMatch = content.match(/\(([^)]*(?:unit|count|number)[^)]*)\)/i);
    if (unitMatch) metadata.units = unitMatch[1];

    // Extract date range
    const dateRangeMatch = content.match(/(\d{4})[^\d]*(\d{4})/);
    if (dateRangeMatch) {
      metadata.dateRange = {
        start: parseInt(dateRangeMatch[1]),
        end: parseInt(dateRangeMatch[2])
      };
    }

    return metadata;
  }

  /**
   * Extract data from table format
   */
  extractFromTable(content) {
    const data = [];

    // Try markdown table format
    const tableMatches = [...content.matchAll(this.patterns.simpleTable)];
    for (const match of tableMatches) {
      const year = parseInt(match[1]);
      const value = parseInt(match[2].replace(/[,\s]/g, ''));
      if (!isNaN(year) && !isNaN(value)) {
        data.push({ x: year, y: value, label: year.toString() });
      }
    }

    // Try more complex table parsing
    if (data.length === 0) {
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('|')) {
          const cells = line.split('|').map(cell => cell.trim());
          if (cells.length >= 3) {
            const year = parseInt(cells[1]);
            const value = parseInt(cells[2].replace(/[,\s]/g, ''));
            if (!isNaN(year) && !isNaN(value) && year >= 1900 && year <= 2100) {
              data.push({ x: year, y: value, label: year.toString() });
            }
          }
        }
      }
    }

    return data;
  }

  /**
   * Extract data from descriptive text
   */
  extractFromDescriptiveText(content) {
    const data = [];
    const matches = [...content.matchAll(this.patterns.yearValue)];

    for (const match of matches) {
      const year = parseInt(match[1]);
      const value = parseInt(match[2].replace(/[,\s]/g, ''));
      if (!isNaN(year) && !isNaN(value) && year >= 1900 && year <= 2100) {
        data.push({ x: year, y: value, label: year.toString() });
      }
    }

    // Remove duplicates and sort
    const uniqueData = data.filter((item, index, self) =>
      index === self.findIndex(t => t.x === item.x)
    );

    return uniqueData.sort((a, b) => a.x - b.x);
  }

  /**
   * Extract data from JSON format
   */
  extractFromJSON(content) {
    const data = [];

    try {
      // Try to find JSON arrays or objects
      const jsonMatches = [...content.matchAll(this.patterns.jsonArray)];
      for (const match of jsonMatches) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (typeof item === 'object' && item.x !== undefined && item.y !== undefined) {
              data.push({
                x: item.x,
                y: item.y,
                label: item.label || item.x.toString()
              });
            }
          }
        }
      }
    } catch (e) {
      // JSON parsing failed, continue with other methods
    }

    return data;
  }

  /**
   * Extract data from bullet points
   */
  extractFromBulletPoints(content) {
    const data = [];
    const matches = [...content.matchAll(this.patterns.bulletPoints)];

    for (const match of matches) {
      const year = parseInt(match[1]);
      const value = parseInt(match[2].replace(/,/g, ''));
      if (!isNaN(year) && !isNaN(value)) {
        data.push({ x: year, y: value, label: year.toString() });
      }
    }

    return data.sort((a, b) => a.x - b.x);
  }

  /**
   * Extract data from structured response format
   */
  extractFromStructuredResponse(content) {
    const data = [];

    // Look for table-like structures in the response
    const lines = content.split('\n');
    let inDataSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect start of data section
      if (line.toLowerCase().includes('interpretation') ||
        line.toLowerCase().includes('data') ||
        line.includes('Date') && line.includes('Temperature')) {
        inDataSection = true;
        continue;
      }

      // Skip header lines
      if (line.includes('---') || line.includes('===')) continue;

      if (inDataSection && line.includes('|')) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);

        if (cells.length >= 2) {
          // Try to parse date and value
          const dateStr = cells[0];
          const valueStr = cells[1];

          // Parse date (various formats)
          let x = dateStr;
          if (dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
            x = dateStr; // Keep full date
          } else if (dateStr.match(/\d{4}/)) {
            x = parseInt(dateStr);
          }

          // Parse value
          const y = parseFloat(valueStr.replace(/[^\d.-]/g, ''));

          if (!isNaN(y)) {
            data.push({
              x: x,
              y: y,
              label: dateStr
            });
          }
        }
      }
    }

    return data;
  }

  /**
   * Generate sample data based on context - DISABLED
   * This was causing the same chart issue
   */
  generateSampleData(content) {
    // Don't generate sample data - let the chart show "no data" instead
    return [];
  }
}

// Export singleton instance
export const chartParser = new ChartDataParser();