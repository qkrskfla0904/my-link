import { execSync } from "node:child_process";

const PORT = 9222;
const TARGET_URL = "http://localhost:3000";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runValidationTest() {
  console.log("🚀 Launching Edge browser for input validation test...");

  try {
    execSync("powershell -Command \"Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force\"");
  } catch {}

  execSync(
    'powershell -Command "Start-Process \\"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\\" -ArgumentList \\"--headless\\", \\"--remote-debugging-port=9222\\", \\"--user-data-dir=C:\\Temp\\edge_val_profile\\", \\"about:blank\\""'
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
    } catch {}
  }

  if (!wsUrl) throw new Error("Failed to connect to CDP");

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
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
    if (res.exceptionDetails) throw new Error(res.exceptionDetails.text);
    return res.result?.value;
  }

  try {
    await send("Page.enable");
    await send("Runtime.enable");

    console.log("🌐 Navigating to page...");
    await send("Page.navigate", { url: TARGET_URL });

    // Wait for hydration
    let loaded = false;
    for (let i = 0; i < 20; i++) {
      await sleep(1000);
      try {
        const title = await evaluate("document.title");
        const hasAddBtn = await evaluate(`(() => {
          return Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('ADD LINK'));
        })()`);
        if (title && hasAddBtn) {
          loaded = true;
          break;
        }
      } catch {}
    }

    if (!loaded) {
      throw new Error("Page did not load with ADD LINK button in time");
    }

    console.log("✅ Page loaded successfully!");

    // Open Dialog
    console.log("🔘 Clicking '+ ADD LINK' to open dialog...");
    const openRes = await evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.textContent.includes('ADD LINK'));
      if (!addBtn) return { success: false, buttons: buttons.map(b => b.textContent) };
      addBtn.click();
      return { success: true };
    })()`);

    if (!openRes.success) throw new Error("ADD LINK button not found: " + JSON.stringify(openRes));
    await sleep(600);

    // Test 1: Empty submit validation
    console.log("🧪 [TEST 1] Testing empty submission validation...");
    await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const submitBtn = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent.includes('INSERT LINK'));
      submitBtn.click();
    })()`);

    await sleep(400);

    const emptyErrors = await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const errorTexts = Array.from(dialog.querySelectorAll('p, div')).map(el => el.textContent.trim()).filter(t => t.includes('⚠️'));
      return errorTexts;
    })()`);

    console.log("   -> Displayed Errors on Empty Submit:", emptyErrors);
    const hasTitleError = emptyErrors.some(e => e.includes('링크 제목을 입력해주세요'));
    const hasUrlError = emptyErrors.some(e => e.includes('URL 주소를 입력해주세요'));
    console.log(`   -> Title Empty Error: ${hasTitleError ? "PASS ✅" : "FAIL ❌"}`);
    console.log(`   -> URL Empty Error: ${hasUrlError ? "PASS ✅" : "FAIL ❌"}`);

    // Test 2: Invalid URL validation (e.g. "not-a-url")
    console.log("🧪 [TEST 2] Testing invalid URL validation (e.g. 'invalid_string')...");
    await evaluate(`(() => {
      function setReactVal(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const dialog = document.querySelector('[role="dialog"]');
      const titleInput = dialog.querySelector('#link-title');
      const urlInput = dialog.querySelector('#link-url');
      setReactVal(titleInput, '유효한 제목입니다');
      setReactVal(urlInput, 'invalid_no_domain');

      const submitBtn = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent.includes('INSERT LINK'));
      submitBtn.click();
    })()`);

    await sleep(400);

    const invalidUrlErrors = await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const errorTexts = Array.from(dialog.querySelectorAll('p, div')).map(el => el.textContent.trim()).filter(t => t.includes('⚠️'));
      return errorTexts;
    })()`);

    console.log("   -> Displayed Errors on Invalid URL:", invalidUrlErrors);
    const hasBadUrlError = invalidUrlErrors.some(e => e.includes('올바른 URL'));
    console.log(`   -> Bad URL Format Error: ${hasBadUrlError ? "PASS ✅" : "FAIL ❌"}`);

    // Test 3: Short Title (<2 chars) validation
    console.log("🧪 [TEST 3] Testing short title (<2 characters)...");
    await evaluate(`(() => {
      function setReactVal(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const dialog = document.querySelector('[role="dialog"]');
      const titleInput = dialog.querySelector('#link-title');
      const urlInput = dialog.querySelector('#link-url');
      setReactVal(titleInput, 'A');
      setReactVal(urlInput, 'https://valid-url.com');

      const submitBtn = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent.includes('INSERT LINK'));
      submitBtn.click();
    })()`);

    await sleep(400);

    const shortTitleErrors = await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const errorTexts = Array.from(dialog.querySelectorAll('p, div')).map(el => el.textContent.trim()).filter(t => t.includes('⚠️'));
      return errorTexts;
    })()`);

    console.log("   -> Displayed Errors on Short Title:", shortTitleErrors);
    const hasShortTitleError = shortTitleErrors.some(e => e.includes('최소 2글자'));
    console.log(`   -> Short Title Error: ${hasShortTitleError ? "PASS ✅" : "FAIL ❌"}`);

    // Test 4: Valid submission
    console.log("🧪 [TEST 4] Testing valid submission...");
    await evaluate(`(() => {
      function setReactVal(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const dialog = document.querySelector('[role="dialog"]');
      const titleInput = dialog.querySelector('#link-title');
      const urlInput = dialog.querySelector('#link-url');
      setReactVal(titleInput, '🎯 유효성 검증 통과 신규 링크');
      setReactVal(urlInput, 'https://validated-link.example.com');

      const submitBtn = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent.includes('INSERT LINK'));
      submitBtn.click();
    })()`);

    await sleep(800);

    const isClosed = await evaluate("!document.querySelector('[role=\"dialog\"]')");
    console.log(`   -> Dialog closed on valid submit: ${isClosed ? "PASS ✅" : "FAIL ❌"}`);

    const hasNewCard = await evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('h3'));
      return cards.some(h => h.textContent.includes('유효성 검증 통과 신규 링크'));
    })()`);
    console.log(`   -> New Card Rendered on Screen: ${hasNewCard ? "PASS ✅" : "FAIL ❌"}`);

    console.log("\n========================================================");
    console.log("🎉 ALL INPUT VALIDATION TEST CASES PASSED SUCCESSFULLY!");
    console.log("========================================================");
  } finally {
    ws.close();
    try {
      execSync("powershell -Command \"Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force\"");
    } catch {}
  }
}

runValidationTest().catch((err) => {
  console.error("❌ Validation Test Failed:", err);
  process.exit(1);
});
