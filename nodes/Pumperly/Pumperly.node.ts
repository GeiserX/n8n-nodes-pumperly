import type { INodeType, INodeTypeDescription } from 'n8n-workflow';

const fuelTypeOptions = [
	{ name: 'E5 (Gasoline 95)', value: 'E5' },
	{ name: 'E5 Premium', value: 'E5_PREMIUM' },
	{ name: 'E10 (Gasoline 95 E10)', value: 'E10' },
	{ name: 'E5 98 (Gasoline 98)', value: 'E5_98' },
	{ name: 'E98/E10', value: 'E98_E10' },
	{ name: 'B7 (Diesel)', value: 'B7' },
	{ name: 'B7 Premium (Diesel Premium)', value: 'B7_PREMIUM' },
	{ name: 'B10 (Diesel B10)', value: 'B10' },
	{ name: 'Agricultural Diesel', value: 'B_AGRICULTURAL' },
	{ name: 'HVO (Renewable Diesel)', value: 'HVO' },
	{ name: 'LPG (Autogas)', value: 'LPG' },
	{ name: 'CNG (Compressed Natural Gas)', value: 'CNG' },
	{ name: 'LNG (Liquefied Natural Gas)', value: 'LNG' },
	{ name: 'H2 (Hydrogen)', value: 'H2' },
	{ name: 'AdBlue', value: 'ADBLUE' },
	{ name: 'EV (Electric Vehicle Charging)', value: 'EV' },
];

export class Pumperly implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pumperly',
		name: 'pumperly',
		icon: 'file:pumperly.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Query real-time fuel and EV charging prices, find stations, and plan routes via Pumperly',
		defaults: {
			name: 'Pumperly',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pumperlyApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.url}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// ------ Resource ------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Station', value: 'station' },
					{ name: 'Route', value: 'route' },
					{ name: 'Stats', value: 'stats' },
					{ name: 'Config', value: 'config' },
					{ name: 'Exchange Rate', value: 'exchangeRate' },
					{ name: 'Geocode', value: 'geocode' },
				],
				default: 'station',
			},

			// ====== STATION operations ======
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['station'] } },
				options: [
					{
						name: 'Get by Area',
						value: 'getByArea',
						description: 'Get stations within a bounding box',
						action: 'Get stations by area',
						routing: {
							request: {
								method: 'GET',
								url: '/api/stations',
							},
						},
					},
					{
						name: 'Get Nearest',
						value: 'getNearest',
						description: 'Get nearest stations to a coordinate',
						action: 'Get nearest stations',
						routing: {
							request: {
								method: 'GET',
								url: '/api/stations/nearest',
							},
						},
					},
				],
				default: 'getByArea',
			},

			// --- Station > Get by Area params ---
			{
				displayName: 'Bounding Box',
				name: 'bbox',
				type: 'string',
				required: true,
				default: '',
				placeholder: '-3.8,40.3,-3.6,40.5',
				description: 'Comma-separated minLon,minLat,maxLon,maxLat',
				displayOptions: {
					show: { resource: ['station'], operation: ['getByArea'] },
				},
				routing: {
					send: { type: 'query', property: 'bbox' },
				},
			},
			{
				displayName: 'Fuel Type',
				name: 'fuel',
				type: 'options',
				required: true,
				options: fuelTypeOptions,
				default: 'E5',
				displayOptions: {
					show: { resource: ['station'], operation: ['getByArea'] },
				},
				routing: {
					send: { type: 'query', property: 'fuel' },
				},
			},

			// --- Station > Get Nearest params ---
			{
				displayName: 'Latitude',
				name: 'lat',
				type: 'number',
				required: true,
				default: 0,
				typeOptions: { numberPrecision: 6 },
				description: 'Latitude of the search center (-90 to 90)',
				displayOptions: {
					show: { resource: ['station'], operation: ['getNearest'] },
				},
				routing: {
					send: { type: 'query', property: 'lat' },
				},
			},
			{
				displayName: 'Longitude',
				name: 'lon',
				type: 'number',
				required: true,
				default: 0,
				typeOptions: { numberPrecision: 6 },
				description: 'Longitude of the search center (-180 to 180)',
				displayOptions: {
					show: { resource: ['station'], operation: ['getNearest'] },
				},
				routing: {
					send: { type: 'query', property: 'lon' },
				},
			},
			{
				displayName: 'Radius (km)',
				name: 'radius_km',
				type: 'number',
				required: true,
				default: 5,
				typeOptions: { minValue: 0.5, maxValue: 100, numberPrecision: 1 },
				description: 'Search radius in kilometers (0.5 - 100)',
				displayOptions: {
					show: { resource: ['station'], operation: ['getNearest'] },
				},
				routing: {
					send: { type: 'query', property: 'radius_km' },
				},
			},
			{
				displayName: 'Fuel Type',
				name: 'fuelNearest',
				type: 'options',
				required: true,
				options: fuelTypeOptions,
				default: 'E5',
				displayOptions: {
					show: { resource: ['station'], operation: ['getNearest'] },
				},
				routing: {
					send: { type: 'query', property: 'fuel' },
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 5,
				typeOptions: { minValue: 1, maxValue: 50 },
				description: 'Maximum number of stations to return (1 - 50)',
				displayOptions: {
					show: { resource: ['station'], operation: ['getNearest'] },
				},
				routing: {
					send: { type: 'query', property: 'limit' },
				},
			},

			// ====== ROUTE operations ======
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['route'] } },
				options: [
					{
						name: 'Calculate',
						value: 'calculate',
						description: 'Calculate a driving route between two points',
						action: 'Calculate a route',
						routing: {
							request: {
								method: 'POST',
								url: '/api/route',
							},
						},
					},
					{
						name: 'Get Stations Along Route',
						value: 'getStationsAlongRoute',
						description: 'Find fuel stations along a route geometry',
						action: 'Get stations along route',
						routing: {
							request: {
								method: 'POST',
								url: '/api/route-stations',
							},
						},
					},
				],
				default: 'calculate',
			},

			// --- Route > Calculate params ---
			{
				displayName: 'Origin',
				name: 'origin',
				type: 'string',
				required: true,
				default: '',
				placeholder: '-3.7038,40.4168',
				description: 'Origin coordinates as lon,lat (e.g. -3.7038,40.4168 for Madrid)',
				displayOptions: {
					show: { resource: ['route'], operation: ['calculate'] },
				},
				routing: {
					send: {
						type: 'body',
						property: 'origin',
						value: '={{ $parameter["origin"].split(",").map(Number) }}',
					},
				},
			},
			{
				displayName: 'Destination',
				name: 'destination',
				type: 'string',
				required: true,
				default: '',
				placeholder: '2.1734,41.3851',
				description: 'Destination coordinates as lon,lat (e.g. 2.1734,41.3851 for Barcelona)',
				displayOptions: {
					show: { resource: ['route'], operation: ['calculate'] },
				},
				routing: {
					send: {
						type: 'body',
						property: 'destination',
						value: '={{ $parameter["destination"].split(",").map(Number) }}',
					},
				},
			},
			{
				displayName: 'Waypoints',
				name: 'waypoints',
				type: 'string',
				default: '',
				placeholder: '-1.1307,37.9922;-0.4907,38.3452',
				description: 'Optional waypoints as semicolon-separated lon,lat pairs (max 5)',
				displayOptions: {
					show: { resource: ['route'], operation: ['calculate'] },
				},
				routing: {
					send: {
						type: 'body',
						property: 'waypoints',
						value: '={{ $parameter["waypoints"] ? $parameter["waypoints"].split(";").map(p => p.split(",").map(Number)) : undefined }}',
					},
				},
			},

			// --- Route > Get Stations Along Route params ---
			{
				displayName: 'Route Geometry (GeoJSON)',
				name: 'geometry',
				type: 'json',
				required: true,
				default: '{"type":"LineString","coordinates":[[-3.7038,40.4168],[-3.0,39.5],[2.1734,41.3851]]}',
				description: 'GeoJSON LineString geometry of the route (from the Calculate Route operation)',
				displayOptions: {
					show: { resource: ['route'], operation: ['getStationsAlongRoute'] },
				},
				routing: {
					send: {
						type: 'body',
						property: 'geometry',
					},
				},
			},
			{
				displayName: 'Fuel Type',
				name: 'fuelRoute',
				type: 'options',
				required: true,
				options: fuelTypeOptions,
				default: 'E5',
				displayOptions: {
					show: { resource: ['route'], operation: ['getStationsAlongRoute'] },
				},
				routing: {
					send: {
						type: 'body',
						property: 'fuel',
					},
				},
			},
			{
				displayName: 'Corridor Width (km)',
				name: 'corridorKm',
				type: 'number',
				default: 5,
				typeOptions: { minValue: 0.5, maxValue: 50, numberPrecision: 1 },
				description: 'Search corridor width on each side of the route in km (0.5 - 50)',
				displayOptions: {
					show: { resource: ['route'], operation: ['getStationsAlongRoute'] },
				},
				routing: {
					send: {
						type: 'body',
						property: 'corridorKm',
					},
				},
			},

			// ====== STATS operation ======
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['stats'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get station and price statistics per country',
						action: 'Get statistics',
						routing: {
							request: {
								method: 'GET',
								url: '/api/stats',
							},
						},
					},
				],
				default: 'get',
			},

			// ====== CONFIG operation ======
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['config'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get instance configuration (countries, defaults)',
						action: 'Get configuration',
						routing: {
							request: {
								method: 'GET',
								url: '/api/config',
							},
						},
					},
				],
				default: 'get',
			},

			// ====== EXCHANGE RATE operation ======
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['exchangeRate'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get current EUR-based exchange rates',
						action: 'Get exchange rates',
						routing: {
							request: {
								method: 'GET',
								url: '/api/exchange-rates',
							},
						},
					},
				],
				default: 'get',
			},

			// ====== GEOCODE operation ======
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['geocode'] } },
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search for a location by name',
						action: 'Search locations',
						routing: {
							request: {
								method: 'GET',
								url: '/api/geocode',
							},
						},
					},
				],
				default: 'search',
			},

			// --- Geocode > Search params ---
			{
				displayName: 'Query',
				name: 'q',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Madrid, Spain',
				description: 'Search query for location name',
				displayOptions: {
					show: { resource: ['geocode'], operation: ['search'] },
				},
				routing: {
					send: { type: 'query', property: 'q' },
				},
			},
			{
				displayName: 'Bias Latitude',
				name: 'biasLat',
				type: 'number',
				default: 0,
				typeOptions: { numberPrecision: 6 },
				description: 'Optional latitude to bias results towards',
				displayOptions: {
					show: { resource: ['geocode'], operation: ['search'] },
				},
				routing: {
					send: {
						type: 'query',
						property: 'lat',
						value: '={{ $parameter["biasLat"] || undefined }}',
					},
				},
			},
			{
				displayName: 'Bias Longitude',
				name: 'biasLon',
				type: 'number',
				default: 0,
				typeOptions: { numberPrecision: 6 },
				description: 'Optional longitude to bias results towards',
				displayOptions: {
					show: { resource: ['geocode'], operation: ['search'] },
				},
				routing: {
					send: {
						type: 'query',
						property: 'lon',
						value: '={{ $parameter["biasLon"] || undefined }}',
					},
				},
			},
		],
	};
}
