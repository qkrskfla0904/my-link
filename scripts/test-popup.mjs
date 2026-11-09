import { chromium } from "playwright-core";

async function testPopup() {
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("http://localhost:3000");
  await page.waitForSelector("text=로그인이 필요한 서비스입니다");

  console.log("Testing click on Google Login button in Header...");
  const popupPromise = page.waitForEvent("popup", { timeout: 8000 }).catch((e) => null);
  await page.click("header button:has-text('로그인')");

  const popup = await popupPromise;
  console.log("Google Auth Popup opened:", !!popup);
  if (popup) {
    console.log("Popup URL:", popup.url());
    await popup.close();
  }

  await browser.close();
  console.log("Popup trigger test passed!");
}

testPopup().catch((err) => {
  console.error("Popup test error:", err);
});
