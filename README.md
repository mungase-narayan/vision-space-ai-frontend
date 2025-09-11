# PERSONA RAG BOT

## Development

```bash
npm i
npm run dev
```

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
