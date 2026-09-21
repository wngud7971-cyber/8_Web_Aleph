import { randomBytes } from 'node:crypto';
import { COOKIE_NAME, ORIGIN, SECURE, SESSION_TTL, B64URL_RE } from './config.js';
import { redis } from './redis.js';

export function json(res, status, body) {
  res.status(status).json(body);
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', '));
  json(res, 405, { error: 'method_not_allowed' });
  return false;
}

// 상태를 바꾸는 요청(POST/DELETE)은 우리 사이트에서 온 것만 받는다. (쿠키는 SameSite=Strict 이기도 함)
export function sameOrigin(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD') return true;
  if (req.headers.origin === ORIGIN) return true;
  json(res, 403, { error: 'bad_origin' });
  return false;
}

export function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

function cookie(value, maxAge) {
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${SECURE ? '; Secure' : ''}`;
}

// ── 세션: 서버가 들고 있는 무작위 토큰. 브라우저에는 HttpOnly 쿠키로만 간다.
export async function createSession(res, user) {
  const token = randomBytes(32).toString('base64url');
  await redis.set(
    `sess:${token}`,
    { userId: user.id, username: user.username, createdAt: Date.now() },
    { ex: SESSION_TTL },
  );
  res.setHeader('Set-Cookie', cookie(token, SESSION_TTL));
}

export async function getSession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token || !B64URL_RE.test(token)) return null;
  const s = await redis.get(`sess:${token}`);
  return s ? { ...s, token } : null;
}

export async function destroySession(req, res) {
  const s = await getSession(req);
  if (s) await redis.del(`sess:${s.token}`);
  res.setHeader('Set-Cookie', cookie('', 0));
}

// 비공개 자료로 가는 모든 길이 여기를 지난다. 세션이 없으면 401.
export async function requireSession(req, res) {
  const s = await getSession(req);
  if (!s) {
    json(res, 401, { error: 'not_signed_in' });
    return null;
  }
  return s;
}
