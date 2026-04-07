import { json } from '@sveltejs/kit';
import { GEMINI_API_KEY } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the SDK with the private API key provided in .env
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST({ request }) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return json({ success: false, error: 'Prompt is required' }, { status: 400 });
        }

        // Using 'gemini-flash-latest' alias to automatically point to the newest stable flash model and future-proof the app
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Text is correctly extracted from the model's response part
        const text = response.text();

        return json({ success: true, text });
    } catch (error: any) {
        console.error('Gemini API Check Error:', error);
        return json({
            success: false,
            error: error.message || 'An unknown error occurred while calling the AI model'
        }, { status: 500 });
    }
}
