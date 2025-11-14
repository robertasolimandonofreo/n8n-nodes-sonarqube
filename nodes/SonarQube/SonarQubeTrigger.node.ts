import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';

import * as crypto from 'crypto';

export class SonarQubeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SonarQube Trigger',
		name: 'sonarQubeTrigger',
		icon: 'file:sonarqube.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers workflow when SonarQube/SonarCloud events occur',
		defaults: {
			name: 'SonarQube Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'sonarQubeApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Analysis Completed',
						value: 'analysisCompleted',
						description: 'Trigger when a project analysis is completed',
					},
					{
						name: 'Quality Gate Changed',
						value: 'qualityGateChanged',
						description: 'Trigger when quality gate status changes',
					},
				],
				default: 'analysisCompleted',
				description: 'The event to listen for',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				options: [
					{
						displayName: 'Project Keys',
						name: 'projectKeys',
						type: 'string',
						default: '',
						placeholder: 'project1,project2',
						description:
							'Comma-separated list of project keys to filter. Leave empty for all projects.',
					},
					{
						displayName: 'Quality Gate Status',
						name: 'qualityGateStatus',
						type: 'multiOptions',
						options: [
							{
								name: 'Error',
								value: 'ERROR',
							},
							{
								name: 'OK',
								value: 'OK',
							},
						],
						default: [],
						description: 'Filter by quality gate status. Leave empty for all statuses.',
					},
					{
						displayName: 'Task Status',
						name: 'taskStatus',
						type: 'multiOptions',
						options: [
							{
								name: 'Failure',
								value: 'FAILURE',
							},
							{
								name: 'Success',
								value: 'SUCCESS',
							},
						],
						default: [],
						description: 'Filter by analysis task status. Leave empty for all statuses.',
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Webhook Secret',
						name: 'webhookSecret',
						type: 'string',
						typeOptions: {
							password: true,
						},
						default: '',
						description:
							'Secret for HMAC-SHA256 signature validation. Must match the secret configured in SonarQube webhook.',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const headers = this.getHeaderData() as IDataObject;
		const event = this.getNodeParameter('event') as string;
		const filters = this.getNodeParameter('filters', {}) as IDataObject;
		const options = this.getNodeParameter('options', {}) as IDataObject;

		// Validate HMAC signature if secret is configured
		if (options.webhookSecret) {
			const signature = headers['x-sonar-webhook-hmac-sha256'] as string;
			if (!signature) {
				return {
					workflowData: [[]],
				};
			}

			const bodyString = JSON.stringify(body);
			const hmac = crypto.createHmac('sha256', options.webhookSecret as string);
			hmac.update(bodyString);
			const calculatedSignature = hmac.digest('hex');

			if (signature !== calculatedSignature) {
				return {
					workflowData: [[]],
				};
			}
		}

		// Filter by project keys
		if (filters.projectKeys) {
			const projectKeys = (filters.projectKeys as string)
				.split(',')
				.map((k) => k.trim())
				.filter((k) => k);
			const projectKey = (body.project as IDataObject)?.key as string;

			if (projectKeys.length > 0 && !projectKeys.includes(projectKey)) {
				return {
					workflowData: [[]],
				};
			}
		}

		// Filter by task status
		if (
			filters.taskStatus &&
			Array.isArray(filters.taskStatus) &&
			(filters.taskStatus as string[]).length > 0
		) {
			const taskStatus = body.status as string;
			if (!(filters.taskStatus as string[]).includes(taskStatus)) {
				return {
					workflowData: [[]],
				};
			}
		}

		// Filter by quality gate status
		if (
			filters.qualityGateStatus &&
			Array.isArray(filters.qualityGateStatus) &&
			(filters.qualityGateStatus as string[]).length > 0
		) {
			const qualityGateStatus = (body.qualityGate as IDataObject)?.status as string;
			if (!(filters.qualityGateStatus as string[]).includes(qualityGateStatus)) {
				return {
					workflowData: [[]],
				};
			}
		}

		// Event-specific filtering
		if (event === 'qualityGateChanged') {
			// For quality gate changed events, we need to track previous state
			// For now, we'll trigger on all quality gate status changes
			// In a production implementation, you might want to store previous states
		}

		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
