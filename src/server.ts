import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { sendPrompt } from './prompt';

const app = express();
const port = process.env.PORT || 80;

// Middleware to parse JSON bodies
app.use(express.json());

// Route for handling prompts
app.post('/prompt', async (req: any, res: any) => {
    try {
        const identitytoken = req.body.identitytoken || req.body.identity_token;
        const textStream = await sendPrompt(identitytoken, {
            env: process.env,
            messages: req.body.messages,
            stream: req.body.stream,
        });
        if (textStream instanceof ReadableStream) {
            process.stdout.write('Assistant said: ');
            for await (const delta of textStream) {
                const message = {
                    object: 'chat.completion.chunk',
                    choices: [
                        {
                            delta: {
                                role: 'assistant',
                                content: delta,
                            },
                        },
                    ],
                }
                process.stdout.write(delta);
                res.write(`data: ${JSON.stringify(message)}\n\n`);
            }
            res.write("data: [DONE]\n\n");
            res.end();
        } else if (typeof textStream === 'string') {
            const message = {
                choices: [
                    {
                        delta: {
                            role: 'assistant',
                            content: textStream,
                        },
                    },
                ],
            }
            res.status(200).json(message);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to process prompt' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
