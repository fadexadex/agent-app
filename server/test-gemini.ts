import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import dotenv from "dotenv";

dotenv.config();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

async function main() {
  console.log("Testing Gemini 3.1 Pro model...");
  
  try {
    const { text } = await generateText({
      model: google("gemini-3.1-pro-preview"),
      prompt: "Hello! Are you working? Please respond with a short confirmation message.",
    });
    
    console.log("\nSuccess! Model responded with:");
    console.log("-----------------------------------");
    console.log(text);
    console.log("-----------------------------------");
  } catch (error) {
    console.error("\nError calling the model:");
    console.error(error);
  }
}

main();
