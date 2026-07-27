import * as dotenv from 'dotenv';
import path from 'path';
import environmentMap, { EnvironmentConfig } from './environments';

// Always load the single `.env` file for the initial minimal setup
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const environment = environmentMap.qa;

const envConfig: EnvironmentConfig = {
  ...environment,
  baseUrl: process.env.BASE_URL || environment.baseUrl,
  apiUrl: process.env.API_URL || environment.apiUrl,
  username: process.env.APP_USERNAME || environment.username,
  password: process.env.APP_PASSWORD || environment.password,
  waitTimeout: Number(process.env.WAIT_TIMEOUT || environment.waitTimeout)
};

export default envConfig;
