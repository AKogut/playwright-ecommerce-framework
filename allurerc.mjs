import { defineConfig } from 'allure';

export default defineConfig({
  historyPath: process.env.ALLURE_HISTORY_PATH,
  historyLimit: 30,
});
