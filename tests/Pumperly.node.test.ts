import { describe, it, expect } from 'vitest';
import { Pumperly } from '../nodes/Pumperly/Pumperly.node';

describe('Pumperly Node', () => {
	const node = new Pumperly();
	const desc = node.description;

	it('has correct name and credentials', () => {
		expect(desc.name).toBe('pumperly');
		expect(desc.credentials).toEqual([{ name: 'pumperlyApi', required: true }]);
	});

	it('requestDefaults.baseURL references credentials.url', () => {
		expect(desc.requestDefaults?.baseURL).toBe('={{$credentials.url}}');
	});

	it('has 6 resources', () => {
		const resourceProp = desc.properties.find((p) => p.name === 'resource');
		expect(resourceProp).toBeDefined();
		const options = (resourceProp as any).options;
		expect(options).toHaveLength(6);
		const values = options.map((o: any) => o.value);
		expect(values).toEqual(['station', 'route', 'stats', 'config', 'exchangeRate', 'geocode']);
	});

	describe('Station - Get by Area', () => {
		it('uses GET /api/stations', () => {
			const operationProp = desc.properties.find(
				(p) =>
					p.name === 'operation' &&
					(p.displayOptions?.show?.resource as string[] | undefined)?.includes('station'),
			);
			const getByArea = (operationProp as any).options.find(
				(o: any) => o.value === 'getByArea',
			);
			expect(getByArea.routing.request.method).toBe('GET');
			expect(getByArea.routing.request.url).toBe('/api/stations');
		});

		it('has bbox and fuel params', () => {
			const bbox = desc.properties.find((p) => p.name === 'bbox');
			expect(bbox).toBeDefined();
			expect(bbox!.required).toBe(true);

			const fuel = desc.properties.find(
				(p) =>
					p.name === 'fuel' &&
					(p.displayOptions?.show?.operation as string[] | undefined)?.includes('getByArea'),
			);
			expect(fuel).toBeDefined();
		});
	});

	describe('Station - Get Nearest', () => {
		it('uses GET /api/stations/nearest', () => {
			const operationProp = desc.properties.find(
				(p) =>
					p.name === 'operation' &&
					(p.displayOptions?.show?.resource as string[] | undefined)?.includes('station'),
			);
			const getNearest = (operationProp as any).options.find(
				(o: any) => o.value === 'getNearest',
			);
			expect(getNearest.routing.request.method).toBe('GET');
			expect(getNearest.routing.request.url).toBe('/api/stations/nearest');
		});

		it('has lat, lon, radius_km, fuel, and limit params', () => {
			const lat = desc.properties.find((p) => p.name === 'lat');
			expect(lat).toBeDefined();
			expect(lat!.type).toBe('number');

			const lon = desc.properties.find((p) => p.name === 'lon');
			expect(lon).toBeDefined();
			expect(lon!.type).toBe('number');

			const radius = desc.properties.find((p) => p.name === 'radius_km');
			expect(radius).toBeDefined();
			expect(radius!.type).toBe('number');

			const fuelNearest = desc.properties.find((p) => p.name === 'fuelNearest');
			expect(fuelNearest).toBeDefined();

			const limit = desc.properties.find(
				(p) =>
					p.name === 'limit' &&
					(p.displayOptions?.show?.operation as string[] | undefined)?.includes('getNearest'),
			);
			expect(limit).toBeDefined();
		});
	});

	describe('Route - Calculate', () => {
		it('uses POST /api/route', () => {
			const operationProp = desc.properties.find(
				(p) =>
					p.name === 'operation' &&
					(p.displayOptions?.show?.resource as string[] | undefined)?.includes('route'),
			);
			const calculate = (operationProp as any).options.find(
				(o: any) => o.value === 'calculate',
			);
			expect(calculate.routing.request.method).toBe('POST');
			expect(calculate.routing.request.url).toBe('/api/route');
		});
	});

	describe('Fuel types', () => {
		it('has all 16 fuel types in the options', () => {
			const fuelProp = desc.properties.find(
				(p) =>
					p.name === 'fuel' &&
					(p.displayOptions?.show?.operation as string[] | undefined)?.includes('getByArea'),
			);
			const options = (fuelProp as any).options;
			const values: string[] = options.map((o: any) => o.value);
			expect(values).toContain('E5');
			expect(values).toContain('E5_PREMIUM');
			expect(values).toContain('E10');
			expect(values).toContain('E5_98');
			expect(values).toContain('E98_E10');
			expect(values).toContain('B7');
			expect(values).toContain('B7_PREMIUM');
			expect(values).toContain('B10');
			expect(values).toContain('B_AGRICULTURAL');
			expect(values).toContain('HVO');
			expect(values).toContain('LPG');
			expect(values).toContain('CNG');
			expect(values).toContain('LNG');
			expect(values).toContain('H2');
			expect(values).toContain('ADBLUE');
			expect(values).toContain('EV');
			expect(options).toHaveLength(16);
		});
	});
});
