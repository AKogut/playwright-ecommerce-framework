// Records the end-to-end SauceDemo journey (login → add to cart → checkout →
// confirmation) as a video, for the animated demo in the README. Run locally:
//
//   node scripts/record-demo.mjs
//   # then convert the produced .webm to an optimized GIF with ffmpeg, e.g.
//   ffmpeg -i <webm> -vf "fps=12,scale=900:-1:flags=lanczos,palettegen" -y /tmp/pal.png
//   ffmpeg -i <webm> -i /tmp/pal.png -lavfi "fps=12,scale=900:-1:flags=lanczos[x];[x][1:v]paletteuse" -y docs/assets/demo-run.gif
//
// This is a portfolio asset generator, not part of the test suite or CI.

import { config as dotenvConfig } from 'dotenv';
import { chromium } from '@playwright/test';
import { mkdir, rm, readdir, rename } from 'node:fs/promises';
import path from 'node:path';

dotenvConfig({ quiet: true });

const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com/';
const USER = process.env.STANDARD_USER_USERNAME ?? 'standard_user';
const PASS = process.env.STANDARD_USER_PASSWORD ?? 'secret_sauce';
const OUT_DIR = process.env.DEMO_OUT_DIR ?? 'test-results/demo';
const beat = (page, ms = 900) => page.waitForTimeout(ms);

const main = async () => {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  await page.goto(BASE_URL);
  await beat(page);
  await page.locator('[data-test="username"]').pressSequentially(USER, { delay: 55 });
  await page.locator('[data-test="password"]').pressSequentially(PASS, { delay: 55 });
  await beat(page, 400);
  await page.locator('[data-test="login-button"]').click();

  await page.waitForURL('**/inventory.html');
  await beat(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await beat(page, 500);
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await beat(page, 500);
  await page.locator('[data-test="shopping-cart-link"]').click();

  await page.waitForURL('**/cart.html');
  await beat(page);
  await page.locator('[data-test="checkout"]').click();

  await page.waitForURL('**/checkout-step-one.html');
  await beat(page, 500);
  await page.locator('[data-test="firstName"]').pressSequentially('Ada', { delay: 55 });
  await page.locator('[data-test="lastName"]').pressSequentially('Lovelace', { delay: 55 });
  await page.locator('[data-test="postalCode"]').pressSequentially('10001', { delay: 55 });
  await beat(page, 400);
  await page.locator('[data-test="continue"]').click();

  await page.waitForURL('**/checkout-step-two.html');
  await beat(page);
  await page.locator('[data-test="finish"]').click();

  await page.waitForURL('**/checkout-complete.html');
  await page.locator('[data-test="complete-header"]').waitFor();
  await beat(page, 1600);

  await context.close(); // flushes the video
  await browser.close();

  // Give the single recorded video a stable name.
  const files = (await readdir(OUT_DIR)).filter((f) => f.endsWith('.webm'));
  if (files.length > 0) {
    const target = path.join(OUT_DIR, 'demo-run.webm');
    await rename(path.join(OUT_DIR, files[0]), target);
    console.log(`Recorded ${target}`);
  } else {
    console.error('No video was produced.');
    process.exit(1);
  }
};

await main();
