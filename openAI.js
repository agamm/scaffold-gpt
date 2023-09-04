import OpenAI from "openai";

import { getOpenAiKey } from "./config.js";

const openai = new OpenAI({
  apiKey: getOpenAiKey().openaiKey,
});

export async function openAi(
  commandText,
  instructions,
  model = "gpt-3.5-turbo"
) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: instructions },
      { role: "user", content: commandText },
    ],
    model: model,
    temperature: 0,
  });
  const responseText = completion.choices[0].message.content;
  return responseText;
}
