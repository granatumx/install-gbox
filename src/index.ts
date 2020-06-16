import chalk from 'chalk';
import process from 'process';
import { readFileSync } from 'fs';
import glob from 'glob';
import yaml from 'js-yaml';
import Knex from 'knex';
import * as path from 'path';
import {cli, option} from 'typed-cli';
import installOnePackage from './installOnePackage';
import installOneRecipe from './installOneRecipe';

(async () => {
const {options} = cli({
  options : {
    listYAML: option.string
      .alias('l')
      .description("YAML containing a list of gboxes to install"),
    gboxDir: option.string
      .alias('g')
      .description("Location of gbox itself, must contain package.yaml"),
    recipesDir: option.string
      .alias('r')
      .description("Location of recipe directory")
  },
  description : "installs gboxes and/or recipes"
});

const {listYAML, gboxDir, recipesDir} = options;

if(listYAML == undefined && gboxDir == undefined && recipesDir == undefined) {
  console.log(chalk.redBright(`==> Error in usage, require one of listYAML, gboxDir, or recipesDir`));
  console.log(chalk.redBright(`==> Use --help for help`));
  process.exit(1);
}

const knex = await Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://postgres:12qw@192.168.1.101:5432/granatum',
});

if(listYAML) {
  console.log(chalk.blueBright(`===> Install packages`));
  const listOfPackages = yaml.safeLoad(readFileSync(listYAML, 'utf8')) as string[];
  for (const p of listOfPackages) {
    const fullPath = path.resolve(p);
    const packageSpecPath = path.resolve(fullPath, 'package.yaml');
    console.log(chalk.blueBright(`===>   Loading package spec from ${packageSpecPath}`));
    const packageSpec = yaml.safeLoad(readFileSync(packageSpecPath, 'utf8')) as IPackageSpec;
    await installOnePackage(knex, fullPath, packageSpec, { verbose: true });
  }
} 
if(gboxDir) {
  const fullPath = path.resolve(gboxDir);
  const packageSpecPath = path.resolve(fullPath, 'package.yaml');
  console.log(chalk.blueBright(`===>   Loading package spec from ${packageSpecPath}`));
  const packageSpec = yaml.safeLoad(readFileSync(packageSpecPath, 'utf8')) as IPackageSpec;
  await installOnePackage(knex, fullPath, packageSpec, { verbose: true });
} 
if(recipesDir) {
  const recipeYamls = glob.sync(`${recipesDir}/*.yaml`);
  console.log(chalk.blueBright(`===> Install recipes`));
  await knex('recipe_gbox').delete();
  for (const y of recipeYamls) {
    console.log(chalk.blueBright(`===>   Loading recipe spec from ${y}`));
    const recipeSpec = yaml.safeLoad(readFileSync(y, 'utf8')) as IRecipeSpec;
    await installOneRecipe(knex, recipeSpec);
  }
}

knex.destroy();

console.log(chalk.blueBright(`.... All done!`));

})();
