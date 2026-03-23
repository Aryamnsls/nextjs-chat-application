const fs = require('fs');

async function listModels() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const apiKeyLine = env.split('\n').find(line => line.startsWith('GOOGLE_GENERATIVE_AI_API_KEY='));
  const apiKey = apiKeyLine.split('=')[1].trim();
  
  console.log(`Using API Key: ${apiKey.substring(0, 8)}...`);
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.models) {
    console.log("AVAILABLE MODELS:");
    data.models.forEach(m => console.log(`- ${m.name}`));
  } else {
    console.log("ERROR DATA:", JSON.stringify(data));
  }
}

listModels();
