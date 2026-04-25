<p align="center">
  <img src="docs/images/banner.svg" alt="n8n-nodes-pumperly banner" width="900"/>
</p>

<p align="center">
  <a href="https://codecov.io/gh/GeiserX/n8n-nodes-pumperly"><img src="https://codecov.io/gh/GeiserX/n8n-nodes-pumperly/graph/badge.svg" alt="codecov"></a>
</p>

# n8n-nodes-pumperly

n8n community node for [Pumperly](https://pumperly.com) — real-time fuel and EV charging price data, station search, and route planning.

Works with the public instance at `https://pumperly.com` or any self-hosted Pumperly deployment.

## Operations

### Station
- **Get by Area** — Query stations within a geographic bounding box
- **Get Nearest** — Find the closest stations to a given coordinate

### Route
- **Calculate** — Compute a driving route between origin and destination (with optional waypoints)
- **Get Stations Along Route** — Find fuel/EV stations within a corridor along a route geometry

### Stats
- **Get** — Retrieve station and price statistics per country

### Config
- **Get** — Retrieve instance configuration (enabled countries, default fuel type, map center)

### Exchange Rate
- **Get** — Retrieve current EUR-based exchange rates (ECB data)

### Geocode
- **Search** — Search for a location by name (with optional coordinate bias)

### Trigger
- **Price Data Updated** — Polls for updated price data and triggers when a country's data has been refreshed. Supports optional country code filtering.

## Credentials

This node connects to the Pumperly public API which requires no authentication. The credential only stores the instance URL:

| Field | Default | Description |
|-------|---------|-------------|
| URL | `https://pumperly.com` | Base URL of the Pumperly instance |

## Fuel Types

| Value | Description |
|-------|-------------|
| `E5` | Gasoline 95 |
| `E5_PREMIUM` | Premium Gasoline 95 |
| `E10` | Gasoline 95 E10 |
| `E5_98` | Gasoline 98 |
| `E98_E10` | Gasoline 98 E10 |
| `B7` | Diesel |
| `B7_PREMIUM` | Premium Diesel |
| `B10` | Diesel B10 |
| `B_AGRICULTURAL` | Agricultural Diesel |
| `HVO` | Renewable Diesel (HVO) |
| `LPG` | Autogas (LPG) |
| `CNG` | Compressed Natural Gas |
| `LNG` | Liquefied Natural Gas |
| `H2` | Hydrogen |
| `ADBLUE` | AdBlue |
| `EV` | Electric Vehicle Charging |

## Other n8n Community Nodes by GeiserX

- [n8n-nodes-cashpilot](https://github.com/GeiserX/n8n-nodes-cashpilot) — Passive income monitoring
- [n8n-nodes-genieacs](https://github.com/GeiserX/n8n-nodes-genieacs) — TR-069 device management
- [n8n-nodes-lynxprompt](https://github.com/GeiserX/n8n-nodes-lynxprompt) — AI configuration blueprints
- [n8n-nodes-telegram-archive](https://github.com/GeiserX/n8n-nodes-telegram-archive) — Telegram message archive
- [n8n-nodes-way-cms](https://github.com/GeiserX/n8n-nodes-way-cms) — Web archive content management


## Related Projects

| Project | Description |
|---------|-------------|
| [Pumperly](https://github.com/GeiserX/Pumperly) | Open-source fuel and EV route planner with real-time prices |
| [Pumperly-android](https://github.com/GeiserX/Pumperly-android) | Official Android app for Pumperly fuel and EV route planner |
| [pumperly-ha](https://github.com/GeiserX/pumperly-ha) | Home Assistant custom integration for Pumperly fuel and EV charging prices |
| [pumperly-mcp](https://github.com/GeiserX/pumperly-mcp) | MCP Server for Pumperly real-time fuel and EV charging prices |

## License

[GPL-3.0](LICENSE)
