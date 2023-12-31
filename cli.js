#!/usr/bin/env node

import { Command } from "commander";

import { getConfig } from "./config.js";
import { generateTasks, executeTasks } from "./scaffold.js";

const program = new Command();
program.version("1.0.0");

program
  .arguments("<framework>:<version> [plugins...]")
  .description("Create a scaffold with specified framework and plugins")
  .action(async (frameworkVersion, plugins) => {
    // Get the OpenAI API key is set
    try {
      const openaiKey = await getConfig();

      const [framework, version] = frameworkVersion.split(":");
      if (!version) version = "*";
      if (!framework || !version) {
        throw new Error(
          "Invalid framework:version format. Use <framework>:<version>."
        );
      }

      // Implement your scaffold logic here
      console.log(
        `Creating scaffold for ${framework} at version ${version}...`
      );
      console.log("Plugins:", plugins);

      console.log(
        `Searching docs and generating tasks for ${framework}:${version}...`
      );
      const tasks = await generateTasks(framework, version);
      await executeTasks(tasks);
    } catch (e) {
      console.error(e.message);
    }
  });

program
  .command("set-key <openai-key>")
  .description("Save OpenAI API key in global config")
  .action(async (openaiKey) => {
    // Save the OpenAI API key to a global config file
    await saveOpenAiKey(openaiKey);
  });

program.parse(process.argv);
