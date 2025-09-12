/**
 * Smart Chart Detector - Analyzes AI responses and determines if they contain chartable data
 */

export class SmartChartDetector {
  constructor() {
    this.dataPatterns = [
      // Table patterns
      /\|\s*[^|]*\d{4}[^|]*\|\s*[^|]*\d+[^|]*\|/g, // Year-value tables
      /\|\s*[^|]*\d{2,4}[-/]\d{1,2}[-/]\d{1,4}[^|]*\|\s*[^|]*\d+\.?\d*[^|]*\|/g, // Date-value tables

      // Structured data patterns
      /(?:Date|Year|Month|Day)\s*[:\(].*?\)\s*(?:Temperature|Value|Count|Amount)/i,

      // Numeric data patterns
      /\d{4}[-/]\d{1,2}[-/]\d{1,2}.*?\d+\.?\d*/g, // Date with numeric value
      /\d{4}.*?\d{1,3}(?:,\d{3})*(?:\.\d+)?/g, // Year with formatted number

      // Chart keywords
      /(?:chart|graph|plot|visualization|data.*show)/i
    ];

    this.chartTypeIndicators = {
      line: [
        /trend|over time|timeline|progression|change.*time/i,
        /temperature.*time|daily.*data|weekly.*data/i
      ],
      bar: [
        /comparison|compare|annual|yearly|monthly/i,
        /count|total|number.*by/i
      ],
      pie: [
        /distribution|percentage|proportion|share|breakdown/i,
        /part.*whole|composition/i
      ],
      scatter: [
        /correlation|relationship|scatter|plot.*against/i,
        /vs\.|versus|compared.*to/i
      ]
    };
  }

  /**
   * Analyze content and determine if it contains chartable data
   */
  analyze(content) {
    if (!content || typeof content !== 'string') {
      return { hasChartData: false, confidence: 0 };
    }

    const analysis = {
      hasChartData: false,
      confidence: 0,
      suggestedChartType: 'bar',
      dataPoints: 0,
      dataType: 'unknown',
      title: null,
      xAxis: null,
      yAxis: null
    };

    // Check for data patterns
    let patternMatches = 0;
    for (const pattern of this.dataPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        patternMatches += matches.length;
        analysis.dataPoints = Math.max(analysis.dataPoints, matches.length);
      }
    }

    // Determine data type and chart type
    if (content.includes('temperature') || content.includes('°C') || content.includes('°F')) {
      analysis.dataType = 'temperature';
      analysis.suggestedChartType = 'line';
      analysis.yAxis = 'Temperature';
    } else if (content.includes('count') || content.includes('total') || content.includes('number')) {
      analysis.dataType = 'count';
      analysis.suggestedChartType = 'bar';
      analysis.yAxis = 'Count';
    } else if (content.includes('percentage') || content.includes('%')) {
      analysis.dataType = 'percentage';
      analysis.suggestedChartType = 'pie';
      analysis.yAxis = 'Percentage';
    }

    // Detect chart type from content
    for (const [type, patterns] of Object.entries(this.chartTypeIndicators)) {
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          analysis.suggestedChartType = type;
          break;
        }
      }
    }

    // Extract title
    analysis.title = this.extractTitle(content);

    // Extract axis labels
    if (content.includes('Date') || /\d{4}-\d{2}-\d{2}/.test(content)) {
      analysis.xAxis = 'Date';
    } else if (/\d{4}/.test(content)) {
      analysis.xAxis = 'Year';
    }

    // Calculate confidence
    let confidence = 0;
    if (patternMatches > 0) confidence += 30;
    if (analysis.dataPoints >= 3) confidence += 25;
    if (analysis.dataType !== 'unknown') confidence += 20;
    if (analysis.title) confidence += 15;
    if (content.toLowerCase().includes('chart') || content.toLowerCase().includes('graph')) confidence += 10;

    analysis.confidence = Math.min(confidence, 100);
    analysis.hasChartData = confidence >= 50;

    return analysis;
  }

  /**
   * Extract title from content
   */
  extractTitle(content) {
    const titlePatterns = [
      /^#+\s*([^\n]+)/m, // Markdown headers
      /\*\*([^*]+)\*\*/, // Bold text
      /(?:title|heading):\s*([^\n]+)/i,
      /([A-Z][^.!?]*(?:Chart|Graph|Data|Temperature|Count|Analysis))/i
    ];

    for (const pattern of titlePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Context-based titles
    if (content.includes('temperature')) {
      return 'Temperature Data';
    } else if (content.includes('ARGO') || content.includes('float')) {
      return 'ARGO Float Data';
    } else if (content.includes('annual') || content.includes('yearly')) {
      return 'Annual Data';
    }

    return 'Data Visualization';
  }

  /**
   * Extract structured data from AI response
   */
  extractData(content) {
    const data = [];

    // Split content into lines for processing
    const lines = content.split('\n');
    let inDataSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Detect data section start
      if (line.toLowerCase().includes('interpretation') ||
        line.toLowerCase().includes('data') ||
        (line.includes('Date') && line.includes('Temperature')) ||
        (line.includes('Year') && line.includes('Count'))) {
        inDataSection = true;
        continue;
      }

      // Skip separator lines
      if (line.match(/^[-=|+\s]+$/)) continue;

      // Process data lines
      if (inDataSection && line.includes('|')) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);

        if (cells.length >= 2) {
          const [xValue, yValue] = cells;

          // Parse x-axis value (date, year, or category)
          let x = xValue;
          if (xValue.match(/\d{4}-\d{2}-\d{2}/)) {
            x = xValue; // Keep full date string
          } else if (xValue.match(/^\d{4}$/)) {
            x = parseInt(xValue); // Convert year to number
          }

          // Parse y-axis value (numeric)
          const y = parseFloat(yValue.replace(/[^\d.-]/g, ''));

          if (!isNaN(y)) {
            data.push({
              x: x,
              y: y,
              label: xValue
            });
          }
        }
      }
    }

    return data.length > 0 ? data : null;
  }
}

// Export singleton instance
export const smartChartDetector = new SmartChartDetector();