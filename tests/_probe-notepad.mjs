import { chromium } from 'playwright';

const errors = [];
const logs = [];
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => errors.push(`PAGEERROR: ${err.message}\n${err.stack}`));
page.on('dialog', async dialog => {
  logs.push(`[DIALOG] ${dialog.type()}: ${dialog.message()}`);
  await dialog.dismiss();
});

await page.goto('http://localhost:3000/win98-web/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(4000);

// Look for desktop icons
const icons = await page.$$eval('.desktop .explorer-icon', els =>
  els.map(el => ({ label: el.querySelector('.icon-label')?.textContent, path: el.getAttribute('data-path') }))
);
logs.push(`DESKTOP ICONS: ${JSON.stringify(icons)}`);

// Try to double-click Notepad
const notepad = await page.$('.desktop .explorer-icon[data-path*="Notepad"]');
if (notepad) {
  await notepad.dblclick();
  await page.waitForTimeout(2000);
} else {
  logs.push('NOTEPAD ICON NOT FOUND');
}

console.log(logs.join('\n'));
console.log('---ERRORS---');
console.log(errors.join('\n\n'));
await browser.close();
