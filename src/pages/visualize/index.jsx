import React, { useState } from 'react';
import { DynamicChartGenerator } from '@/components';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateDocumentTitle } from '@/hooks';
import { URLS } from '@/constants';

const VisualizePage = () => {
  useUpdateDocumentTitle({ title: `Visualize - ${URLS.LOGO_TEXT}` });

  const [inputText, setInputText] = useState('');
  const [generatedCharts, setGeneratedCharts] = useState([]);

  // Sample data examples
  const sampleData = {
    argo: `✅ Server is running locally on http://localhost:3600
🔍 Analyzing query for visualization intent...
📊 Query analysis result: {needsChart: true,chartType: "bar",dataRequest: "Number of float activations for each year from 2015 through 2025"}
✅ Visualization requested - enabling chart generation
📝 Final response: **Bar Chart – Annual ARGO Float Activations (2015‑2025)**

### What the chart shows
- **X‑axis:** Calendar year (2015 → 2025)  
- **Y‑axis:** Number of ARGO floats that were activated (i.e., released and began transmitting data) in each year.  
- **Bars:** Height of each bar corresponds to the count of new float activations for that year.

### Interpretation of the trend
| Year | Activations | Key oceanographic / programmatic drivers |
|------|-------------|-------------------------------------------|
| 2015 | 3,000 | Baseline after the 2010‑2014 expansion phase; many older floats were still operating. |
| 2016 | 3,500 | Small increase as the **Argo Global Observing System (GO‑S)** secured additional funding for the Southern Ocean. |
| 2017 | 4,000 | Launch of the **Deep‑Argo** pilot (floats capable of 2,000 m) required new surface‑drifting units, boosting total activations. |
| 2018 | 4,500 | International collaboration (e.g., IODE, JCOMM) added 500 floats to improve coverage of the equatorial Pacific. |
| 2019 | 5,000 | **Global Climate Observing System (GCOS)** mandated a 10 % annual increase in profiling float density, prompting a large procurement round. |
| 2020 | 4,800 | COVID‑19 pandemic disrupted manufacturing and deployment logistics, causing a slight dip despite continued orders. |
| 2021 | 5,200 | Recovery of ship‑based deployments and the start of the **Argo‑NextGen** program (autonomous launch from coastal vessels) restored growth. |
| 2022 | 5,600 | Introduction of **bio‑fouling‑resistant coatings** extended float lifetimes, encouraging agencies to replace aging units faster. |
| 2023 | 6,000 | A major **International Ocean Observation Summit** secured a multi‑year budget increase for the Global Argo Program, leading to the largest activation year to date. |
| 2024 | 6,300 | Deployment of **Hybrid Argo‑Gliders** (profiling + gliding) added a new class of floats, counted within the activation tally. |
| 2025 | 6,600 | Continued scaling of the **Deep‑Argo** fleet (now targeting 3,000 m depth) and the rollout of **real‑time data relay satellites** made float activation more attractive for national programs. |

The bar chart clearly demonstrates a **robust and growing ARGO float deployment program**, despite short‑term disruptions.`,

    sales: `Here's our quarterly sales performance for 2024:

**Line Chart - Quarterly Sales Growth 2024**

Our sales team achieved remarkable growth throughout 2024:

- Q1 2024: $125,000 in revenue
- Q2 2024: $156,000 in revenue  
- Q3 2024: $189,000 in revenue
- Q4 2024: $234,000 in revenue

This represents a consistent upward trend with 87% growth from Q1 to Q4.`,

    market: `**Pie Chart - Market Share Distribution**

The current market landscape shows the following distribution:

- Company A: 35% market share
- Company B: 28% market share  
- Company C: 18% market share
- Company D: 12% market share
- Others: 7% market share

This data represents the competitive landscape as of December 2024.`
  };

  const handleGenerate = () => {
    if (!inputText.trim()) return;

    const newChart = {
      id: Date.now(),
      content: inputText,
      timestamp: new Date().toLocaleTimeString()
    };

    setGeneratedCharts(prev => [newChart, ...prev]);
  };

  const loadSample = (key) => {
    setInputText(sampleData[key]);
  };

  const clearAll = () => {
    setGeneratedCharts([]);
    setInputText('');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dynamic Chart Visualization</h1>
        <p className="text-muted-foreground">
          Generate interactive charts from text descriptions, tables, and data.
          Paste your content below and watch it transform into beautiful visualizations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Content</CardTitle>
            <CardDescription>
              Paste text containing data, tables, or chart descriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your content here... (tables, data descriptions, chart requests, etc.)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />

            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={!inputText.trim()}>
                Generate Chart
              </Button>
              <Button variant="outline" onClick={clearAll}>
                Clear All
              </Button>
            </div>

            {/* Sample Data Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Try sample data:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSample('argo')}
                >
                  ARGO Floats Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSample('sales')}
                >
                  Sales Performance
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSample('market')}
                >
                  Market Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              The system automatically detects and visualizes data patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">📊 Supported Formats</h4>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Markdown tables with data</li>
                  <li>• Text with year/value pairs</li>
                  <li>• Chart type requests (bar, line, pie)</li>
                  <li>• Bullet points with numbers</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm">🎨 Chart Types</h4>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• <strong>Bar Charts:</strong> Categorical comparisons</li>
                  <li>• <strong>Line Charts:</strong> Trends over time</li>
                  <li>• <strong>Pie Charts:</strong> Part-to-whole relationships</li>
                  <li>• <strong>Scatter Plots:</strong> Correlation analysis</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm">⚡ Features</h4>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Interactive charts with zoom/pan</li>
                  <li>• Customizable colors and styling</li>
                  <li>• Export to PNG/SVG formats</li>
                  <li>• Real-time chart type switching</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Charts */}
      {generatedCharts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Generated Charts</h2>
            <span className="text-sm text-muted-foreground">
              {generatedCharts.length} chart{generatedCharts.length !== 1 ? 's' : ''} generated
            </span>
          </div>

          {generatedCharts.map((chart) => (
            <Card key={chart.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Chart #{chart.id}</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    Generated at {chart.timestamp}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <DynamicChartGenerator content={chart.content} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {generatedCharts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium mb-2">No charts generated yet</h3>
              <p className="text-sm">
                Paste some data above and click "Generate Chart" to see the magic happen!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisualizePage;