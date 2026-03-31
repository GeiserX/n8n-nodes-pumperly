import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PumperlyApi implements ICredentialType {
	name = 'pumperlyApi';
	displayName = 'Pumperly API';
	documentationUrl = 'https://github.com/GeiserX/n8n-nodes-pumperly';

	properties: INodeProperties[] = [
		{
			displayName: 'URL',
			name: 'url',
			type: 'string',
			default: 'https://pumperly.com',
			placeholder: 'https://pumperly.com',
			hint: 'Self-hosted instance URL or https://pumperly.com',
			required: true,
		},
	];

	// No authentication needed — public API, but we use GenericAuth
	// with an empty header so n8n wires up the credential correctly.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: '/api/config',
			method: 'GET',
		},
	};
}
