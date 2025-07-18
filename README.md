# Gmail AI Agent MCP Server

A Model Context Protocol (MCP) server that provides Gmail integration capabilities for AI models and tools. This server enables AI assistants to connect to Gmail accounts, check connection status, and send emails through a secure interface.

## Tools

The server implements the following Gmail-related tools:

### `connect-gmail`
Initiates a connection to a Gmail account. This tool will provide a redirect URL for OAuth authentication.

### `check-gmail-connection`
Checks the current Gmail connection status and displays user profile information including email address, total messages, and total threads.

### `send-email`
Sends an email through the connected Gmail account. Parameters:
- `to`: The email address of the recipient
- `subject`: The subject of the email
- `body`: The body content of the email

## Setup

### Prerequisites

1. **Composio API Key**: You'll need a Composio API key to use the Gmail integration. You can get one by signing up at [Composio](https://composio.dev/).

2. **Gmail Account**: A Gmail account that you want to connect to the AI agent.

### Installation

You can configure the Gmail AI agent server in your MCP client. Here is an example configuration for Claude Desktop (Settings -> Developer -> Edit Config):

```json
{
  "mcpServers": {
    "gmail-agent": {
      "command": "node",
      "args": ["path/to/your/gmail-mcp/dist/index.js"],
      "env": {
        "COMPOSIO_API_KEY": "<YOUR_COMPOSIO_API_KEY>"
      }
    }
  }
}
```

### Development Setup

If you're running from source:

```bash
# Clone the repository
git clone <repository-url>
cd gmail-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run the server
npm start
```

Then configure your MCP client to point to the built server:

```json
{
  "mcpServers": {
    "gmail-agent": {
      "command": "node",
      "args": ["/path/to/gmail-mcp/dist/index.js"],
      "env": {
        "COMPOSIO_API_KEY": "<YOUR_COMPOSIO_API_KEY>"
      }
    }
  }
}
```

## Usage

1. **Configure the server** in your MCP client (like Claude Desktop)
2. **Restart your client** to load the new configuration
3. **Connect to Gmail** by using the `connect-gmail` tool - this will provide an OAuth link
4. **Authorize the connection** by clicking the provided link and following the Gmail authorization flow
5. **Check connection** using `check-gmail-connection` to verify everything is working
6. **Send emails** using the `send-email` tool with recipient, subject, and body parameters

## Security

- The server uses OAuth 2.0 for secure Gmail authentication
- No passwords are stored locally
- All Gmail operations are performed through secure API calls
- The connection is maintained securely through Composio's infrastructure

## Example Workflow

1. **Initial Setup**: Use `connect-gmail` to start the OAuth flow
2. **Verification**: Use `check-gmail-connection` to confirm successful connection
3. **Email Operations**: Use `send-email` to compose and send emails through your connected Gmail account

## Troubleshooting

- **Connection Issues**: If you encounter connection problems, try using `connect-gmail` again to re-authenticate
- **API Key Issues**: Ensure your Composio API key is correctly set in the environment variables
- **Permission Errors**: Make sure you've granted the necessary permissions during the OAuth flow
