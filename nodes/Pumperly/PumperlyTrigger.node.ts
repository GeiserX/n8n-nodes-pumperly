import type {
	IPollFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

interface CountryStats {
	code: string;
	name: string;
	stations: number;
	prices: number;
	lastUpdate: string | null;
}

interface StatsResponse {
	totals: { stations: number; prices: number };
	countries: CountryStats[];
}

export class PumperlyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pumperly Trigger',
		name: 'pumperlyTrigger',
		icon: 'file:pumperly.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '=Price Data Updated',
		description: 'Triggers when Pumperly price data is updated for a country',
		defaults: {
			name: 'Pumperly Trigger',
		},
		polling: true,
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'pumperlyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Country Filter',
				name: 'countryFilter',
				type: 'string',
				default: '',
				placeholder: 'ES,DE,FR',
				description:
					'Optional comma-separated country codes to watch (e.g. ES,DE,FR). Leave empty to trigger for any country update.',
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const credentials = await this.getCredentials('pumperlyApi');
		const baseUrl = (credentials.url as string).replace(/\/+$/, '');
		const countryFilter = (this.getNodeParameter('countryFilter', '') as string)
			.split(',')
			.map((c) => c.trim().toUpperCase())
			.filter(Boolean);

		// Fetch current stats
		const response = await this.helpers.httpRequest({
			method: 'GET',
			url: `${baseUrl}/api/stats`,
			json: true,
		});

		const stats = response as StatsResponse;

		if (!stats?.countries) {
			throw new NodeApiError(this.getNode(), { message: 'Invalid response from /api/stats' });
		}

		// Get stored timestamps from previous poll
		const storedData = this.getWorkflowStaticData('node');
		const lastTimestamps = (storedData.lastTimestamps as Record<string, string>) ?? {};

		const updatedCountries: INodeExecutionData[] = [];

		for (const country of stats.countries) {
			// Skip if filter is set and country not in filter
			if (countryFilter.length > 0 && !countryFilter.includes(country.code)) {
				continue;
			}

			const currentUpdate = country.lastUpdate;
			const previousUpdate = lastTimestamps[country.code];

			// Trigger if: we have a timestamp, and it differs from stored
			if (currentUpdate && currentUpdate !== previousUpdate) {
				updatedCountries.push({
					json: {
						country: country.code,
						countryName: country.name,
						stations: country.stations,
						prices: country.prices,
						lastUpdate: currentUpdate,
						previousUpdate: previousUpdate ?? null,
					},
				});
			}

			// Update stored timestamp
			if (currentUpdate) {
				lastTimestamps[country.code] = currentUpdate;
			}
		}

		// Persist timestamps for next poll
		storedData.lastTimestamps = lastTimestamps;

		if (updatedCountries.length === 0) {
			return null;
		}

		return [updatedCountries];
	}
}
