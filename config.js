import fs from "fs/promises";
import fsS from "fs";
import os from "os";
import path from "path";

// Determine the configuration directory based on the user's home directory.
const configDir = path.join(os.homedir(), ".scaffold-gpt");
const configPath = path.join(configDir, "config.json");

export async function getConfig() {
  try {
    await fs.access(configPath, fsS.constants.F_OK);
  } catch (configError) {
    console.log(configError);
    throw new Error(
      'Configuration file not found. Use "scaffold set-key <openai-key>" to set the OpenAI API key.'
    );
  }

  // Check if the OpenAI API key is set
  try {
    const configData = await fs.readFile(configPath, "utf-8");
    const { openaiKey } = JSON.parse(configData);

    if (!openaiKey) {
      throw new Error(
        'OpenAI API key is not set. Use "scaffold set-key <openai-key>" to set it.'
      );
    }
    return openaiKey;
  } catch (error) {
    throw new Error("Error:", error.message);
  }
}

export async function saveOpenAiKey(openaiKey) {
  try {
    // Create the configuration directory if it doesn't exist
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify({ openaiKey }));
    console.log("OpenAI API key saved.");
  } catch (error) {
    console.error("Error saving OpenAI API key:", error.message);
  }
}

export function getOpenAiKey() {
  const file = fsS.readFileSync(configPath).toString();
  return JSON.parse(file);
}
