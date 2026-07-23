import * as dotenv from 'dotenv';
import path from 'path';
import environmentMap, { EnvironmentConfig } from './environments';

const envFile = process.env.TEST_ENV ? `.env.${process.env.TEST_ENV}` : '.env';
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({ path: envPath });

const testEnv = process.env.TEST_ENV || process.env.NODE_ENV || 'qa';
const environment = environmentMap[testEnv.toLowerCase()] ?? environmentMap.qa;

const envConfig: EnvironmentConfig = {
  ...environment,
  baseUrl: process.env.BASE_URL || environment.baseUrl,
  apiUrl: process.env.API_URL || environment.apiUrl,
  username: process.env.APP_USERNAME || environment.username,
  password: process.env.APP_PASSWORD || environment.password,
  waitTimeout: Number(process.env.WAIT_TIMEOUT || environment.waitTimeout)
};

export default envConfig;
