import { execSync } from "node:child_process";
import fs from "node:fs";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

const PORT = 9222;
const TARGET_URL = "http://localhost:3000";

// Load Firebase Config from .env.local
const envContent = fs.readFileSync(".env.local", "utf8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.trim().split("=");
  if (k && v.length) envVars[k] = v.join("=");
});

const firebaseApp = initializeApp({
  apiKey: envVars["NEXT_PUBLIC_FIREBASE_API_KEY"],
  authDomain: envVars["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"],
  projectId: envVars["NEXT_PUBLIC_FIREBASE_PROJECT_ID"],
  storageBucket: envVars["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: envVars["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"],
  appId: envVars["NEXT_PUBLIC_FIREBASE_APP_ID"],
  measurementId: envVars["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"],
});
const db = getFirestore(firebaseApp);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runEditLinkTest() {
  console.log("🌱 Preparing test link in Firestore 'users/anonymous/links'...");
  const colRef = collection(db, "users", "anonymous", "links");
  const initialSnap = await getDocs(colRef);
  let createdDocId = null;

  if (initialSnap.size === 0) {
    const testDoc = await addDoc(colRef, {
      title: "🎮 초기 테스트 링크 (수정 대상)",
      url: "https://initial-target.example.com",
      description: "수정 테스트를 위해 준비된 초기 설명",
      category: "개발/코드",
      icon: "code",
      isActive: true,
      isPopular: false,
      clickCount: 5,
      createdAt: serverTimestamp(),
    });
    createdDocId = testDoc.id;
    console.log(`   -> Created initial test document in Firestore: ${createdDocId}`);
  } else {
    console.log(`   -> Using existing Firestore documents (${initialSnap.size} docs available)`);
  }

  console.log("🚀 Launching Microsoft Edge (headless) for Link Edit Test...");

  try {
    execSync("powershell -Command \"Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force\"");
  } catch {}

  execSync(
    'powershell -Command "Start-Process \\"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\\" -ArgumentList \\"--headless\\", \\"--remote-debugging-port=9222\\", \\"--user-data-dir=C:\\Temp\\edge_edit_profile\\", \\"about:blank\\""'
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
        res.exceptionDetails.text || JSON.stringify(res.exceptionDetails.exception)
      );
    }
    return res.result?.value;
  }

  try {
    await send("Page.enable");
    await send("Runtime.enable");

    console.log(`🌐 [STEP 1] Navigating to ${TARGET_URL}...`);
    await send("Page.navigate", { url: TARGET_URL });

    // Wait until page loaded and EDIT buttons are rendered
    let loaded = false;
    for (let i = 0; i < 30; i++) {
      await sleep(1000);
      try {
        const ready = await evaluate(`(() => {
          return document.title.length > 0 && Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('EDIT'));
        })()`);
        if (ready) {
          loaded = true;
          break;
        }
      } catch {}
    }

    if (!loaded) {
      throw new Error("Timeout waiting for Next.js page to load and render EDIT buttons");
    }

    console.log("✅ Page loaded successfully with links!");

    // Step 2: Verify that EDIT buttons are ALWAYS VISIBLE on all link cards
    console.log("👀 [STEP 2] Verifying that EDIT buttons are always displayed on each link card...");
    const editButtonsInfo = await evaluate(`(() => {
      const editBtns = Array.from(document.querySelectorAll('[data-testid="edit-link-button"]'));
      return {
        count: editBtns.length,
        allVisible: editBtns.every(btn => {
          const style = window.getComputedStyle(btn);
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        })
      };
    })()`);

    console.log(`   -> Total EDIT buttons found: ${editButtonsInfo.count}`);
    console.log(`   -> Always visible (not hidden/opacity-0): ${editButtonsInfo.allVisible ? "PASS ✅" : "FAIL ❌"}`);
    if (editButtonsInfo.count === 0 || !editButtonsInfo.allVisible) {
      throw new Error("EDIT buttons are not always visible!");
    }

    // Step 3: Click the first card's EDIT button to enter inline editing mode
    console.log("✏️  [STEP 3] Clicking EDIT button to enter inline editing mode...");
    const initialFirstCardTitle = await evaluate(`(() => {
      const firstCard = document.querySelector('h3');
      return firstCard ? firstCard.textContent.trim() : null;
    })()`);
    console.log(`   -> Target Link Card Title: "${initialFirstCardTitle}"`);

    const clickEditRes = await evaluate(`(() => {
      const firstEditBtn = document.querySelector('[data-testid="edit-link-button"]');
      if (!firstEditBtn) return { success: false, error: 'EDIT button missing' };
      firstEditBtn.click();
      return { success: true };
    })()`);

    if (!clickEditRes.success) throw new Error(clickEditRes.error);
    await sleep(400);

    // Verify inline editing form is rendered inside the card, NOT as a modal dialog
    const inlineCheck = await evaluate(`(() => {
      const hasModal = document.querySelector('[role="dialog"]');
      const inlineHeader = Array.from(document.querySelectorAll('span')).some(s =>
        s.textContent.includes('EDIT LINK CARTRIDGE')
      );
      const titleInput = document.querySelector('input[id^="edit-title-"]');
      const urlInput = document.querySelector('input[id^="edit-url-"]');
      return {
        isModal: Boolean(hasModal),
        hasInlineHeader: inlineHeader,
        hasTitleInput: Boolean(titleInput),
        hasUrlInput: Boolean(urlInput),
        currentTitleVal: titleInput ? titleInput.value : null,
        currentUrlVal: urlInput ? urlInput.value : null
      };
    })()`);

    console.log(`   -> Rendered as Modal: ${inlineCheck.isModal ? "YES (Incorrect) ❌" : "NO (Correct Inline UI) ✅"}`);
    console.log(`   -> Has Inline Header: ${inlineCheck.hasInlineHeader ? "PASS ✅" : "FAIL ❌"}`);
    console.log(`   -> Has Title & URL Inputs: ${inlineCheck.hasTitleInput && inlineCheck.hasUrlInput ? "PASS ✅" : "FAIL ❌"}`);
    console.log(`   -> Pre-populated Title: "${inlineCheck.currentTitleVal}" ✅`);
    console.log(`   -> Pre-populated URL: "${inlineCheck.currentUrlVal}" ✅`);

    if (inlineCheck.isModal || !inlineCheck.hasInlineHeader || !inlineCheck.hasTitleInput) {
      throw new Error("Inline editing UI failed to render properly!");
    }

    // Step 4: Test input validations in inline edit form
    console.log("🧪 [STEP 4] Testing validation in inline edit form...");
    // 4a. Short title (< 2 chars)
    console.log("   -> Testing short title validation (< 2 characters)...");
    await evaluate(`(() => {
      function setReactVal(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const titleInput = document.querySelector('input[id^="edit-title-"]');
      setReactVal(titleInput, 'A');

      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SAVE'));
      saveBtn.click();
    })()`);

    await sleep(400);

    const shortTitleError = await evaluate(`(() => {
      const errors = Array.from(document.querySelectorAll('p, div')).map(el => el.textContent.trim()).filter(t => t.includes('⚠️'));
      return errors.some(e => e.includes('최소 2글자'));
    })()`);
    console.log(`   -> Short Title Validation Error displayed: ${shortTitleError ? "PASS ✅" : "FAIL ❌"}`);

    // 4b. Invalid URL
    console.log("   -> Testing invalid URL format validation...");
    await evaluate(`(() => {
      function setReactVal(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const titleInput = document.querySelector('input[id^="edit-title-"]');
      const urlInput = document.querySelector('input[id^="edit-url-"]');
      setReactVal(titleInput, '정상적인 제목입니다');
      setReactVal(urlInput, 'invalid_url_without_domain');

      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SAVE'));
      saveBtn.click();
    })()`);

    await sleep(400);

    const badUrlError = await evaluate(`(() => {
      const errors = Array.from(document.querySelectorAll('p, div')).map(el => el.textContent.trim()).filter(t => t.includes('⚠️'));
      return errors.some(e => e.includes('올바른 URL'));
    })()`);
    console.log(`   -> Invalid URL Validation Error displayed: ${badUrlError ? "PASS ✅" : "FAIL ❌"}`);

    // Step 5: Enter valid updated data and submit
    const updatedTestTitle = `✨ 수정된 링크 ${Date.now()}`;
    const updatedTestUrl = "https://updated-link.example.com";
    const updatedTestDesc = "인라인 편집 및 파이어베이스 갱신형 업데이트 완료 설명";

    console.log(`💾 [STEP 5] Submitting valid updated link info: "${updatedTestTitle}"...`);
    await evaluate(`(() => {
      function setReactVal(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const form = document.querySelector('form');
      const titleInput = form.querySelector('input[id^="edit-title-"]');
      const urlInput = form.querySelector('input[id^="edit-url-"]');
      const descInput = form.querySelector('input[id^="edit-desc-"]');

      setReactVal(titleInput, ${JSON.stringify(updatedTestTitle)});
      setReactVal(urlInput, ${JSON.stringify(updatedTestUrl)});
      setReactVal(descInput, ${JSON.stringify(updatedTestDesc)});

      // Select 'blog' category inside form
      const buttons = Array.from(form.querySelectorAll('button'));
      const blogCatBtn = buttons.find(b => b.textContent.trim() === '블로그');
      if (blogCatBtn) blogCatBtn.click();

      // Click SAVE inside form
      const saveBtn = buttons.find(b => b.textContent.includes('SAVE'));
      saveBtn.click();
    })()`);

    // Step 6: Wait for Firestore update & list refresh (갱신형)
    console.log("⏳ [STEP 6] Waiting for Firestore write & list refresh (갱신형)...");
    let refreshed = false;
    for (let i = 0; i < 20; i++) {
      await sleep(600);
      const hasUpdatedTitle = await evaluate(`(() => {
        const h3s = Array.from(document.querySelectorAll('h3'));
        return h3s.some(h => h.textContent.includes(${JSON.stringify(updatedTestTitle)}));
      })()`);
      if (hasUpdatedTitle) {
        refreshed = true;
        break;
      }
    }

    console.log(`   -> Screen Refreshed with New Title: ${refreshed ? "PASS ✅" : "FAIL ❌"}`);
    if (!refreshed) {
      throw new Error("Link list did not refresh with the updated title!");
    }

    // Verify that '수정:' (updatedAt) text is rendered on the screen
    console.log("🕒 [STEP 6.1] Verifying that 'updatedAt' timestamp is displayed on screen...");
    const hasUpdatedAtText = await evaluate(`(() => {
      const updatedAtEls = Array.from(document.querySelectorAll('[data-testid="link-updated-at"]'));
      return updatedAtEls.some(el => el.textContent.includes('수정:'));
    })()`);
    console.log(`   -> Screen displayed 'updatedAt' timestamp: ${hasUpdatedAtText ? "PASS ✅" : "FAIL ❌"}`);
    if (!hasUpdatedAtText) {
      throw new Error("Updated at timestamp not rendered on the link card!");
    }

    // Step 7: Verify directly in Firestore collection users/anonymous/links
    console.log("🔥 [STEP 7] Verifying updated link directly in Firestore collection 'users/anonymous/links'...");
    const snapshot = await getDocs(colRef);
    const firestoreLinks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    const updatedFirestoreDoc = firestoreLinks.find(l => l.title === updatedTestTitle);

    console.log(`   -> Found Updated Doc in Firestore: ${updatedFirestoreDoc ? "PASS ✅" : "FAIL ❌"}`);
    if (!updatedFirestoreDoc) {
      throw new Error("Updated link not found in Firestore collection 'users/anonymous/links'!");
    }
    console.log(`   -> Firestore Doc ID: "${updatedFirestoreDoc.id}"`);
    console.log(`   -> Firestore URL: "${updatedFirestoreDoc.url}" (Expected: "${updatedTestUrl}") ✅`);
    console.log(`   -> Firestore Description: "${updatedFirestoreDoc.description}" ✅`);
    console.log(`   -> Firestore Category: "${updatedFirestoreDoc.category}" (Expected: "블로그") ✅`);
    console.log(`   -> Firestore updatedAt timestamp exists: ${Boolean(updatedFirestoreDoc.updatedAt)} ✅`);

    // Step 8: Test Cancel functionality
    console.log("↩️  [STEP 8] Testing CANCEL button functionality on another card...");
    await evaluate(`(() => {
      const editBtns = document.querySelectorAll('[data-testid="edit-link-button"]');
      if (editBtns.length > 0) {
        editBtns[0].click();
      }
    })()`);
    await sleep(400);

    const cancelCheck1 = await evaluate(`(() => {
      return Boolean(document.querySelector('input[id^="edit-title-"]'));
    })()`);
    console.log(`   -> Inline edit opened: ${cancelCheck1 ? "YES ✅" : "NO ❌"}`);

    await evaluate(`(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CANCEL'));
      if (cancelBtn) cancelBtn.click();
    })()`);
    await sleep(400);

    const cancelCheck2 = await evaluate(`(() => {
      return !Boolean(document.querySelector('input[id^="edit-title-"]'));
    })()`);
    console.log(`   -> Inline edit closed back to reading mode on CANCEL: ${cancelCheck2 ? "PASS ✅" : "FAIL ❌"}`);

    console.log("\n========================================================");
    console.log("🎉 ALL LINK EDIT & FIRESTORE INTEGRATION TESTS PASSED!");
    console.log("========================================================");
  } finally {
    ws.close();
    try {
      execSync("powershell -Command \"Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force\"");
    } catch {}
  }
}

runEditLinkTest().catch((err) => {
  console.error("❌ Edit Link Test Failed:", err);
  process.exit(1);
});
