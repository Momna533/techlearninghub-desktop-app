/**
 * Headless-style UI smoke for the application shell.
 * Enabled with SHELL_SMOKE=1. Exercises login, nav, unauthorized route, logout.
 */
async function runShellSmoke(window) {
  async function evaluate(script) {
    return window.webContents.executeJavaScript(script, true);
  }

  async function waitFor(predicateScript, timeoutMs = 8000) {
    const started = Date.now();

    while (Date.now() - started < timeoutMs) {
      const ready = await evaluate(predicateScript);
      if (ready) return;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    throw new Error(`Timed out waiting for: ${predicateScript}`);
  }

  async function step(name, fn) {
    try {
      await fn();
      console.log(`[shell-smoke] PASS ${name}`);
    } catch (error) {
      console.error(`[shell-smoke] FAIL ${name}:`, error.message);
      throw error;
    }
  }

  await step('ensure logged out before login', async () => {
    await evaluate(`
      (async () => {
        const session = await window.desktop.auth.getSession();
        if (session.authenticated) {
          await window.desktop.auth.logout();
          window.location.reload();
        }
        return true;
      })()
    `);

    await waitFor(`Boolean(document.querySelector('.auth-page'))`);
  });

  await step('login as developer', async () => {
    await evaluate(`
      (async () => {
        const email = document.querySelector('#email');
        const password = document.querySelector('#password');
        const form = document.querySelector('.auth-form');

        const setNativeValue = (element, value) => {
          const proto = Object.getPrototypeOf(element);
          const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
          descriptor.set.call(element, value);
          element.dispatchEvent(new Event('input', { bubbles: true }));
        };

        setNativeValue(email, 'developer@techlearninghub.local');
        setNativeValue(password, 'Developer123!');
        form.requestSubmit();
        return true;
      })()
    `);

    await waitFor(`Boolean(document.querySelector('.app-frame'))`);
  });

  await step('permission-aware navigation visible', async () => {
    const nav = await evaluate(`
      Array.from(document.querySelectorAll('.nav-link'))
        .map((link) => link.textContent.trim())
    `);

    const expected = ['Dashboard', 'Projects', 'Tasks', 'Teams', 'Users', 'Documents'];
    const missing = expected.filter((label) => !nav.includes(label));
    if (missing.length > 0) {
      throw new Error(`Missing nav items: ${missing.join(', ')} (got ${nav.join(', ')})`);
    }

    const forbidden = ['Students', 'Invoices', 'Employees', 'Settings', 'Roles', 'Leads'];
    const leaked = forbidden.filter((label) => nav.includes(label));
    if (leaked.length > 0) {
      throw new Error(`Nav leaked unauthorized items: ${leaked.join(', ')}`);
    }
  });

  await step('navigate to projects placeholder', async () => {
    await evaluate(`window.location.hash = '#/software/projects'`);
    await waitFor(`
      document.querySelector('.placeholder-page h2')?.textContent?.trim() === 'Projects'
    `);
  });

  await step('unauthorized route shows access denied', async () => {
    await evaluate(`window.location.hash = '#/finance/invoices'`);
    await waitFor(`
      document.querySelector('.unauthorized-page h2')?.textContent?.trim() === 'Access denied'
    `);
  });

  await step('logout returns to login screen', async () => {
    await evaluate(`document.querySelector('.logout-button')?.click()`);
    await waitFor(`
      Boolean(document.querySelector('.auth-page'))
      && !document.querySelector('.app-frame')
    `);

    const session = await evaluate(`window.desktop.auth.getSession()`);
    if (session.authenticated) {
      throw new Error('Session still authenticated after logout');
    }
  });

  console.log('[shell-smoke] All shell smoke checks passed.');
}

module.exports = {
  runShellSmoke,
};
