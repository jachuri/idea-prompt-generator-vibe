const key = process.env.GEMINI_API_KEY;

if (!key) {
    console.error("No API key found in .env");
    process.exit(1);
}

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
    .then(res => res.json())
    .then(data => {
        if (data.models) {
            const geminiModels = data.models
                .filter(m => m.name.includes('gemini'))
                .map(m => `${m.name} - ${m.description || ''}`);
            console.log("=== Available Gemini Models ===");
            console.log(geminiModels.join('\n'));
        } else {
            console.log("Response:", data);
        }
    })
    .catch(err => console.error("Error fetching models:", err));
