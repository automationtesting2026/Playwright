export interface EnvironmentConfig {
  name: string;
  baseUrl: string;
  apiUrl: string;
  username: string;
  password: string;
  waitTimeout: number;
}

const environmentMap: Record<string, EnvironmentConfig> = {
  qa: {
    name: 'qa',
    baseUrl: 'https://app.qa.example.com',
    apiUrl: 'https://api.qa.example.com',
    username: 'qa.user@example.com',
    password: 'Password123',
    waitTimeout: 15000
  },
  uat: {
    name: 'uat',
    baseUrl: 'https://app.uat.example.com',
    apiUrl: 'https://api.uat.example.com',
    username: 'uat.user@example.com',
    password: 'Password123',
    waitTimeout: 15000
  },
  prod: {
    name: 'prod',
    baseUrl: 'https://app.example.com',
    apiUrl: 'https://api.example.com',
    username: 'prod.user@example.com',
    password: 'Password123',
    waitTimeout: 15000
  }
};

export default environmentMap;
