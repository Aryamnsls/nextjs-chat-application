import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Allow streaming responses up to 60 seconds (longer for tool calls)
export const maxDuration = 60;

export async function POST(req: Request) {
  // 1. Verify Authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // 2. Extract messages and validate API key
  const { messages } = await req.json();
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return new Response(JSON.stringify({ error: "API Key is missing. Please update .env.local" }), { status: 500 });
  }

  const google = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  try {
    // 3. Initialize the stream with tools for real-time data
    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: "You are Nova Intelligence, a highly capable AI assistant. " +
              "You have access to real-time tools. If a user asks for weather or temperature, " +
              "use the getWeather tool. Always respond in clean, pointwise Markdown.",
      messages: await convertToModelMessages(messages),
      tools: {
        getWeather: tool({
          description: 'Get the current weather for a specific location',
          inputSchema: z.object({
            location: z.string().describe('The city and country, e.g., San Francisco, USA'),
          }),
          execute: async ({ location }) => {
            try {
              // 1. Get coordinates using geocoding (Open-Meteo)
              const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
              const geoRes = await fetch(geoUrl);
              const geoData = await geoRes.json();
              
              if (!geoData.results?.length) {
                return {
                  location,
                  error: `Could not find coordinates for ${location}.`
                };
              }
              
              const { latitude, longitude, name, country } = geoData.results[0];
              
              // 2. Get weather for those coordinates
              const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;
              const weatherRes = await fetch(weatherUrl);
              const weatherData = await weatherRes.json();
              
              const current = weatherData.current;
              return {
                location: `${name}, ${country}`,
                temperature: `${current.temperature_2m}°C`,
                feelsLike: `${current.apparent_temperature}°C`,
                humidity: `${current.relative_humidity_2m}%`,
                windSpeed: `${current.wind_speed_10m} km/h`,
                condition: "Success"
              };
            } catch (err) {
              return {
                location,
                error: `Error fetching weather: ${err instanceof Error ? err.message : String(err)}`
              };
            }
          },
        }),
      },
      // In AI SDK 6.x, we use stopWhen to control multi-step execution
      stopWhen: stepCountIs(2),
    });

    // 4. Return the stream response
    return result.toUIMessageStreamResponse();
  } catch (err: any) {
    console.error("AI SDK Tool Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Failed to generate AI response" }), { status: 500 });
  }
}
