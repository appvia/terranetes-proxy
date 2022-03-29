import yargs from "yargs";
import * as mod from "./index";
const options = yargs
  .usage("Usage: -t <terraform module url>")
  .option("terraform", {
    alias: "t",
    describe: "Terraform Module to use",
    type: "string",
    demandOption: true,
  }).argv;

(async () => {
  //@ts-ignore
  const parsed = await mod.parsetf(options.terraform);
  const variables = mod.formatVariables(parsed);
  const valuesFile = mod.makeValuesYaml(variables);
  process.stdout.write(valuesFile);
})();
