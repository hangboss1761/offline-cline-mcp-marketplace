# Offline Cline Marketplace

This project aims to periodically synchronize MCP servers from the official Cline Marketplace.

## Installation

Use the following command to install dependencies:

```bash
npm install
```

## Usage

Use the following command to start the project:

```bash
npm start
```

## Database Structure

The `mcp_services.db` database contains the following tables:

### 1. `services`

- **mcpId**: TEXT PRIMARY KEY - Unique identifier for each service.
- **name**: TEXT - Name of the MCP service.
- **description**: TEXT - Description of the MCP service.
- **author**: TEXT - Author of the service.
- **githubUrl**: TEXT - URL to the service's GitHub repository.
- **logoUrl**: TEXT - URL to the service's logo.
- **category**: TEXT - Category of the service.
- **tags**: TEXT - Tags associated with the service (stored as a JSON string).
- **requiresApiKey**: BOOLEAN - Indicates if the service requires an API key.
- **isRecommended**: BOOLEAN - Indicates if the service is recommended.
- **githubStars**: INTEGER - Number of stars on GitHub.
- **downloadCount**: INTEGER - Number of times the service has been downloaded.
- **createdAt**: TEXT - Timestamp when the service was created.
- **updatedAt**: TEXT - Timestamp when the service was last updated.

### 2. `service_details`

- **mcpId**: TEXT PRIMARY KEY - Unique identifier for each service (foreign key referencing `services`).
- **githubUrl**: TEXT - URL to the service's GitHub repository.
- **name**: TEXT - Name of the MCP service.
- **author**: TEXT - Author of the service.
- **description**: TEXT - Description of the MCP service.
- **codiconIcon**: TEXT - URL to the service's codicon icon.
- **logoUrl**: TEXT - URL to the service's logo.
- **category**: TEXT - Category of the service.
- **tags**: TEXT - Tags associated with the service (stored as a JSON string).
- **requiresApiKey**: BOOLEAN - Indicates if the service requires an API key.
- **readmeContent**: TEXT - Content of the service's README.
- **llmsInstallationContent**: TEXT - Installation content for LLMs.
- **isRecommended**: BOOLEAN - Indicates if the service is recommended.
- **githubStars**: INTEGER - Number of stars on GitHub.
- **createdAt**: TEXT - Timestamp when the service details were created.
- **updatedAt**: TEXT - Timestamp when the service details were last updated.
- **lastGithubSync**: TEXT - Timestamp of the last synchronization with GitHub.
