const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  try {
    // In some versions of the SDK, listModels is available on the genAI object or a sub-request.
    // However, we can also use the native REST fetch to see what's allowed.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("AVAILABLE MODELS:");
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log("No models returned. Data:", JSON.stringify(data));
    }
  } catch (error) {
    console.error("List Models Error:", error.message);
  }
}

listModels();
