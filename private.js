(() => {
  'use strict';

  // ── 스타일은 이 파일 안에 가둔다(Shadow DOM). 페이지 CSS가 바뀌어도 여기는 영향받지 않는다.
  const CSS = `
:host { all: initial; --surface:#fff; --surface-alt:#f7f5f0; --border-color:#e6e2db; --border-hover:#c8c0b4;
  --text-main:#1f1b18; --text-sub:#59524c; --text-muted:#635a52; --blue:#0369a1; --blue-bg:#f0f9ff;
  --mint:#0f766e; --mint-bg:#f0fdf4; --red:#b91c1c; --radius:8px;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size:16px; line-height:1.6; color:var(--text-main); }
*, *::before, *::after { box-sizing:border-box; }
[hidden] { display:none !important; }
button, input { font:inherit; }
p, h2, h3, ul { margin:0; padding:0; }

.corner-btn { position:fixed; z-index:2147483000;
  right:max(1rem, env(safe-area-inset-right)); bottom:max(1rem, env(safe-area-inset-bottom));
  display:flex; align-items:center; gap:0.5rem; padding:0.6rem 0.95rem;
  background:var(--surface); color:var(--text-main); border:2px solid var(--red); border-radius:999px;
  font-size:0.85rem; font-weight:700; cursor:pointer; box-shadow:0 4px 20px rgba(31,27,24,0.15); }
.corner-btn:hover { background:#fef2f2; }
.corner-btn .state { font-size:0.72rem; font-weight:700; padding:0.1rem 0.45rem; border-radius:999px; background:#fef2f2; color:var(--red); }
.corner-btn[data-open="true"] .state { background:var(--mint-bg); color:var(--mint); }
.corner-btn:focus-visible, .pz-btn:focus-visible, input:focus-visible, summary:focus-visible, pre:focus-visible { outline:3px solid var(--blue); outline-offset:2px; }

dialog.zone { width:min(42rem, calc(100vw - 2rem)); max-height:calc(100vh - 2rem); overflow:auto; padding:1.5rem;
  border:2px solid var(--red); border-radius:var(--radius); background:var(--surface); color:var(--text-main); }
dialog.zone::backdrop { background:rgba(22,20,18,0.55); }
.zone-head { display:flex; gap:1rem; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; }
.zone-head h2 { font-size:1.3rem; font-weight:900; letter-spacing:-0.04em; }
.zone-sub { font-size:0.85rem; color:var(--red); font-weight:700; margin-top:0.2rem; }

.pz-block { display:grid; gap:0.75rem; margin-top:1rem; }
.pz-block:first-child { margin-top:0; }
.pz-block h3 { font-size:1.02rem; font-weight:800; letter-spacing:-0.02em; }
.pz-block p { font-size:0.92rem; color:var(--text-sub); }
.pz-note { font-size:0.85rem; color:var(--text-muted); }
.pz-lock { border:1px solid var(--border-color); border-radius:var(--radius); background:var(--surface-alt); padding:1.25rem; }
.pz-form { display:grid; gap:0.6rem; max-width:26rem; }
.pz-form label { display:grid; gap:0.25rem; font-size:0.85rem; font-weight:700; }
.pz-form small { font-weight:400; color:var(--text-muted); }
.pz-form input { padding:0.55rem 0.7rem; border:1px solid var(--border-hover); border-radius:6px; background:var(--surface); color:var(--text-main); }

.pz-btn { font-weight:700; font-size:0.9rem; padding:0.6rem 1rem; border-radius:6px; border:1px solid var(--text-main);
  background:var(--text-main); color:#fff; cursor:pointer; justify-self:start; }
.pz-btn:hover:not(:disabled) { background:#3a332e; }
.pz-btn.ghost { background:var(--surface); color:var(--text-main); }
.pz-btn.ghost:hover:not(:disabled) { background:var(--surface-alt); }
.pz-btn.danger { background:var(--surface); color:var(--red); border-color:var(--red); }
.pz-btn.danger:hover:not(:disabled) { background:#fef2f2; }
.pz-btn:disabled { opacity:0.45; cursor:not-allowed; }

.pz-msg { margin:1rem 0 0; padding:0.7rem 0.9rem; border-radius:6px; font-size:0.9rem; font-weight:600; }
.pz-msg:empty { display:none; }
.pz-msg[data-kind="info"] { background:var(--blue-bg); color:var(--blue); }
.pz-msg[data-kind="ok"] { background:var(--mint-bg); color:var(--mint); }
.pz-msg[data-kind="error"] { background:#fef2f2; color:var(--red); }

.pz-bar { display:flex; flex-wrap:wrap; gap:0.75rem; justify-content:space-between; align-items:center; }
.pz-bar strong { color:var(--text-main); }
.pz-list { list-style:none; display:grid; gap:0.6rem; }
.pz-item { border:1px solid var(--border-color); border-radius:6px; background:var(--surface-alt); padding:0.85rem 1rem; display:grid; gap:0.3rem; }
.pz-item .kind { font-size:0.75rem; font-weight:700; color:var(--text-muted); }
.pz-item .title { font-weight:800; }
.pz-item .body { font-size:0.9rem; color:var(--text-sub); overflow-wrap:anywhere; }
.pz-key { font-family:'JetBrains Mono', SFMono-Regular, Consolas, monospace; font-size:0.75rem; overflow-wrap:anywhere;
  background:var(--surface); border:1px solid var(--border-color); border-radius:4px; padding:0.5rem 0.6rem; }
.pz-row-actions { display:flex; flex-wrap:wrap; gap:0.5rem; }

.pz-log { margin-top:1.25rem; border-top:1px solid var(--border-color); padding-top:0.75rem; }
.pz-log summary { cursor:pointer; font-size:0.85rem; font-weight:700; color:var(--text-sub); }
.pz-log pre { margin:0.6rem 0 0; max-height:18rem; overflow:auto; white-space:pre-wrap; overflow-wrap:anywhere;
  font-family:'JetBrains Mono', SFMono-Regular, Consolas, monospace; font-size:0.72rem; line-height:1.5;
  background:#161412; color:#d1c7bc; border-radius:6px; padding:0.85rem; }
`;

  // ── base64url ↔ ArrayBuffer (WebAuthn 은 바이트, JSON 은 문자열이라 오간다)
  const toBuf = (s) => {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out.buffer;
  };
  const toB64u = (buf) => {
    let bin = '';
    for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  // ── 작은 DOM 도우미. 서버에서 온 문자열은 전부 textContent 로만 넣는다(XSS 방지).
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return n;
  };


  // ── 구석 버튼 + 대화상자. 페이지에는 <script> 한 줄만 있으면 된다.
  const corner = document.createElement('div');
  corner.id = 'passkey-corner';
  document.body.append(corner);
  const shadow = corner.attachShadow({ mode: 'open' });

  const stateTag = el('span', { class: 'state' }, '잠김');
  const trigger = el('button', { type: 'button', class: 'corner-btn', 'aria-haspopup': 'dialog', 'data-open': 'false' }, '나만의 자리', stateTag);
  const dlg = el('dialog', { class: 'zone', 'aria-labelledby': 'zone-title' });
  const root = el('div');
  dlg.append(
    el('div', { class: 'zone-head' },
      el('div', {},
        el('h2', { id: 'zone-title' }, '나만의 자리'),
        el('p', { class: 'zone-sub' }, '패스키로 잠긴 비공개 영역입니다. 이 창 밖의 소개 페이지는 누구나 볼 수 있습니다.')),
      el('button', { type: 'button', class: 'pz-btn ghost', onclick: () => dlg.close() }, '닫기')),
    root);
  trigger.addEventListener('click', () => dlg.showModal());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  const style = document.createElement('style');
  style.textContent = CSS;
  shadow.append(style, trigger, dlg);

  const setCorner = (unlocked) => {
    trigger.dataset.open = String(unlocked);
    stateTag.textContent = unlocked ? '열림' : '잠김';
  };

  // ── 요청·응답 기록 (증거용). 값은 이 브라우저 화면에만 있고 어디로도 보내지 않는다.
  const logs = [];
  const logPre = el('pre', { tabindex: '0' });
  const renderLog = () => { logPre.textContent = logs.join('\n\n') || '아직 없습니다.'; };
  const logBox = el('details', { class: 'pz-log' },
    el('summary', {}, '요청·응답 기록 보기 (확인용)'),
    el('div', { class: 'pz-row-actions' },
      el('button', { type: 'button', class: 'pz-btn ghost', onclick: () => { logs.length = 0; renderLog(); } }, '기록 지우기')),
    logPre);
  renderLog();

  async function api(method, url, body) {
    const init = { method, credentials: 'same-origin', headers: {} };
    if (body !== undefined) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(body); }
    const res = await fetch(url, init);
    let data = null;
    try { data = await res.json(); } catch { /* 본문 없음 */ }
    const short = (v) => { const t = JSON.stringify(v); return t && t.length > 1800 ? t.slice(0, 1800) + ' …(생략)' : t; };
    logs.push(`${method} ${url}\n요청: ${body === undefined ? '-' : short(body)}\n응답 ${res.status}: ${short(data)}`);
    renderLog();
    return { ok: res.ok, status: res.status, data };
  }

  const msg = el('p', { class: 'pz-msg', role: 'status', 'aria-live': 'polite' });
  const setMsg = (text = '', kind = 'info') => { msg.textContent = text; msg.dataset.kind = kind; };
  const host = el('div');
  root.append(host, msg, logBox);

  const supported = () => {
    if (!window.PublicKeyCredential || !navigator.credentials) {
      setMsg('이 브라우저는 패스키를 지원하지 않습니다. 최신 Chrome·Safari·Edge에서 열어 보세요.', 'error');
      return false;
    }
    if (!window.isSecureContext) { setMsg('패스키는 https 주소(개발 중에는 localhost)에서만 동작합니다.', 'error'); return false; }
    return true;
  };

  // ── 등록: 질문 받기 → 기기가 열쇠 한 쌍 만들기 → 공개키·서명 보내기
  async function registerPasskey(username, name) {
    if (!supported()) return false;
    setMsg('서버에서 일회용 질문을 받는 중…');
    const opt = await api('POST', '/api/auth/register-options', { username });
    if (!opt.ok) { setMsg(opt.data?.message || '등록을 시작하지 못했습니다.', 'error'); return false; }
    const o = opt.data;
    const publicKey = {
      ...o,
      challenge: toBuf(o.challenge),
      user: { ...o.user, id: toBuf(o.user.id) },
      excludeCredentials: (o.excludeCredentials || []).map((c) => ({ ...c, id: toBuf(c.id) })),
    };

    let cred;
    try {
      setMsg('기기의 패스키 창에서 확인해 주세요.');
      cred = await navigator.credentials.create({ publicKey });
    } catch (e) {
      if (e.name === 'InvalidStateError') setMsg('이 기기에는 이미 이 계정의 패스키가 있습니다. 다른 기기나 다른 보안 키로 등록해 보세요.', 'error');
      else if (e.name === 'NotAllowedError') setMsg('등록을 취소했습니다. 서버에는 아무것도 저장되지 않았습니다.', 'info');
      else setMsg(`등록하지 못했습니다. (${e.name})`, 'error');
      return false;
    }

    const ver = await api('POST', '/api/auth/register-verify', {
      name,
      response: {
        id: cred.id,
        rawId: toB64u(cred.rawId),
        type: cred.type,
        authenticatorAttachment: cred.authenticatorAttachment ?? undefined,
        clientExtensionResults: cred.getClientExtensionResults(),
        response: {
          clientDataJSON: toB64u(cred.response.clientDataJSON),
          attestationObject: toB64u(cred.response.attestationObject),
          transports: cred.response.getTransports ? cred.response.getTransports() : [],
        },
      },
    });
    if (!ver.ok) { setMsg(ver.data?.message || '서버가 등록을 받아들이지 않았습니다.', 'error'); return false; }
    setMsg('패스키를 등록했습니다. 서버에는 공개키만 저장되었습니다.', 'ok');
    return true;
  }

  // ── 로그인: 새 질문 받기 → 기기가 개인키로 서명 → 서버가 공개키로 확인
  async function signIn() {
    if (!supported()) return;
    setMsg('서버에서 새 질문을 받는 중…');
    const opt = await api('POST', '/api/auth/login-options', {});
    if (!opt.ok) { setMsg('로그인을 시작하지 못했습니다.', 'error'); return; }
    const o = opt.data;
    const publicKey = { ...o, challenge: toBuf(o.challenge), allowCredentials: (o.allowCredentials || []).map((c) => ({ ...c, id: toBuf(c.id) })) };

    let cred;
    try {
      setMsg('기기의 패스키 창에서 확인해 주세요.');
      cred = await navigator.credentials.get({ publicKey });
    } catch (e) {
      setMsg(e.name === 'NotAllowedError' ? '확인을 취소했거나 시간이 지났습니다.' : `로그인하지 못했습니다. (${e.name})`, 'info');
      return;
    }

    const r = cred.response;
    const ver = await api('POST', '/api/auth/login-verify', {
      response: {
        id: cred.id,
        rawId: toB64u(cred.rawId),
        type: cred.type,
        authenticatorAttachment: cred.authenticatorAttachment ?? undefined,
        clientExtensionResults: cred.getClientExtensionResults(),
        response: {
          authenticatorData: toB64u(r.authenticatorData),
          clientDataJSON: toB64u(r.clientDataJSON),
          signature: toB64u(r.signature),
          userHandle: r.userHandle ? toB64u(r.userHandle) : undefined,
        },
      },
    });
    if (!ver.ok) { setMsg('들어가지 못했습니다. 이 서버에 등록된 패스키가 아니거나, 이미 지워진 패스키일 수 있습니다.', 'error'); return; }
    setMsg('');
    await renderPrivate();
  }

  async function signOut() {
    await api('POST', '/api/auth/logout', {});
    setMsg('로그아웃했습니다.', 'ok');
    renderLocked();
  }

  // ── 화면 1: 잠긴 상태. 비공개 내용은 어디에도 없다.
  function renderLocked() {
    setCorner(false);
    const uname = el('input', { id: 'pz-username', name: 'account', type: 'text', autocomplete: 'off', maxlength: '20', spellcheck: 'false' });
    const pname = el('input', { id: 'pz-pkname', name: 'passkeyName', type: 'text', autocomplete: 'off', maxlength: '30', placeholder: '예: 노트북 지문' });
    const createBtn = el('button', { type: 'button', class: 'pz-btn ghost' }, '새 계정 만들고 패스키 등록');
    createBtn.addEventListener('click', async () => {
      createBtn.disabled = true;
      const ok = await registerPasskey(uname.value, pname.value);
      createBtn.disabled = false;
      if (ok) await renderPrivate();
    });

    host.replaceChildren(
      el('div', { class: 'pz-block pz-lock' },
        el('h3', {}, '이 자리는 잠겨 있습니다'),
        el('p', {}, '패스키가 있으면 바로 들어갈 수 있습니다. 이 사이트에는 비밀번호가 없습니다.'),
        el('button', { type: 'button', class: 'pz-btn', onclick: signIn }, '패스키로 들어가기')),
      el('div', { class: 'pz-block' },
        el('h3', {}, '처음이라면'),
        el('div', { class: 'pz-form' },
          el('label', { for: 'pz-username' }, '계정 이름', el('small', {}, '영문 소문자·숫자·_·- 로 3~20자'), uname),
          el('label', { for: 'pz-pkname' }, '패스키 이름', el('small', {}, '나중에 알아보기 위한 이름'), pname),
          createBtn),
        el('p', { class: 'pz-note' }, '이 자리에 들어 있는 내용은 모두 만들어 넣은 것입니다. 실제 개인정보는 넣지 마세요.')),
    );
  }

  // ── 화면 2: 들어온 상태
  async function renderPrivate() {
    const me = await api('GET', '/api/me');
    if (!me.ok) { renderLocked(); return; }
    const [items, keys] = await Promise.all([api('GET', '/api/private/items'), api('GET', '/api/passkeys')]);
    if (!items.ok || !keys.ok) { renderLocked(); return; }

    setCorner(true);
    const list = keys.data.passkeys;
    const only = list.length <= 1;

    const passkeyRows = list.map((p) => {
      const keyBox = el('div', { hidden: true },
        el('div', { class: 'pz-key' }, p.publicKey),
        el('p', { class: 'pz-note' }, '위 값은 공개키입니다. 비밀번호가 아니고, 이것만으로는 로그인할 수 없습니다.'));
      const del = el('button', { type: 'button', class: 'pz-btn danger', disabled: only }, '지우기');
      del.addEventListener('click', async () => {
        if (!confirm(`"${p.name}" 패스키를 지울까요? 이 패스키로는 더 이상 들어올 수 없습니다.`)) return;
        const r = await api('DELETE', `/api/passkeys?id=${encodeURIComponent(p.id)}`);
        setMsg(r.ok ? '패스키를 지웠습니다.' : (r.data?.message || '지우지 못했습니다.'), r.ok ? 'ok' : 'error');
        await renderPrivate();
      });
      const toggle = el('button', { type: 'button', class: 'pz-btn ghost', 'aria-expanded': 'false' }, '서버에 저장된 값 보기');
      toggle.addEventListener('click', () => {
        keyBox.hidden = !keyBox.hidden;
        toggle.setAttribute('aria-expanded', String(!keyBox.hidden));
      });
      return el('li', { class: 'pz-item' },
        el('span', { class: 'title' }, p.name),
        el('span', { class: 'body' },
          `등록 ${new Date(p.createdAt).toLocaleString('ko-KR')} · ${p.deviceType === 'multiDevice' ? '동기화되는 패스키' : '이 기기에만 있는 패스키'} · 식별자 ${p.id.slice(0, 10)}…`),
        el('div', { class: 'pz-row-actions' }, toggle, del),
        keyBox,
      );
    });

    const addName = el('input', { id: 'pz-addname', name: 'passkeyName', type: 'text', autocomplete: 'off', maxlength: '30', placeholder: '예: 휴대폰' });
    const addBtn = el('button', { type: 'button', class: 'pz-btn' }, '패스키 추가');
    addBtn.addEventListener('click', async () => {
      addBtn.disabled = true;
      const ok = await registerPasskey(me.data.username, addName.value);
      addBtn.disabled = false;
      if (ok) await renderPrivate();
    });

    host.replaceChildren(
      el('div', { class: 'pz-block' },
        el('div', { class: 'pz-bar' },
          el('p', {}, el('strong', {}, me.data.username), ' 계정으로 들어와 있습니다.'),
          el('button', { type: 'button', class: 'pz-btn ghost', onclick: signOut }, '로그아웃'))),
      el('div', { class: 'pz-block' },
        el('h3', {}, `나만의 자료 (${items.data.count}건)`),
        el('ul', { class: 'pz-list' },
          items.data.items.map((it) => el('li', { class: 'pz-item' },
            el('span', { class: 'kind' }, it.kind), el('span', { class: 'title' }, it.title), el('span', { class: 'body' }, it.body))))),
      el('div', { class: 'pz-block' },
        el('h3', {}, `등록된 패스키 (${list.length}개)`),
        only ? el('p', { class: 'pz-note' }, '패스키가 하나뿐입니다. 이 기기를 잃어버리면 들어올 수 없으니 하나 더 등록해 두세요. 마지막 하나는 지울 수 없습니다.')
             : el('p', { class: 'pz-note' }, '두 개 이상 등록되어 있습니다. 하나를 지워도 남은 것으로 들어올 수 있습니다.'),
        el('ul', { class: 'pz-list' }, passkeyRows),
        el('div', { class: 'pz-form' },
          el('label', { for: 'pz-addname' }, '새 패스키 이름', addName), addBtn)),
    );
  }

  // 시작: 이미 들어와 있으면(세션 쿠키가 살아 있으면) 바로 열고, 아니면 잠긴 화면.
  renderLocked();
  fetch('/api/me', { credentials: 'same-origin' }).then((r) => { if (r.ok) renderPrivate(); });
  if (location.hash === '#private') dlg.showModal();
})();
