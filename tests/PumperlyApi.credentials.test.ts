import { describe, it, expect } from 'vitest';
import { PumperlyApi } from '../credentials/PumperlyApi.credentials';

describe('PumperlyApi Credentials', () => {
	const creds = new PumperlyApi();

	it('has the correct name', () => {
		expect(creds.name).toBe('pumperlyApi');
	});

	it('has the correct displayName', () => {
		expect(creds.displayName).toBe('Pumperly API');
	});

	it('has documentationUrl', () => {
		expect(creds.documentationUrl).toContain('n8n-nodes-pumperly');
	});

	it('has url property with correct defaults', () => {
		const urlProp = creds.properties.find((p) => p.name === 'url');
		expect(urlProp).toBeDefined();
		expect(urlProp!.type).toBe('string');
		expect(urlProp!.default).toBe('https://pumperly.com');
		expect(urlProp!.required).toBe(true);
	});

	it('uses generic authentication with empty properties', () => {
		expect(creds.authenticate).toBeDefined();
		expect(creds.authenticate.type).toBe('generic');
		expect((creds.authenticate as any).properties).toEqual({});
	});

	it('has credential test request to /api/config', () => {
		expect(creds.test).toBeDefined();
		expect(creds.test.request.url).toBe('/api/config');
		expect(creds.test.request.method).toBe('GET');
		expect(creds.test.request.baseURL).toBe('={{$credentials.url}}');
	});
});
