import React, { useMemo, useState, useCallback } from 'react';
import ChartRenderer, { ENGINE } from './chart-renderer';
import AdaptiveChartRenderer from './adaptive-chart-renderer';
import ChartConfigurator from './chart-configurator';
import { responseDataExtractor } from '@/lib/response-data-extractor';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3 } from 'lucide-react';

/**
 * Dynamic Chart Generator - Parses LLM responses and generates interactive charts
 * Supports multiple chart types and data formats with full customization
 */
export default function DynamicChartGenerator({ content, model }) {
  const [config, setConfig] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const chartData = useMemo(() => {
    if (!content || typeof content !== 'string') return null;

    // Extract real data from AI response
    const extracted = responseDataExtractor.extractData(content);
    console.log('DynamicChartGenerator - Extracted data:', extracted);
    if (!extracted || extracted.data.length === 0) {
      console.log('DynamicChartGenerator - No data extracted');
      return null;
    }

    const baseConfig = {
      data: extracted.data,
      chartType: extracted.chartType,
      title: extracted.title,
      xAxisTitle: extracted.xAxisTitle,
      yAxisTitle: extracted.yAxisTitle,
      metadata: extracted.metadata,
      colorScheme: 'blue',
      showGrid: true,
      showLegend: false,
      height: 400
    };

    // Initialize config if not set
    if (!config) {
      setConfig(baseConfig);
    }

    return baseConfig;
  }, [content, config]);

  const handleConfigChange = useCallback((newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Re-extract the data from content
    const extracted = responseDataExtractor.extractData(content);
    if (extracted) {
      setConfig(prev => ({
        ...prev,
        data: extracted.data,
        chartType: extracted.chartType,
        title: extracted.title,
        xAxisTitle: extracted.xAxisTitle,
        yAxisTitle: extracted.yAxisTitle,
        metadata: extracted.metadata
      }));
    }
    setIsRefreshing(false);
  }, [content]);

  const handleExport = useCallback(async (format, exportConfig) => {
    // This would integrate with Plotly's export functionality
    // For now, we'll use the browser's built-in functionality
    if (format === 'png' || format === 'svg') {
      // Trigger Plotly's download
      const plotlyDiv = document.querySelector('[data-chart-renderer="true"] .js-plotly-plot');
      if (plotlyDiv && window.Plotly) {
        await window.Plotly.downloadImage(plotlyDiv, {
          format: format,
          width: 800,
          height: exportConfig.height || 400,
          filename: exportConfig.title.toLowerCase().replace(/\s+/g, '_')
        });
      }
    }
  }, []);

  // Use current config or fallback to chartData
  const currentConfig = config || chartData;

  if (!chartData || chartData.data.length === 0) return null;



  return (
    <div className="my-4 p-4 border border-border rounded-lg bg-background">
      {/* Header with controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            📊 Dynamic Chart Generated
          </span>
          <span className="text-xs text-muted-foreground">
            {currentConfig.data.length} data points • {currentConfig.chartType} chart
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          <ChartConfigurator
            chartData={currentConfig}
            currentConfig={currentConfig}
            onConfigChange={handleConfigChange}
            onExport={handleExport}
          />
        </div>
      </div>

      {/* Chart */}
      <div data-chart-renderer="true">
        <AdaptiveChartRenderer
          data={currentConfig.data}
          chartType={currentConfig.chartType}
          title={currentConfig.title}
          xAxisTitle={currentConfig.xAxisTitle}
          yAxisTitle={currentConfig.yAxisTitle}
          config={{
            height: currentConfig.height,
            showGrid: currentConfig.showGrid,
            showLegend: currentConfig.showLegend,
            colorScheme: currentConfig.colorScheme
          }}
        />
      </div>

      {/* Quick chart type selector */}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Quick switch:</span>
        <div className="flex gap-1">
          {['bar', 'line', 'pie', 'scatter'].map(type => (
            <button
              key={type}
              className={`px-2 py-1 rounded text-xs capitalize transition-colors ${currentConfig.chartType === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
                }`}
              onClick={() => handleConfigChange({ chartType: type })}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Data summary */}
      <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
        <details>
          <summary className="cursor-pointer font-medium">
            View Data ({currentConfig.data.length} points)
            {currentConfig.metadata?.dateRange && (
              <span className="ml-2 text-muted-foreground">
                ({currentConfig.metadata.dateRange.start}-{currentConfig.metadata.dateRange.end})
              </span>
            )}
          </summary>
          <div className="mt-2 space-y-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {currentConfig.data.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.label || item.x}:</span>
                  <span className="font-mono">{item.y.toLocaleString()}</span>
                </div>
              ))}
            </div>
            {currentConfig.metadata?.units && (
              <div className="mt-2 text-muted-foreground">
                Units: {currentConfig.metadata.units}
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}