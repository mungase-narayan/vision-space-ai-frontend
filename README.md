# PERSONA RAG BOT

## Development

```bash
npm i
npm run dev
```

## Maps Dashboard - 2D/3D Mapping with Trajectory Data

The Maps Dashboard provides both 2D and 3D mapping capabilities with trajectory visualization and drawing tools. You can upload custom trajectory data in JSON format and visualize it on either map type.

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

### Map Modes

**2D Map Mode:**
- Interactive Leaflet-based map with OpenStreetMap tiles
- Dark/light theme support with automatic tile switching
- Trajectory visualization with start/end markers
- Full drawing tools support (polygons and circles)
- Zoom, pan, and reset controls

**3D Globe Mode:**
- Cesium-powered 3D globe visualization
- Terrain and satellite imagery
- Advanced 3D trajectory plotting
- 3D drawing tools with polygon and circle support
- Camera controls and fly-to animations

### How to Use

1. Navigate to the Maps Dashboard
2. Use the 2D/3D toggle to switch between map modes
3. Click the "Upload Data" button to load custom trajectory data
4. Select a JSON file containing trajectory coordinates
5. The trajectory will be plotted on both 2D and 3D maps
6. Use drawing tools to create analysis areas
7. Use the "Clear Data" button to return to the default trajectory

### Features

**Trajectory Visualization:**
- **Real-time plotting**: Uploaded trajectories are immediately visualized on both maps
- **Visual distinction**: Uploaded data appears in cyan, default data in yellow
- **Auto-centering**: Views automatically center on the trajectory bounds
- **Start/end markers**: Clear indicators for trajectory beginning and end points

**Drawing Tools:**
- **Polygon drawing**: Click to add points, right-click to finish
- **Circle drawing**: Click for center, click again to set radius
- **Real-time feedback**: Visual indicators during drawing process
- **Cross-platform**: Works identically on both 2D and 3D maps

**User Experience:**
- **Theme integration**: Maps automatically adapt to light/dark themes
- **Chat feedback**: Success/error messages appear in the chat panel
- **Data validation**: Only valid coordinate arrays are accepted
- **Status indicators**: Real-time status of map mode, trajectory, and drawing state

**Controls:**
- **Zoom controls**: Zoom in/out buttons work for both map types
- **Reset view**: Return to trajectory bounds or default view
- **Fullscreen**: Toggle fullscreen mode for immersive experience
- **Clear functions**: Separate controls for clearing drawings and trajectory data

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
