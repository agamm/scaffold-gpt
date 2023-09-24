import OpenAI from "openai";
import fs from "fs/promises";

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

export async function openAi(commandText, instructions, model = "gpt-4") {
  // Debug the prompt
  const prompt = JSON.stringify(
    [
      { role: "system", content: instructions },
      { role: "user", content: commandText },
    ],
    null,
    2
  );
  saveData("prompt.json", prompt);

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: instructions },
      { role: "user", content: commandText },
    ],
    model: model,
    temperature: 0,
  });
  const responseText = completion.choices[0].message.content;
  saveData("response.json", responseText);
  return responseText;
}

async function saveData(filename, data) {
  try {
    // Write the JSON string to the file
    await fs.writeFile(filename, data);
  } catch (err) {
    console.error("Error writing to file:", err);
  }
}
