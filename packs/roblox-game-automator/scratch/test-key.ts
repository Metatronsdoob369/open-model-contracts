import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/joewales/NODE_OUT_Master/open-model-contracts/packs/roblox-game-automator/.env' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "hi" }],
    });
    console.log("Key works!", completion.choices[0].message.content);
  } catch (err: any) {
    console.log("Key failed:", err.message);
  }
}
test();
