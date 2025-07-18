import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VercelAIToolSet } from "composio-core";

import { logger } from './utils/logger.js';

export function registerTools(server: McpServer) {
    server.tool("connect_gmail", "Connect to Gmail", {
    }, async (args, extra) => {
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });

            logger.info('args ', args);
            logger.info('extra ', extra);
            const userAddress = "default-user";
            
            const entity = toolset.client.getEntity(userAddress);
            const connection = await entity.initiateConnection({ appName: "gmail" });
            
            return {
                content: [{ 
                    type: "text", 
                    text: `🔗 Gmail connection initiated!\n\nPlease connect your Gmail account by clicking on the link below:\n\n${connection.redirectUrl}\n\nAfter connecting, you can use Gmail actions.` 
                }],
            };
        } catch (error) {
            logger.error('Error initiating Gmail connection:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error initiating Gmail connection: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("check_gmail_connection", "Check Gmail connection status", {
    }, async (args, extra) => {
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });
            logger.info('args ', args);
            logger.info('extra ', extra);
            const userAddress = "default-user";
            
            // const userAddress = args.session_id;
            
            const result = await toolset.executeAction({
                action: "GMAIL_GET_PROFILE",
                entityId: userAddress,
                params: {}
            });
            
            if (result.successful) {
                const profile = result.data?.response_data as any;
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Your Gmail account is connected!\n\nUser Profile:\n• Email: ${profile.emailAddress}\n• Messages: ${profile.messagesTotal} total\n• Threads: ${profile.threadsTotal} total` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: "❌ Your Gmail account is not connected! Please use the connect-gmail tool first." 
                    }],
                };
            }
        } catch (error) {
            logger.error('Error checking Gmail connection:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error checking Gmail connection: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    // Email Operations
    server.tool("send_email", "Send an email", {
        to: z.string().describe("The email address of the recipient"),
        subject: z.string().describe("The subject of the email"),
        body: z.string().describe("The body of the email")
        // session_id: z.string().describe("The session ID of the user")
    }, async (args, extra) => {    
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_SEND_EMAIL", 
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Email sent successfully!\n\nTo: ${args.to}\nSubject: ${args.subject}\n\nYour email has been sent and is now in your Gmail sent folder.` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to send email: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            logger.error('Error sending email:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error sending email: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("get_emails", "Get emails from inbox", {
        maxResults: z.number().optional().describe("Maximum number of emails to retrieve (default: 10)"),
        query: z.string().optional().describe("Gmail search query to filter emails"),
        labelIds: z.array(z.string()).optional().describe("Array of label IDs to filter by"),
    }, async (args, extra) => {
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });
            const userAddress = "default-user"; 
            
            const result = await toolset.executeAction({
                action: "GMAIL_GET_EMAILS",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                const emails = result.data?.response_data as any;
                const emailList = emails.messages?.map((email: any) => 
                    `• ${email.snippet} (${email.id})`
                ).join('\n') || 'No emails found';
                
                return {
                    content: [{ 
                        type: "text", 
                        text: `📧 Emails retrieved successfully!\n\n${emailList}\n\nTotal: ${emails.messages?.length || 0} emails` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to get emails: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            logger.error('Error getting emails:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error getting emails: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("get_email", "Get a specific email by ID", {
        emailId: z.string().describe("The ID of the email to retrieve")
    }, async (args, extra) => {
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_GET_EMAIL",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                const email = result.data?.response_data as any;
                return {
                    content: [{ 
                        type: "text", 
                        text: `📧 Email Details:\n\nFrom: ${email.payload?.headers?.find((h: any) => h.name === 'From')?.value}\nSubject: ${email.payload?.headers?.find((h: any) => h.name === 'Subject')?.value}\nDate: ${email.payload?.headers?.find((h: any) => h.name === 'Date')?.value}\n\nBody: ${email.snippet}` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to get email: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            logger.error('Error getting email:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error getting email: ${error instanceof Error ? error.message : String(error)}` 
                }],
            }; 
        }
    });

    server.tool("reply_to_email", "Reply to an existing email", {
        emailId: z.string().describe("The ID of the email to reply to"),
        message: z.string().describe("The reply message content"),
    }, async (args, extra) => {
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_REPLY_TO_EMAIL",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Reply sent successfully!\n\nYour reply has been sent to the original email thread.` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to send reply: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            logger.error('Error sending reply:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error sending reply: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("forward_email", "Forward an email to other recipients", {
        emailId: z.string().describe("The ID of the email to forward"),
        to: z.string().describe("The email address to forward to"),
        message: z.string().optional().describe("Additional message to include with the forward")
    }, async (args, extra) => {
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_FORWARD_EMAIL",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Email forwarded successfully!\n\nForwarded to: ${args.to}` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to forward email: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            logger.error('Error forwarding email:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error forwarding email: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    // Search Operations
    server.tool("search_emails", "Search emails using Gmail search syntax", {
        query: z.string().describe("Gmail search query (e.g., 'from:example@gmail.com', 'subject:meeting', 'is:unread')"),
        maxResults: z.number().optional().describe("Maximum number of results to return"),
    }, async (args, extra) => {
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_SEARCH_EMAILS",  
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                const emails = result.data?.response_data as any;
                const emailList = emails.messages?.map((email: any) => 
                    `• ${email.snippet} (${email.id})`
                ).join('\n') || 'No emails found matching your search';
                
                return {
                    content: [{ 
                        type: "text", 
                        text: `🔍 Search results for "${args.query}":\n\n${emailList}\n\nTotal: ${emails.messages?.length || 0} emails found` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to search emails: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            logger.error('Error searching emails:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error searching emails: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    // Advanced Operations
    server.tool("mark_as_read", "Mark emails as read", {
        emailIds: z.array(z.string()).describe("Array of email IDs to mark as read"),
    }, async (args, extra) => {
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_MARK_AS_READ",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Emails marked as read successfully!\n\nMarked ${args.emailIds.length} email(s) as read.` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to mark emails as read: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            logger.error('Error marking emails as read:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error marking emails as read: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("mark_as_unread", "Mark emails as unread",   {
        emailIds: z.array(z.string()).describe("Array of email IDs to mark as unread"),
    }, async (args, extra) => {
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_MARK_AS_UNREAD",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Emails marked as unread successfully!\n\nMarked ${args.emailIds.length} email(s) as unread.` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to mark emails as unread: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            logger.error('Error marking emails as unread:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error marking emails as unread: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }       
    });

    server.tool("move_to_trash", "Move emails to trash", {
        emailIds: z.array(z.string()).describe("Array of email IDs to move to trash"),
    }, async (args, extra) => {
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_MOVE_TO_TRASH",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `🗑️ Emails moved to trash successfully!\n\nMoved ${args.emailIds.length} email(s) to trash.` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to move emails to trash: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            logger.error('Error moving emails to trash:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error moving emails to trash: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("get_gmail_settings", "Get Gmail settings", {
    }, async (args, extra) => {
        try {
            const toolset = new VercelAIToolSet({
                apiKey: process.env.COMPOSIO_API_KEY,
            });
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_GET_SETTINGS",
                entityId: userAddress,
                params: {}
            });
            
            if (result.successful) {
                const settings = result.data?.response_data as any;
                return {
                    content: [{ 
                        type: "text", 
                        text: `⚙️ Gmail Settings:\n\n${JSON.stringify(settings, null, 2)}` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to get Gmail settings: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            logger.error('Error getting Gmail settings:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error getting Gmail settings: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });
}