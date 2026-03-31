import { describe, it, expect, vi } from 'vitest';
import { PumperlyTrigger } from '../nodes/Pumperly/PumperlyTrigger.node';

function createMockContext(
	params: Record<string, any>,
	staticData: Record<string, any>,
	httpResponse: any,
) {
	return {
		getNodeParameter: (name: string) => params[name] ?? '',
		getWorkflowStaticData: () => staticData,
		getCredentials: vi.fn().mockResolvedValue({ url: 'http://localhost' }),
		getNode: () => ({ name: 'PumperlyTrigger' }),
		helpers: {
			httpRequest: vi.fn().mockResolvedValue(httpResponse),
		},
	};
}

describe('PumperlyTrigger Node', () => {
	const trigger = new PumperlyTrigger();

	it('has polling: true', () => {
		expect(trigger.description.polling).toBe(true);
	});

	it('has a poll method', () => {
		expect(typeof trigger.poll).toBe('function');
	});

	it('first poll seeds state without emitting (returns null)', async () => {
		const staticData: Record<string, any> = {};
		const httpResponse = {
			totals: { stations: 100, prices: 500 },
			countries: [
				{ code: 'ES', name: 'Spain', stations: 50, prices: 250, lastUpdate: '2026-04-01T10:00:00Z' },
				{ code: 'DE', name: 'Germany', stations: 50, prices: 250, lastUpdate: '2026-04-01T09:00:00Z' },
			],
		};

		const ctx = createMockContext({ countryFilter: '' }, staticData, httpResponse);
		const result = await trigger.poll.call(ctx as any);

		expect(result).toBeNull();
		// State should be seeded with timestamps
		expect(staticData.lastTimestamps).toEqual({
			ES: '2026-04-01T10:00:00Z',
			DE: '2026-04-01T09:00:00Z',
		});
	});

	it('subsequent poll with changed timestamps emits events', async () => {
		const staticData: Record<string, any> = {
			lastTimestamps: {
				ES: '2026-04-01T10:00:00Z',
				DE: '2026-04-01T09:00:00Z',
			},
		};
		const httpResponse = {
			totals: { stations: 100, prices: 500 },
			countries: [
				{ code: 'ES', name: 'Spain', stations: 50, prices: 260, lastUpdate: '2026-04-01T11:00:00Z' },
				{ code: 'DE', name: 'Germany', stations: 50, prices: 250, lastUpdate: '2026-04-01T09:00:00Z' },
			],
		};

		const ctx = createMockContext({ countryFilter: '' }, staticData, httpResponse);
		const result = await trigger.poll.call(ctx as any);

		expect(result).not.toBeNull();
		expect(result).toHaveLength(1);
		expect(result![0]).toHaveLength(1);
		expect(result![0][0].json.country).toBe('ES');
		expect(result![0][0].json.lastUpdate).toBe('2026-04-01T11:00:00Z');
		expect(result![0][0].json.previousUpdate).toBe('2026-04-01T10:00:00Z');
	});

	it('does not emit when no timestamps changed', async () => {
		const staticData: Record<string, any> = {
			lastTimestamps: {
				ES: '2026-04-01T10:00:00Z',
			},
		};
		const httpResponse = {
			totals: { stations: 50, prices: 250 },
			countries: [
				{ code: 'ES', name: 'Spain', stations: 50, prices: 250, lastUpdate: '2026-04-01T10:00:00Z' },
			],
		};

		const ctx = createMockContext({ countryFilter: '' }, staticData, httpResponse);
		const result = await trigger.poll.call(ctx as any);

		expect(result).toBeNull();
	});
});
