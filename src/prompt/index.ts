import { createOpenAI } from '@ai-sdk/openai';
import { PromptPayload } from "agent-server-definition";
import { CoreMessage, generateText, streamText } from 'ai';
import { VercelAIToolSet } from "composio-core";
import { logger } from '../utils/logger';
import { z } from "zod";

const clientOpenAI = createOpenAI({
    name: process.env.LLM_MODEL_ID || 'gpt-4o-mini',
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY || 'no-need',
});

// Function to extract address from bearer token
const extractAddressFromIdentityToken = (identityToken: string): string | null => {
    try {
        // Base64 decode the identity token
        const decodedToken = Buffer.from(identityToken, 'base64').toString('utf-8');
        
        // Parse the JSON data
        const tokenData = JSON.parse(decodedToken);
        
        // Extract the address field
        if (tokenData && tokenData.address) {
            return tokenData.address;
        }
        
        return null;
    } catch (error) {
        console.error('Error extracting address from identity token:', error);
        return null;
    }
};

const toolset = new VercelAIToolSet({
    apiKey: process.env.COMPOSIO_API_KEY,
});

export const sendPrompt = async (identityToken: string, request: {
    env: any,
    messages: any[],
    stream: boolean,
}): Promise<any> => {
    // const composioApiKey = (request.env && request.env.COMPOSIO_API_KEY) ? request.env.COMPOSIO_API_KEY : (process.env.COMPOSIO_API_KEY || '');
    // console.log('composioApiKey  ', composioApiKey);

    // Extract address from bearer token
    const userAddress = extractAddressFromIdentityToken(identityToken);
    console.log('Extracted user address from bearer token:', userAddress);
    
    try {
        
        const tools = await toolset.getTools({
            apps: ["gmail"], 
        }, userAddress);

        // Add custom tools for connection management
        const customTools = {
            connectAccount: {
                description: 'Authenticate the users Gmail account',
                parameters: z.object({}),
                execute: async () => {
                    try {
                        const entity = toolset.client.getEntity(userAddress as string);
                        const connection = await entity.initiateConnection({ appName: "gmail" });
                        return {
                            redirectUrl: connection.redirectUrl,
                            message: `🔗 Gmail connection initiated!\n\nPlease connect your Gmail account by clicking on the link below:\n\n${connection.redirectUrl}\n\nAfter connecting, you can use Gmail actions.`
                        }
                    } catch (error) {
                        logger.error('Error initiating Gmail connection:', error);
                        return {
                            message: 'Error initiating Gmail connection: ' + (error instanceof Error ? error.message : String(error))
                        }
                    }
                },
            },
            checkConnection: {
                description: 'Check the Gmail connection by performing a simple action',
                parameters: z.object({}),
                execute: async () => {
                    console.log('execute checkAuthentication');
                    try {
                        const result = await toolset.executeAction({
                            action: "GMAIL_GET_PROFILE",
                            entityId: userAddress as string,
                            params: {}
                        });
                        
                        if (result.successful) {
                            const profile = result.data?.response_data as any;
                            return `✅ Your Gmail account is connected!\n\nUser Profile:\n• Email: ${profile.emailAddress}\n• Name: ${profile.messagesTotal} messages total\n• Threads: ${profile.threadsTotal} threads total`;
                        } else {
                            return `❌ Your Gmail account is not connected!`;
                        }
                    } catch (error) {
                        logger.error('Error testing Gmail connection:', error);
                        return {
                            message: 'Error testing Gmail connection: ' + (error instanceof Error ? error.message : String(error))
                        }
                    }
                },
            }
        };

        // Combine Composio tools with custom tools
        const allTools = {
            ...tools,
            ...customTools
        };

        const params = {
            model: clientOpenAI(process.env.LLM_MODEL_ID || 'gpt-4o-mini'),
            maxSteps: 25,
            system: `
            You are a helpful assistant integrated with Gmail through Composio. You can help users manage their emails, check connections, and perform various Gmail actions.

            **Available Capabilities:**
            • Check user connection status to Gmail
            • Initiate new Gmail connections
            • List available Gmail actions
            • Test Gmail connection functionality
            • Perform Gmail actions (send emails, read emails, manage labels, etc.)

            **Connection Management:**
            • Use initiateGmailConnection to help users connect their Gmail account
            • Use checkGmailConnection to verify the connection works

            **Gmail Actions:**
            • Send emails, read emails, manage labels, and more
            • Use listAvailableActions to see what's possible
            • Always check connection status before performing actions

            **Rules:**
            • Always verify connection status before performing Gmail actions
            • Provide clear instructions for connection setup
            • Handle errors gracefully and provide helpful feedback
            • Respect user privacy and email content
            
            Important:
            - connectAccount is used to authenticate the user's Gmail account.
            - checkConnection should be used before other actions.
            `,
            tools: allTools,
            tool_choice: "auto",
            messages: request.messages as CoreMessage[]
        }

        if (request.stream) {
            const { textStream } = streamText(params as any);
            return textStream;
        } else {
            const { text } = await generateText(params as any);
            return text;
        }
    } catch (error) {
        logger.error('Error sending prompt:', error);
        throw new Error('Failed to send prompt');
    }
}