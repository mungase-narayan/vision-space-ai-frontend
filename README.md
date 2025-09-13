# PERSONA RAG BOT

## Development

```bash
npm i
npm run dev
```

## Maps Dashboard - Trajectory Data Upload

The Maps Dashboard now supports uploading custom trajectory data in JSON format. This allows you to visualize your own coordinate data on the 3D globe instead of using the default ARGO float trajectory.

### JSON Format

Upload a JSON file containing an array of coordinate pairs in the format `[longitude, latitude]`:

```json
[
  [-9.857, 55.953],
  [-9.925, 55.695],
  [-10.024, 55.666],
  [-9.986, 55.492]
]
```

### How to Use

1. Navigate to the Maps Dashboard
2. Switch to 3D mode using the 2D/3D toggle
3. Click the "Upload Data" button in the top-right corner
4. Select a JSON file containing trajectory coordinates
5. The trajectory will be plotted on the globe with a cyan color
6. Use the "Clear Data" button to return to the default trajectory

### Features

- **Real-time plotting**: Uploaded trajectories are immediately visualized
- **Visual distinction**: Uploaded data appears in cyan, default data in yellow
- **Camera positioning**: The view automatically centers on the trajectory
- **Chat feedback**: Success/error messages appear in the chat panel
- **Data validation**: Only valid coordinate arrays are accepted

A sample trajectory file (`sample-trajectory.json`) is included in the project root for testing.

## Rendering charts from AI responses

Code blocks in AI messages with languages `plotly`, `chartjs`, or `d3` will render interactive charts. Provide a JSON spec inside the code block.

Examples

Plotly

```plotly
{
  "data": [
    { "type": "bar", "x": ["A", "B", "C"], "y": [10, 20, 15] }
  ],
  "layout": { "title": "Plotly Bar" }
}
```

Chart.js

```chartjs
{
  "type": "line",
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "datasets": [
      { "label": "Sales", "data": [12, 19, 7], "borderColor": "#3b82f6" }
    ]
  },
  "options": { "responsive": true }
}
```

D3 (bar/line)

```d3
{
  "type": "bar",
  "data": [
    { "x": "A", "y": 10 },
    { "x": "B", "y": 20 },
    { "x": "C", "y": 15 }
  ],
  "width": 600,
  "height": 400
}
```

Notes

- `plotly`: pass `data`, `layout`, `config` as in Plotly.
- `chartjs`: pass `type`, `data`, `options` compatible with Chart.js.
- `d3`: supports `bar` and `line` with `data` array of `{x, y}`.
