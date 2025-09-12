import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Chart Configurator - Allows users to customize chart appearance and export
 */
export default function ChartConfigurator({
  chartData,
  onConfigChange,
  onExport,
  currentConfig
}) {
  const [config, setConfig] = useState({
    chartType: 'bar',
    title: 'Chart Title',
    xAxisTitle: 'X Axis',
    yAxisTitle: 'Y Axis',
    colorScheme: 'blue',
    showGrid: true,
    showLegend: false,
    height: 400,
    ...currentConfig
  });

  const [isOpen, setIsOpen] = useState(false);

  const colorSchemes = {
    blue: ['#3b82f6', '#1e40af', '#60a5fa'],
    green: ['#10b981', '#059669', '#34d399'],
    red: ['#ef4444', '#dc2626', '#f87171'],
    purple: ['#8b5cf6', '#7c3aed', '#a78bfa'],
    orange: ['#f59e0b', '#d97706', '#fbbf24'],
    teal: ['#06b6d4', '#0891b2', '#22d3ee']
  };

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleExportChart = async (format) => {
    try {
      if (onExport) {
        await onExport(format, config);
        toast.success(`Chart exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      toast.error('Failed to export chart');
    }
  };

  const copyChartConfig = async () => {
    try {
      const configJson = JSON.stringify(config, null, 2);
      await navigator.clipboard.writeText(configJson);
      toast.success('Chart configuration copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy configuration');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings size={14} />
          Configure Chart
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chart Configuration</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chart Type */}
          <div className="space-y-2">
            <Label htmlFor="chartType">Chart Type</Label>
            <Select
              value={config.chartType}
              onValueChange={(value) => handleConfigChange('chartType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Chart Title</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => handleConfigChange('title', e.target.value)}
              placeholder="Enter chart title"
            />
          </div>

          {/* Axis Titles */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="xAxis">X-Axis Title</Label>
              <Input
                id="xAxis"
                value={config.xAxisTitle}
                onChange={(e) => handleConfigChange('xAxisTitle', e.target.value)}
                placeholder="X-axis"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yAxis">Y-Axis Title</Label>
              <Input
                id="yAxis"
                value={config.yAxisTitle}
                onChange={(e) => handleConfigChange('yAxisTitle', e.target.value)}
                placeholder="Y-axis"
              />
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-2">
            <Label htmlFor="colorScheme">Color Scheme</Label>
            <Select
              value={config.colorScheme}
              onValueChange={(value) => handleConfigChange('colorScheme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(colorSchemes).map(scheme => (
                  <SelectItem key={scheme} value={scheme}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {colorSchemes[scheme].slice(0, 3).map((color, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="capitalize">{scheme}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height">Chart Height (px)</Label>
            <Input
              id="height"
              type="number"
              value={config.height}
              onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
              min="200"
              max="800"
              step="50"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Display Options</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.showGrid}
                  onChange={(e) => handleConfigChange('showGrid', e.target.checked)}
                  className="rounded"
                />
                Show Grid Lines
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.showLegend}
                  onChange={(e) => handleConfigChange('showLegend', e.target.checked)}
                  className="rounded"
                />
                Show Legend
              </label>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-2">
            <Label>Export Chart</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportChart('png')}
                className="flex-1"
              >
                <Download size={14} className="mr-1" />
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportChart('svg')}
                className="flex-1"
              >
                <Download size={14} className="mr-1" />
                SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyChartConfig}
                className="flex-1"
              >
                <Copy size={14} className="mr-1" />
                Config
              </Button>
            </div>
          </div>

          {/* Data Preview */}
          {chartData && (
            <div className="space-y-2">
              <Label>Data Preview</Label>
              <div className="p-2 bg-muted rounded text-xs max-h-32 overflow-y-auto">
                <div className="font-mono">
                  {chartData.data.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.label || item.x}:</span>
                      <span>{item.y.toLocaleString()}</span>
                    </div>
                  ))}
                  {chartData.data.length > 5 && (
                    <div className="text-muted-foreground">
                      ... and {chartData.data.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}