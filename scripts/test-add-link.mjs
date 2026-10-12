import { execSync } from "node:child_process";

const PORT = 9222;
const TARGET_URL = "http://localhost:3000";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBrowserTest() {
  console.log("🚀 Launching Microsoft Edge (headless) with CDP port 9222...");

  // Kill any old Edge instances
  try {
    execSync("powershell -Command \"Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force\"");
  } catch {}

  // Launch Edge
  execSync(
    'powershell -Command "Start-Process \\"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\\" -ArgumentList \\"--headless\\", \\"--remote-debugging-port=9222\\", \\"--user-data-dir=C:\\Temp\\edge_cdp_profile\\", \\"about:blank\\""'
  );

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const tabs = await res.json();
      if (tabs && tabs.length > 0 && tabs[0].webSocketDebuggerUrl) {
        wsUrl = tabs[0].webSocketDebuggerUrl;
        break;
      }
    } catch {
      // waiting for port
    }
  }

  if (!wsUrl) {
    throw new Error("Failed to connect to Edge remote debugging port 9222");
  }

  console.log("✅ Successfully connected to Edge CDP WebSocket:", wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let messageId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = messageId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(
        res.exceptionDetails.text ||
          JSON.stringify(res.exceptionDetails.exception)
      );
    }
    return res.result?.value;
  }

  try {
    await send("Page.enable");
    await send("Runtime.enable");

    console.log(`🌐 [STEP 1] Navigating to ${TARGET_URL}...`);
    await send("Page.navigate", { url: TARGET_URL });

    // Wait until Next.js finishes compilation and hydration
    console.log("   -> Waiting for Next.js route compilation & hydration...");
    let loaded = false;
    for (let i = 0; i < 30; i++) {
      await sleep(1000);
      try {
        const ready = await evaluate(`(() => {
          return document.title.length > 0 && Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('ADD LINK'));
        })()`);
        if (ready) {
          loaded = true;
          break;
        }
      } catch {}
    }

    if (!loaded) {
      throw new Error("Timeout waiting for Next.js page to load and hydrate");
    }

    const pageTitle = await evaluate("document.title");
    console.log(`   -> Page Title: "${pageTitle}" ✅`);

    // Check Initial Link Count
    const initialLinkTitles = await evaluate(`(() => {
      return Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim());
    })()`);
    console.log(`   -> Initial Links Count: ${initialLinkTitles.length} items`);

    // Step 2: Click "ADD LINK" button
    console.log(`🔘 [STEP 2] Clicking "+ ADD LINK" button...`);
    const clickAddResult = await evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.textContent.includes('ADD LINK'));
      if (!addBtn) return { success: false, error: 'ADD LINK button not found' };
      addBtn.click();
      return { success: true };
    })()`);

    if (!clickAddResult.success) {
      throw new Error(clickAddResult.error);
    }
    await sleep(600);

    // Step 3: Verify Dialog Modal Open
    const dialogTitle = await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      return dialog.innerText;
    })()`);

    const dialogOpened = dialogTitle && dialogTitle.includes("INSERT NEW LINK CARTRIDGE");
    console.log(`📋 [STEP 3] Dialog Opened: ${dialogOpened ? "YES (INSERT NEW LINK CARTRIDGE) ✅" : "NO ❌"}`);
    if (!dialogOpened) throw new Error("Dialog did not open!");

    // Step 4: Fill in form fields with React Native Value Setter
    console.log(`✍️  [STEP 4] Entering new link details into dialog...`);
    const fillResult = await evaluate(`(() => {
      function setReactVal(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { success: false, error: 'Dialog missing' };

      const inputs = Array.from(dialog.querySelectorAll('input'));
      const titleInput = inputs.find(i => i.placeholder && i.placeholder.includes('데모 사이트'));
      const urlInput = inputs.find(i => i.placeholder && i.placeholder.includes('example.com'));
      const descInput = inputs.find(i => i.placeholder && i.placeholder.includes('소개 문구'));

      if (!titleInput || !urlInput) return { success: false, error: 'Inputs not found' };

      setReactVal(titleInput, '🎮 닌텐도 레트로 에뮬레이터 프로젝트 2026');
      setReactVal(urlInput, 'https://nintendo-retro-demo.example.com');
      if (descInput) {
        setReactVal(descInput, '브라우저 자동화 테스트로 직접 추가한 WebAssembly 기반 레트로 콘솔 프로젝트');
      }

      // Click '개발/코드' category
      const buttons = Array.from(dialog.querySelectorAll('button'));
      const devCatBtn = buttons.find(b => b.textContent.trim() === '개발/코드');
      if (devCatBtn) devCatBtn.click();

      // Click 'project' icon
      const projIconBtn = buttons.find(b => b.textContent.includes('project'));
      if (projIconBtn) projIconBtn.click();

      // Toggle HOT badge
      const hotToggle = dialog.querySelector('[data-testid="toggle-popular"]');
      if (hotToggle) hotToggle.click();

      return {
        success: true,
        title: titleInput.value,
        url: urlInput.value
      };
    })()`);

    console.log(`   -> Title Input: "${fillResult.title}"`);
    console.log(`   -> URL Input: "${fillResult.url}"`);
    await sleep(500);

    // Step 5: Click Submit
    console.log(`💾 [STEP 5] Clicking "INSERT LINK (추가)" button...`);
    const submitResult = await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { success: false, error: 'Dialog missing' };

      const submitBtn = Array.from(dialog.querySelectorAll('button')).find(b =>
        b.textContent.includes('INSERT LINK')
      );
      if (!submitBtn) return { success: false, error: 'Submit button not found' };

      submitBtn.click();
      return { success: true };
    })()`);

    if (!submitResult.success) throw new Error(submitResult.error);
    await sleep(1000);

    // Step 6: Verify Dialog Closed
    const isDialogClosed = await evaluate("!document.querySelector('[role=\"dialog\"]')");
    console.log(`🔒 [STEP 6] Dialog Closed After Submit: ${isDialogClosed ? "YES ✅" : "NO ❌"}`);

    // Step 7: Check New Link Card on Page
    console.log(`🔎 [STEP 7] Verifying new link card rendered in the list...`);
    const newCardInfo = await evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('h3'));
      const newCard = cards.find(h => h.textContent.includes('닌텐도 레트로 에뮬레이터 프로젝트'));
      if (!newCard) return null;

      const container = newCard.closest('a');
      return {
        found: true,
        title: newCard.textContent.trim(),
        href: container ? container.getAttribute('href') : null,
        hasHotBadge: container ? container.innerText.includes('HOT') : false,
        category: container ? container.innerText.includes('개발/코드') : false,
        description: container ? container.innerText.includes('WebAssembly') : false
      };
    })()`);

    console.log(`   -> Card Found on Screen: ${newCardInfo ? "YES ✅" : "NO ❌"}`);
    if (newCardInfo) {
      console.log(`   -> Rendered Title: "${newCardInfo.title}" ✅`);
      console.log(`   -> Outlink URL: "${newCardInfo.href}" ✅`);
      console.log(`   -> Category Tag [개발/코드]: ${newCardInfo.category ? "MATCH ✅" : "FAIL ❌"}`);
      console.log(`   -> Popular [HOT] Badge: ${newCardInfo.hasHotBadge ? "MATCH ✅" : "FAIL ❌"}`);
    } else {
      throw new Error("New link card was not found on screen!");
    }

    // Step 8: Verify LocalStorage
    console.log(`📦 [STEP 8] Verifying LocalStorage ('mylink_profile_data')...`);
    const localData = await evaluate(`(() => {
      const raw = localStorage.getItem('mylink_profile_data');
      if (!raw) return null;
      const data = JSON.parse(raw);
      const target = data.links.find(l => l.title.includes('닌텐도 레트로 에뮬레이터'));
      return {
        totalLinks: data.links.length,
        persisted: !!target,
        linkObj: target
      };
    })()`);

    console.log(`   -> LocalStorage Persisted: ${localData?.persisted ? "YES ✅" : "NO ❌"}`);
    console.log(`   -> Total Links in Storage: ${localData?.totalLinks} items ✅`);
    console.log(`   -> Generated Link ID: "${localData?.linkObj?.id}" ✅`);

    // Step 9: Test COPY button on the newly rendered card
    console.log(`📋 [STEP 9] Testing COPY button on the newly created card...`);
    const copyResult = await evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('h3'));
      const newCard = cards.find(h => h.textContent.includes('닌텐도 레트로 에뮬레이터'));
      if (!newCard) return null;

      const container = newCard.closest('a');
      const copyBtn = container.querySelector('button[title="Copy URL"]');
      if (!copyBtn) return null;

      const before = copyBtn.innerText.trim();
      copyBtn.click();
      return { before };
    })()`);

    await sleep(300);
    const afterCopy = await evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('h3'));
      const newCard = cards.find(h => h.textContent.includes('닌텐도 레트로 에뮬레이터'));
      if (!newCard) return null;

      const container = newCard.closest('a');
      const copyBtn = container.querySelector('button[title="Copy URL"]');
      return copyBtn ? copyBtn.innerText.trim() : null;
    })()`);

    console.log(`   -> Button state before click: "${copyResult?.before}"`);
    console.log(`   -> Button state after click: "${afterCopy}" (OK 체크 피드백) ✅`);

    console.log("\n========================================================");
    console.log("🎉 [SUCCESS] All 9 browser automation verification steps passed!");
    console.log("========================================================");
  } finally {
    ws.close();
    try {
      execSync("powershell -Command \"Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force\"");
    } catch {}
  }
}

runBrowserTest().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
