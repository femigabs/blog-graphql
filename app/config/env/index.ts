import * as rootPath from 'app-root-path';
import development from './development';
import test from './test';
import production from './production';

declare const process: {
  env: {
    NODE_ENV: string;
    DATABASE_URL: string;
    PORT: number
  };
};

const { NODE_ENV, PORT } = process.env;

const currentEnv = {
  development,
  test,
  production,
}[NODE_ENV ?? 'development'];

export default {
  ...process.env,
  ...currentEnv,
  rootPath,
  NODE_ENV,
  PORT,
};
