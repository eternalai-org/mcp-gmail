# Gmail Helper Bot with Composio

A Node.js application that provides an AI assistant integrated with Gmail using the Composio platform for seamless email management.

## Features

- **Gmail Integration via Composio**: Seamless integration with Gmail through Composio's platform
- **AI-Powered Email Management**: Intelligent email composition, reading, and management
- **Connection Management**: Check, test, and initiate Gmail connections
- **Action Discovery**: List and explore available Gmail actions
- **Error Handling**: Comprehensive error handling and user feedback

## Setup

### 1. Environment Configuration

Create a `.env` file with the following variables:

```env
# Composio Configuration
COMPOSIO_API_KEY=your_composio_api_key_here
YOUR_GMAIL=your_email@gmail.com

# LLM Configuration
LLM_BASE_URL=https://vibe-agent-gateway.eternalai.org/v1
LLM_API_KEY=your_llm_api_key
LLM_MODEL_ID=gpt-4o-mini

# Server Configuration
PORT=3000
DATA_BACKEND_URL=http://localhost:8480
```

### 2. Getting Your Composio API Key

1. Sign up for a Composio account at [composio.dev](https://composio.dev)
2. Navigate to your dashboard
3. Generate an API key
4. Add the API key to your `.env` file

### 3. Gmail Connection Setup

The bot will automatically handle Gmail connection setup. When you first use Gmail actions, it will:
1. Check if you're connected to Gmail
2. If not connected, provide a connection link
3. Guide you through the OAuth process
4. Store your connection for future use

## Usage

### Starting the Server

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start

# Or run in development mode
npm run dev
```

### Interactive Chat

```bash
# Start an interactive chat session
npm run chat
```

## API Endpoints

### POST /prompt

Send a prompt to the AI assistant and get a response.

**Headers:**
```
Authorization: Bearer your_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Check my Gmail connection"
    }
  ],
  "stream": false
}
```

## Available Tools

The AI assistant has access to the following tools:

### checkUserConnection
Check if the user is connected to Gmail and get connection status.

### getConnectionStatus
Get detailed connection status and information for all connected apps.

### initiateGmailConnection
Initiate a new Gmail connection for the user.

### listAvailableActions
List all available Gmail actions that can be performed.

### testGmailConnection
Test the Gmail connection by performing a simple action.

### Gmail Actions (via Composio)
- Send emails
- Read emails
- Manage labels
- Create drafts
- Search emails
- And many more...

## Connection Management

### Automatic Connection Setup
The bot automatically handles Gmail connection setup:
1. **Connection Check**: Verifies if you're connected to Gmail
2. **Connection Initiation**: Provides OAuth link if not connected
3. **Connection Testing**: Tests the connection with a simple action
4. **Status Monitoring**: Monitors connection health

### Manual Connection Management
You can also manually manage connections:
- Use `checkUserConnection` to verify connection status
- Use `initiateGmailConnection` to start a new connection
- Use `getConnectionStatus` to see all connected apps

## Gmail Actions

The bot supports a wide range of Gmail actions through Composio:

### Email Management
- **Send Email**: Compose and send emails
- **Read Emails**: Get recent emails with filtering
- **Search Emails**: Search through your email history
- **Create Draft**: Create email drafts
- **Send Draft**: Send existing drafts

### Label Management
- **List Labels**: Get all Gmail labels
- **Create Label**: Create new labels
- **Modify Labels**: Update label properties

### Advanced Features
- **Email Threading**: Work with email threads
- **Attachment Handling**: Manage email attachments
- **Email Filtering**: Filter emails by various criteria

## Error Handling

The bot includes comprehensive error handling for:
- Missing Composio API key
- Gmail connection issues
- OAuth authentication failures
- Network connectivity issues
- Gmail API errors
- Permission issues

## Development

### Project Structure

```
src/
├── prompt/
│   └── index.ts          # Main prompt handling logic with Composio integration
├── server.ts             # Express server setup
├── chat.ts               # Interactive chat interface
├── types/
│   └── chat.ts           # TypeScript type definitions
└── utils/
    └── logger.ts         # Logging utility
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Docker

Build and run with Docker:

```bash
# Build the image
npm run build-docker

# Run the container
docker run -p 3000:80 --env-file .env gmail-helper
```

## Troubleshooting

### Common Issues

1. **Gmail not connected**: Use `initiateGmailConnection` to start the connection process
2. **API key error**: Verify your Composio API key is correct
3. **OAuth issues**: Check if the OAuth redirect URL is properly configured
4. **Permission errors**: Ensure the Gmail app has the necessary permissions

### Testing Connections

Use the built-in tools to test your setup:

```bash
# Start interactive chat
npm run chat

# Then try these commands:
# - "Check my Gmail connection"
# - "List available Gmail actions"
# - "Test the Gmail connection"
```

## Security

- **API Key Protection**: Never commit API keys to version control
- **OAuth Security**: Uses secure OAuth 2.0 flow for Gmail access
- **Data Privacy**: Respects user privacy and email content
- **Connection Security**: Secure connection management through Composio

## License

This project is part of the Vibe Examples collection. 