# n8n-nodes-sonarqube

This is an n8n community node that lets you interact with SonarQube and SonarCloud in your n8n workflows.

[SonarQube](https://www.sonarsource.com/products/sonarqube/) and [SonarCloud](https://www.sonarsource.com/products/sonarcloud/) are platforms for continuous inspection of code quality. They perform automatic reviews with static analysis of code to detect bugs, code smells, and security vulnerabilities.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform.

## Table of Contents

- [Installation](#installation)
- [Credentials](#credentials)
- [Supported Resources](#supported-resources)
- [Usage Examples](#usage-examples)
- [API Endpoints Used](#api-endpoints-used)
- [Development](#development)
  - [Running Locally](#running-locally)
  - [Testing](#testing)
  - [Linting](#linting)
  - [Building](#building)
  - [Publishing](#publishing)
- [Requirements](#requirements)
- [Compatibility](#compatibility)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Node Installation

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-sonarqube` in the **Enter npm package name** field
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes
5. Select **Install**

### Manual Installation

To install the node manually:

```bash
npm install n8n-nodes-sonarqube
```

For Docker installations, refer to the [npm package installation guide](https://docs.n8n.io/integrations/community-nodes/installation/gui-install/).

## Credentials

### SonarQube API Credentials

You need to create credentials in n8n to authenticate with SonarQube or SonarCloud:

1. **Environment**: Choose between:
   - **SonarQube (Self-Hosted)**: Your own SonarQube server
   - **SonarCloud (SaaS)**: Cloud-hosted service

2. **Server URL**:
   - For SonarQube self-hosted: Your server URL (e.g., `http://localhost:9000` or `https://sonarqube.yourcompany.com`)
   - For SonarCloud: Default is `https://sonarcloud.io`

3. **Token**: Personal Access Token for authentication
   - **SonarQube**: Go to User > My Account > Security > Generate Token
   - **SonarCloud**: Go to Account > Security > Generate Token

The token should look like: `squ_1234567890abcdef` (SonarQube) or similar format.

### Generating Tokens

#### SonarQube (Self-Hosted)

1. Log in to your SonarQube instance
2. Click on your avatar in the top-right corner
3. Go to **My Account**
4. Select the **Security** tab
5. Enter a token name under **Generate Tokens**
6. Click **Generate**
7. Copy the token immediately (it won't be shown again)

#### SonarCloud

1. Log in to [SonarCloud](https://sonarcloud.io)
2. Click on your avatar in the top-right corner
3. Go to **My Account**
4. Select the **Security** tab
5. Enter a token name under **Generate Tokens**
6. Click **Generate**
7. Copy the token immediately (it won't be shown again)

## Supported Resources

This node supports the following resources and operations:

### Project

- **Get Many**: Retrieve a list of projects
- **Search**: Search for projects with filters

### Measure

- **Get Component**: Get measures (metrics) for a specific component/project
- **Search History**: Search historical measure data for a component

### Issue

- **Get Many**: Retrieve a list of issues
- **Search**: Search for issues with various filters including:
  - Types: Bugs, Vulnerabilities, Code Smells, Security Hotspots
  - Severities: Blocker, Critical, Major, Minor, Info
  - Statuses: Open, Confirmed, Reopened, Resolved, Closed
  - Component keys (project keys)
  - Branch and Pull Request filtering

### Quality Gate

- **Get Many**: List all available quality gates
- **Get Project Status**: Get the quality gate status for a specific project

## Usage Examples

### Example 1: Get All Projects

1. Add the SonarQube node to your workflow
2. Select **Project** as the resource
3. Select **Get Many** as the operation
4. Configure **Return All** to `true` to fetch all projects
5. Execute the node

### Example 2: Get Code Metrics for a Project

1. Add the SonarQube node
2. Select **Measure** as the resource
3. Select **Get Component** as the operation
4. Enter your project key (e.g., `my-project-key`)
5. Select metrics like:
   - `ncloc` (Lines of Code)
   - `bugs` (Number of Bugs)
   - `vulnerabilities` (Number of Vulnerabilities)
   - `code_smells` (Number of Code Smells)
   - `coverage` (Test Coverage)
   - `duplicated_lines_density` (Code Duplication)
6. Execute the node

### Example 3: Search for Critical Bugs

1. Add the SonarQube node
2. Select **Issue** as the resource
3. Select **Search** as the operation
4. In **Filters**:
   - Set **Component Keys** to your project key
   - Set **Types** to `Bug`
   - Set **Severities** to `Critical` and `Blocker`
   - Set **Statuses** to `Open`
5. Execute the node

### Example 4: Check Quality Gate Status

1. Add the SonarQube node
2. Select **Quality Gate** as the resource
3. Select **Get Project Status** as the operation
4. Enter your **Project Key**
5. (Optional) Add **Branch** name in Additional Fields
6. Execute the node

### Example Workflow: Monitor Code Quality

Create a workflow that:

1. **Schedule Trigger** - Runs daily
2. **SonarQube: Get Projects** - Gets all projects
3. **Split In Batches** - Processes projects one by one
4. **SonarQube: Get Component Measures** - Gets metrics for each project
5. **SonarQube: Get Project Quality Gate Status** - Checks quality gate
6. **IF** - Checks if quality gate failed
7. **Send Email/Slack** - Notifies team if quality gate failed

## API Endpoints Used

This node uses the following SonarQube/SonarCloud Web API endpoints:

### Authentication
- `GET /api/authentication/validate` - Validate credentials

### Projects
- `GET /api/projects/search` - Search and retrieve projects

### Measures/Metrics
- `GET /api/measures/component` - Get measures for a component
- `GET /api/measures/search_history` - Search historical measure data
- `GET /api/metrics/search` - List available metrics (used in dropdown)

### Issues
- `GET /api/issues/search` - Search for issues (bugs, vulnerabilities, code smells)

### Quality Gates
- `GET /api/qualitygates/list` - List all quality gates
- `GET /api/qualitygates/project_status` - Get quality gate status for a project

For complete API documentation, refer to:
- [SonarQube Web API](https://docs.sonarsource.com/sonarqube-server/latest/extension-guide/web-api/)
- [SonarCloud Web API](https://docs.sonarsource.com/sonarqube-cloud/advanced-setup/web-api)

## Development

### Prerequisites

- Node.js >= 18.10
- npm >= 8.0.0
- n8n installed globally or locally

### Running Locally

To test the node locally during development:

1. Clone the repository:
```bash
git clone https://github.com/robertasolimandonofreo/n8n-nodes-sonarqube.git
cd n8n-nodes-sonarqube
```

2. Install dependencies:
```bash
npm install
```

3. Build the node:
```bash
npm run build
```

4. Link the node to your global n8n installation:
```bash
npm link
```

5. In your n8n installation directory, link the package:
```bash
cd ~/.n8n/nodes  # or your n8n custom nodes directory
npm link n8n-nodes-sonarqube
```

6. Start n8n:
```bash
n8n start
```

The SonarQube node should now appear in your n8n instance.

### Alternative: Using n8n Development Mode

You can also use n8n's development mode with hot reloading:

1. Install dependencies:
```bash
npm install
```

2. Start the build in watch mode:
```bash
npm run dev
```

3. In another terminal, start n8n with custom nodes:
```bash
n8n start --tunnel
```

### Testing

To run tests (once test suite is implemented):

```bash
npm test
```

### Linting

To check code quality and style:

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lintfix
```

### Building

To build the project for production:

```bash
npm run build
```

This will:
1. Compile TypeScript files to JavaScript
2. Copy icon files to the `dist` directory
3. Generate declaration files

The compiled files will be in the `dist/` directory.

### Publishing

To publish the package to npm:

1. Ensure you're logged in to npm:
```bash
npm login
```

2. Update the version in `package.json`:
```bash
npm version patch  # or minor, or major
```

3. Build the package:
```bash
npm run build
```

4. Run linting:
```bash
npm run lint
```

5. Publish to npm:
```bash
npm publish
```

**Note**: The `prepublishOnly` script will automatically run build and lint checks before publishing.

## Requirements

### SonarQube (Self-Hosted)

- **Minimum Version**: SonarQube 7.9 LTS or later (recommended: latest LTS)
- **Authentication**: Personal Access Token with appropriate permissions
- **Permissions Required**:
  - Browse on projects
  - Execute analysis (if triggering scans)

### SonarCloud

- **Authentication**: Personal Access Token
- **Organization Access**: Token must have access to the organization
- **Permissions Required**:
  - Browse on projects
  - Execute analysis (if triggering scans)

### Network Requirements

- The n8n instance must have network access to your SonarQube server or SonarCloud
- For self-hosted SonarQube: Ensure firewall rules allow traffic on the SonarQube port (default: 9000)
- HTTPS is recommended for production environments

## Compatibility

- **n8n Version**: 0.200.0 or later
- **Node.js**: 18.10 or later
- **npm**: 8.0.0 or later

Tested with:
- SonarQube Community Edition 10.x
- SonarQube Developer Edition 10.x
- SonarCloud

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [SonarQube Web API Documentation](https://docs.sonarsource.com/sonarqube-server/latest/extension-guide/web-api/)
- [SonarCloud Web API Documentation](https://docs.sonarsource.com/sonarqube-cloud/advanced-setup/web-api)
- [SonarQube Official Documentation](https://docs.sonarsource.com/sonarqube-server/)
- [SonarCloud Official Documentation](https://docs.sonarsource.com/sonarqube-cloud/)

## License

[MIT](LICENSE)

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/robertasolimandonofreo/n8n-nodes-sonarqube).

## Version History

### 0.1.0 (Initial Release)

- Initial release with support for:
  - Project operations (search, get)
  - Measure operations (get component measures, search history)
  - Issue operations (search with filters)
  - Quality Gate operations (list, get project status)
- Support for both SonarQube and SonarCloud
- Pagination support for list operations
- Dynamic metric loading
