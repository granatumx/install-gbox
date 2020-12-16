import Ajv from 'ajv';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import Knex from 'knex';
import _ from 'lodash';

const ajv = new Ajv();
const gboxValidator = ajv.compile(yaml.safeLoad(readFileSync('./jsonSchemas/IGboxSpec.json', 'utf8')) as object);

export default async (knex: Knex, defaultMeta: object, gboxSpec: IGboxSpec) => {
  if (!gboxValidator(gboxSpec)) {
    console.log(chalk.bgRedBright.black('Error: Incorrect specification format!'));
    console.error(gboxValidator.errors);
    process.exit();
  }

  console.log(chalk.greenBright(`--->   Removing gbox ${gboxSpec.id} from database ...`));

  const combinedMeta = _.defaults(gboxSpec.meta, defaultMeta);

  let doesExist =
    +(await knex('gbox')
      .count()
      .where({ id: gboxSpec.id }))[0].count > 0;

  if (doesExist) {
    console.log(chalk.greenBright(`--->   Gbox ${gboxSpec.id} does exist in the database, deleting ...`));

    await knex('gbox').del().where({"id": gboxSpec.id});
  } else {
    console.log(chalk.greenBright(`--->   Gbox ${gboxSpec.id} does not exist in the database, cannot delete ...`));
  }
  doesExist =
    +(await knex('gbox')
      .count()
      .where({ id: gboxSpec.id }))[0].count > 0;
  if(doesExist) {
    console.log(chalk.redBright(`--->   Cannot delete ${gboxSpec.id}...`));
  }
};
