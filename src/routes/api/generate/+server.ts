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

        // 구글 서버 일시적 과부하(503)를 방지하기 위해 여러 모델 층을 순차적으로 시도하는 Fallback 로직 적용
        const fallbackModels = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];
        let result = null;
        let lastError = null;

        for (const modelName of fallbackModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent(prompt);
                break; // 성공 시 루프 탈출
            } catch (err: any) {
                console.warn(`[Warning] Model ${modelName} failed, trying next... Error: ${err.message}`);
                lastError = err;
            }
        }

        if (!result) throw lastError;

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
