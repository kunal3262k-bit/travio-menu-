require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
  const key = process.env.SWIFTTAB_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) return console.log("No Gemini key");

  console.log("Testing Gemini API key");
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: 'Say hello',
    });
    console.log(response.text);
  } catch(e) {
    console.error("Gemini failed:", e.message);
  }
}

async function testGroq2() {
  const key = process.env.GROQ_API_KEY;
  if (!key) return console.log("No Groq key");

  console.log("Testing Groq with llama-3.2-90b-vision-preview");
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [{ role: 'user', content: 'Say hello' }]
        })
    });
    console.log(await res.text());
  } catch (e) {}
}

async function main() {
  await testGemini();
  await testGroq2();
}
main();
