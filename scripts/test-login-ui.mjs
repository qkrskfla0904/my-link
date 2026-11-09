import { chromium } from "playwright-core";

async function testUI() {
  console.log("Starting browser check on http://localhost:3000...");
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("http://localhost:3000");

  // Wait for auth loading to finish and gate banner to appear
  await page.waitForSelector("text=로그인이 필요한 서비스입니다", { timeout: 10000 });

  console.log("Page loaded. Title:", await page.title());

  // Check Header Google Login button
  const headerLoginBtn = await page.$("header button:has-text('Google 로그인')");
  console.log("Header Google Login Button exists:", !!headerLoginBtn);

  // Check Guest Mode / Logged-Out Explanation view
  const bodyText = await page.innerText("body");
  const hasLockNotice = bodyText.includes("로그인이 필요한 서비스입니다");
  const hasFirestorePathNotice = bodyText.includes("users/{user.uid}/links") || bodyText.includes("users/{uid}/links");
  const hasCTA = bodyText.includes("Google 계정으로 로그인하고 시작하기");
  const hasPreview = bodyText.includes("미리보기");

  console.log("Has Lock Notice:", hasLockNotice);
  console.log("Has Firestore Path Notice:", hasFirestorePathNotice);
  console.log("Has CTA Button:", hasCTA);
  console.log("Has Preview section:", hasPreview);

  // Take a full page screenshot
  await page.screenshot({ path: "scripts/screenshot-logged-out-resolved.png", fullPage: true });
  console.log("Screenshot saved to scripts/screenshot-logged-out-resolved.png");

  await browser.close();
}

testUI().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
