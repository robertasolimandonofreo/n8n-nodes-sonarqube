import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SonarQubeApi implements ICredentialType {
	name = 'sonarQubeApi';
	displayName = 'SonarQube API';
	documentationUrl = 'https://docs.sonarsource.com/sonarqube-cloud/advanced-setup/web-api';
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'SonarQube (Self-Hosted)',
					value: 'selfHosted',
				},
				{
					name: 'SonarCloud (SaaS)',
					value: 'sonarCloud',
				},
			],
			default: 'selfHosted',
			description: 'Choose between SonarQube self-hosted or SonarCloud',
		},
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: 'https://sonarcloud.io',
			displayOptions: {
				show: {
					environment: ['sonarCloud'],
				},
			},
			description: 'The URL of your SonarCloud instance',
		},
		{
			displayName: 'Organization',
			name: 'organization',
			type: 'string',
			default: '',
			placeholder: 'my-organization',
			displayOptions: {
				show: {
					environment: ['sonarCloud'],
				},
			},
			description: 'Your SonarCloud organization key (required for SonarCloud)',
			required: true,
		},
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: 'http://localhost:9000',
			placeholder: 'http://localhost:9000',
			displayOptions: {
				show: {
					environment: ['selfHosted'],
				},
			},
			description: 'The URL of your SonarQube server',
			required: true,
		},
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'squ_1234567890abcdef',
			description:
				'Personal Access Token for authentication. Generate one in your SonarQube/SonarCloud account settings under Security.',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.token}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.serverUrl}}',
			url: '/api/users/current',
			method: 'GET',
		},
	};
}
