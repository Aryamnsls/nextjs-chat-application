const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  try {
    const listModelsResponse = await genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy to check access
    console.log("Access successful to gemini-pro. Attempting to list all models...");
    // The library doesn't always have listModels exposed in the same way, but let's try.
    // Actually, I'll just try to create a model and generate a simple response.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi");
    console.log("Response from gemini-1.5-flash:", result.response.text());
  } catch (error) {
    console.error("Error from gemini-1.5-flash:", error.message);
    
    // Try gemini-1.5-pro
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent("Hi");
      console.log("Response from gemini-1.5-pro:", result.response.text());
    } catch (e) {
      console.error("Error from gemini-1.5-pro:", e.message);
    }
  }
}

listModels();
