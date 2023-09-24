import google from "googlethis";
import { convert } from "html-to-text";
import axios from "axios";
import cheerio from "cheerio";
import { openAi } from "./openAI.js";
import inquirer from "inquirer";

import { spawn } from "child_process";

async function searchGoogle(term) {
  const options = {
    page: 0,
    safe: false, // Safe Search
    parse_ads: false,
    additional_params: {
      hl: "en",
    },
  };

  const response = await google.search(term, options);
  if (response.results.length === 0)
    throw new Error(`No results found for docs search '${term}'`);
  return response.results[0].url;
}

function getMainText(htmlBody) {
  // Load the HTML into cheerio
  const c = cheerio.load(htmlBody);

  // Define elements to exclude (e.g., navigation and footer)
  const elementsToExclude = ["header", "nav", "footer", "script"];

  // Remove unwanted elements and their descendants
  elementsToExclude.forEach((element) => {
    c(element).remove();
  });

  // Extract text content from remaining elements
  return c("body").html();
}

async function getHTMLText(url) {
  const response = await axios.get(url);
  if (!response.status === 200) {
    throw new Error(`Error fetching the url: ${url}`);
  }
  // The HTML content is available in response.data
  const htmlString = response.data;

  const mainText = getMainText(htmlString);

  const text = convert(mainText);
  return text;
}

export async function getInstallDocs(tech, version) {
  // Get the documentation for option
  const versionString = version ? ` version ${version} ` : " ";
  const docsURL = await searchGoogle(
    `${tech}${versionString}docs getting started install`
  );
  console.log(`Using docs url: ${docsURL}`);
  const docsText = await getHTMLText(docsURL);

  return docsText;
}

export async function generateTasks(tech, version) {
  var platform = process.platform === "win32" ? "windows" : "unix";
  console.log(`Detected platform: ${platform}.`);
  const versionString = version ? ` version ${version} ` : " ";

  console.log(`Fetching the docs for ${tech}...`);
  const docsText = await getInstallDocs(tech, version);
  const docsTextLimit = docsText.replace("\n\n\n", "\n").substring(0, 6000);

  const instructions = `Given the docs and a technology, output JSON ALL steps to install that technology via the command line. 
  Make sure you follow the docs. Prefer the easy steps instead of all the manual steps. Assume you have the runtime already (node/npx/pip/python...)
  Output JSON strucutre:
  ["command here", "command 2 here"...]`;

  console.log("Building tasks via gpt...");
  const tasksRaw = await openAi(
    `using these docs:\n${docsTextLimit}\nOutput a JSON array of ALL the commands to install ${tech}${versionString} on my ${platform} machine:\n`,
    instructions
  );

  const tasks = JSON.parse(tasksRaw);
  if (!Array.isArray(tasks)) {
    throw new Error(`Bad openai response: ${tasksRaw}`);
  }
  return tasks;
}

export async function executeTasks(tasks) {
  const newTasks = await fitlerCommandsCLI(tasks);

  try {
    for (const task of newTasks) {
      console.log(`Task command: ${task}`);
      runCommand(task);
    }
  } catch (error) {
    console.error("Error executing task:", error);
  }
}

function runCommand(command) {
  const shell = spawn(`sh -c "${command}"`, [], {
    stdio: "inherit",
    shell: true,
  });
  shell.on("close", (code) => {
    console.log("[shell] terminated :", code);
  });
}

async function fitlerCommandsCLI(array) {
  const response = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedItems",
      message: "Select comands to run:",
      choices: array.map((item) => ({
        name: item,
        checked: true, // Set to true to preselect by default
      })),
    },
  ]);

  const selectedItems = response.selectedItems;

  // Filter the original array based on the user's selection
  const filteredArray = array.filter((item) => selectedItems.includes(item));

  return filteredArray;
}
