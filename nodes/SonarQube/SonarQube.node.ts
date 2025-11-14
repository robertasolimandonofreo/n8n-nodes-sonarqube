import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';

export class SonarQube implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SonarQube',
		name: 'sonarQube',
		icon: 'file:sonarqube.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume SonarQube and SonarCloud Web API',
		defaults: {
			name: 'SonarQube',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'sonarQubeApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.serverUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Issue',
						value: 'issue',
					},
					{
						name: 'Measure',
						value: 'measure',
					},
					{
						name: 'Project',
						value: 'project',
					},
					{
						name: 'Quality Gate',
						value: 'qualityGate',
					},
				],
				default: 'project',
			},

			// PROJECT OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['project'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many projects',
						action: 'Get many projects',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search projects',
						action: 'Search projects',
					},
				],
				default: 'getAll',
			},

			// MEASURE OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['measure'],
					},
				},
				options: [
					{
						name: 'Get Component',
						value: 'getComponent',
						description: 'Get measures for a component',
						action: 'Get component measures',
					},
					{
						name: 'Search History',
						value: 'searchHistory',
						description: 'Search measures history',
						action: 'Search measures history',
					},
				],
				default: 'getComponent',
			},

			// ISSUE OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['issue'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many issues',
						action: 'Get many issues',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search issues',
						action: 'Search issues',
					},
				],
				default: 'search',
			},

			// QUALITY GATE OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['qualityGate'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many quality gates',
						action: 'Get many quality gates',
					},
					{
						name: 'Get Project Status',
						value: 'getProjectStatus',
						description: 'Get quality gate status for a project',
						action: 'Get project quality gate status',
					},
				],
				default: 'getAll',
			},

			// PROJECT FIELDS
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['project'],
						operation: ['getAll', 'search'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['project'],
						operation: ['getAll', 'search'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['project'],
						operation: ['getAll', 'search'],
					},
				},
				options: [
					{
						displayName: 'Query',
						name: 'q',
						type: 'string',
						default: '',
						description: 'Limit search to project names that contain the supplied string',
					},
					{
						displayName: 'Qualifiers',
						name: 'qualifiers',
						type: 'string',
						default: 'TRK',
						description: 'Comma-separated list of component qualifiers. TRK for projects.',
					},
					{
						displayName: 'Organization',
						name: 'organization',
						type: 'string',
						default: '',
						description: 'Organization key (SonarCloud only)',
					},
				],
			},

			// MEASURE FIELDS
			{
				displayName: 'Component Key',
				name: 'component',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['measure'],
						operation: ['getComponent', 'searchHistory'],
					},
				},
				default: '',
				placeholder: 'my-project-key',
				description: 'Component key (project key)',
			},
			{
				displayName: 'Metric Key Names or IDs',
				name: 'metricKeys',
				type: 'multiOptions',
				required: true,
				displayOptions: {
					show: {
						resource: ['measure'],
						operation: ['getComponent'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getMetrics',
				},
				default: [],
				description:
					'Comma-separated list of metric keys. Choose from the list or specify IDs. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Metric Key Names or IDs',
				name: 'metricKeys',
				type: 'multiOptions',
				required: true,
				displayOptions: {
					show: {
						resource: ['measure'],
						operation: ['searchHistory'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getMetrics',
				},
				default: [],
				description:
					'Comma-separated list of metric keys (max 15). Choose from the list or specify IDs. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['measure'],
						operation: ['getComponent'],
					},
				},
				options: [
					{
						displayName: 'Branch',
						name: 'branch',
						type: 'string',
						default: '',
						description: 'Branch name',
					},
					{
						displayName: 'Pull Request',
						name: 'pullRequest',
						type: 'string',
						default: '',
						description: 'Pull request ID',
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['measure'],
						operation: ['searchHistory'],
					},
				},
				options: [
					{
						displayName: 'Branch',
						name: 'branch',
						type: 'string',
						default: '',
						description: 'Branch name',
					},
					{
						displayName: 'From',
						name: 'from',
						type: 'string',
						default: '',
						placeholder: '2023-01-01',
						description: 'Filter measures created after the given date (inclusive)',
					},
					{
						displayName: 'To',
						name: 'to',
						type: 'string',
						default: '',
						placeholder: '2023-12-31',
						description: 'Filter measures created before the given date (inclusive)',
					},
				],
			},

			// ISSUE FIELDS
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['issue'],
						operation: ['getAll', 'search'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['issue'],
						operation: ['getAll', 'search'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['issue'],
						operation: ['getAll', 'search'],
					},
				},
				options: [
					{
						displayName: 'Branch',
						name: 'branch',
						type: 'string',
						default: '',
						description: 'Branch name',
					},
					{
						displayName: 'Component Keys',
						name: 'componentKeys',
						type: 'string',
						default: '',
						placeholder: 'my-project-key',
						description: 'Comma-separated list of component keys',
					},
					{
						displayName: 'Organization',
						name: 'organization',
						type: 'string',
						default: '',
						description: 'Organization key (SonarCloud only)',
					},
					{
						displayName: 'Pull Request',
						name: 'pullRequest',
						type: 'string',
						default: '',
						description: 'Pull request ID',
					},
					{
						displayName: 'Resolved',
						name: 'resolved',
						type: 'boolean',
						default: false,
						description: 'Whether to include resolved issues',
					},
					{
						displayName: 'Severities',
						name: 'severities',
						type: 'multiOptions',
						options: [
							{
								name: 'Blocker',
								value: 'BLOCKER',
							},
							{
								name: 'Critical',
								value: 'CRITICAL',
							},
							{
								name: 'Info',
								value: 'INFO',
							},
							{
								name: 'Major',
								value: 'MAJOR',
							},
							{
								name: 'Minor',
								value: 'MINOR',
							},
						],
						default: [],
						description: 'Comma-separated list of severities',
					},
					{
						displayName: 'Statuses',
						name: 'statuses',
						type: 'multiOptions',
						options: [
							{
								name: 'Closed',
								value: 'CLOSED',
							},
							{
								name: 'Confirmed',
								value: 'CONFIRMED',
							},
							{
								name: 'Open',
								value: 'OPEN',
							},
							{
								name: 'Reopened',
								value: 'REOPENED',
							},
							{
								name: 'Resolved',
								value: 'RESOLVED',
							},
						],
						default: [],
						description: 'Comma-separated list of statuses',
					},
					{
						displayName: 'Types',
						name: 'types',
						type: 'multiOptions',
						options: [
							{
								name: 'Bug',
								value: 'BUG',
							},
							{
								name: 'Code Smell',
								value: 'CODE_SMELL',
							},
							{
								name: 'Security Hotspot',
								value: 'SECURITY_HOTSPOT',
							},
							{
								name: 'Vulnerability',
								value: 'VULNERABILITY',
							},
						],
						default: [],
						description: 'Types of issues to search for',
					},
				],
			},

			// QUALITY GATE FIELDS
			{
				displayName: 'Project Key',
				name: 'projectKey',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['qualityGate'],
						operation: ['getProjectStatus'],
					},
				},
				default: '',
				placeholder: 'my-project-key',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['qualityGate'],
						operation: ['getProjectStatus'],
					},
				},
				options: [
					{
						displayName: 'Branch',
						name: 'branch',
						type: 'string',
						default: '',
						description: 'Branch name',
					},
					{
						displayName: 'Pull Request',
						name: 'pullRequest',
						type: 'string',
						default: '',
						description: 'Pull request ID',
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['qualityGate'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Organization',
						name: 'organization',
						type: 'string',
						default: '',
						description: 'Organization key (SonarCloud only)',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getMetrics(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const credentials = await this.getCredentials('sonarQubeApi');
				const baseURL = credentials.serverUrl as string;
				const organization = credentials.organization as string | undefined;

				const qs: IDataObject = {
					ps: 500,
				};

				// Add organization from credentials if available (SonarCloud)
				if (organization) {
					qs.organization = organization;
				}

				const metrics = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'sonarQubeApi',
					{
						method: 'GET',
						baseURL,
						url: '/api/metrics/search',
						qs,
					},
				);

				if (metrics.metrics) {
					for (const metric of metrics.metrics) {
						returnData.push({
							name: `${metric.name} (${metric.key})`,
							value: metric.key,
							description: metric.description || metric.name,
						});
					}
				}

				return returnData.sort((a, b) => a.name.localeCompare(b.name));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		const credentials = await this.getCredentials('sonarQubeApi');
		const baseURL = credentials.serverUrl as string;
		const organization = credentials.organization as string | undefined;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'project') {
					if (operation === 'getAll' || operation === 'search') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const additionalFields = this.getNodeParameter('additionalFields', i, {});

						const qs: IDataObject = {
							ps: 100,
							...additionalFields,
						};

						// Add organization from credentials if available (SonarCloud)
						if (organization && !qs.organization) {
							qs.organization = organization;
						}

						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i);
							qs.ps = limit;
						}

						let response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sonarQubeApi',
							{
								method: 'GET',
								baseURL,
								url: '/api/projects/search',
								qs,
							},
						);

						if (returnAll) {
							let hasMore = response.paging.total > response.paging.pageSize;
							returnData.push(...response.components);

							while (hasMore) {
								qs.p = ((qs.p as number) || 1) + 1;
								response = await this.helpers.httpRequestWithAuthentication.call(
									this,
									'sonarQubeApi',
									{
										method: 'GET',
										baseURL,
										url: '/api/projects/search',
										qs,
									},
								);
								returnData.push(...response.components);
								hasMore =
									response.paging.pageIndex * response.paging.pageSize < response.paging.total;
							}
						} else {
							returnData.push(...response.components);
						}
					}
				} else if (resource === 'measure') {
					if (operation === 'getComponent') {
						const component = this.getNodeParameter('component', i) as string;
						const metricKeys = this.getNodeParameter('metricKeys', i) as string[];
						const additionalFields = this.getNodeParameter('additionalFields', i, {});

						const qs: IDataObject = {
							component,
							metricKeys: metricKeys.join(','),
							...additionalFields,
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sonarQubeApi',
							{
								method: 'GET',
								baseURL,
								url: '/api/measures/component',
								qs,
							},
						);

						returnData.push(response);
					} else if (operation === 'searchHistory') {
						const component = this.getNodeParameter('component', i) as string;
						const metricKeys = this.getNodeParameter('metricKeys', i) as string[];
						const additionalFields = this.getNodeParameter('additionalFields', i, {});

						const qs: IDataObject = {
							component,
							metrics: metricKeys.join(','),
							ps: 1000,
							...additionalFields,
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sonarQubeApi',
							{
								method: 'GET',
								baseURL,
								url: '/api/measures/search_history',
								qs,
							},
						);

						returnData.push(response);
					}
				} else if (resource === 'issue') {
					if (operation === 'getAll' || operation === 'search') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i, {});

						const qs: IDataObject = {
							ps: 100,
						};

						if (filters.componentKeys) {
							qs.componentKeys = filters.componentKeys;
						}
						if (filters.types && (filters.types as string[]).length > 0) {
							qs.types = (filters.types as string[]).join(',');
						}
						if (filters.severities && (filters.severities as string[]).length > 0) {
							qs.severities = (filters.severities as string[]).join(',');
						}
						if (filters.statuses && (filters.statuses as string[]).length > 0) {
							qs.statuses = (filters.statuses as string[]).join(',');
						}
						if (filters.resolved !== undefined) {
							qs.resolved = filters.resolved;
						}
						if (filters.branch) {
							qs.branch = filters.branch;
						}
						if (filters.pullRequest) {
							qs.pullRequest = filters.pullRequest;
						}
						if (filters.organization) {
							qs.organization = filters.organization;
						}

						// Add organization from credentials if available (SonarCloud) and not already set
						if (organization && !qs.organization) {
							qs.organization = organization;
						}

						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i);
							qs.ps = limit;
						}

						let response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sonarQubeApi',
							{
								method: 'GET',
								baseURL,
								url: '/api/issues/search',
								qs,
							},
						);

						if (returnAll) {
							let hasMore = response.paging.total > response.paging.pageSize;
							returnData.push(...response.issues);

							while (hasMore) {
								qs.p = ((qs.p as number) || 1) + 1;
								response = await this.helpers.httpRequestWithAuthentication.call(
									this,
									'sonarQubeApi',
									{
										method: 'GET',
										baseURL,
										url: '/api/issues/search',
										qs,
									},
								);
								returnData.push(...response.issues);
								hasMore =
									response.paging.pageIndex * response.paging.pageSize < response.paging.total;
							}
						} else {
							returnData.push(...response.issues);
						}
					}
				} else if (resource === 'qualityGate') {
					if (operation === 'getAll') {
						const additionalFields = this.getNodeParameter('additionalFields', i, {});

						const qs: IDataObject = {};

						if (additionalFields.organization) {
							qs.organization = additionalFields.organization;
						}

						// Add organization from credentials if available (SonarCloud) and not already set
						if (organization && !qs.organization) {
							qs.organization = organization;
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sonarQubeApi',
							{
								method: 'GET',
								baseURL,
								url: '/api/qualitygates/list',
								qs,
							},
						);

						if (response.qualitygates) {
							returnData.push(...response.qualitygates);
						}
					} else if (operation === 'getProjectStatus') {
						const projectKey = this.getNodeParameter('projectKey', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {});

						const qs: IDataObject = {
							projectKey,
							...additionalFields,
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sonarQubeApi',
							{
								method: 'GET',
								baseURL,
								url: '/api/qualitygates/project_status',
								qs,
							},
						);

						returnData.push(response.projectStatus);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: (error as Error).message });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex: i,
				});
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
