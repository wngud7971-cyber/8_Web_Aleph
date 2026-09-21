import { redis } from './_lib/redis.js';
import { allowMethods, sameOrigin, requireSession, json } from './_lib/http.js';
import { B64URL_RE } from './_lib/config.js';

// GET    /api/passkeys          → 내 패스키 목록 (이름·등록일·공개키)
// DELETE /api/passkeys?id=...   → 내 패스키 하나 지우기 (마지막 하나는 거절)
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'DELETE']) || !sameOrigin(req, res)) return;
  const s = await requireSession(req, res);
  if (!s) return;

  if (req.method === 'GET') {
    const ids = await redis.smembers(`usercreds:${s.username}`);
    const creds = ids.length ? await redis.mget(...ids.map((id) => `cred:${id}`)) : [];
    const passkeys = creds
      .filter(Boolean)
      .map((c) => ({ id: c.id, name: c.name, createdAt: c.createdAt, deviceType: c.deviceType, backedUp: c.backedUp, publicKey: c.publicKey }))
      .sort((a, b) => a.createdAt - b.createdAt);
    return json(res, 200, { count: passkeys.length, passkeys });
  }

  const id = String(req.query.id ?? '');
  if (!B64URL_RE.test(id)) return json(res, 400, { error: 'bad_request' });

  const cred = await redis.get(`cred:${id}`);
  // 없는 것과 "남의 것"을 같은 응답으로 돌려준다 → 남의 패스키가 있는지조차 알 수 없다.
  if (!cred || cred.userId !== s.userId) return json(res, 404, { error: 'not_found' });

  const left = await redis.scard(`usercreds:${s.username}`);
  if (left <= 1) {
    return json(res, 409, { error: 'last_passkey', message: '마지막 패스키는 지울 수 없습니다. 먼저 다른 패스키를 하나 더 등록하세요.' });
  }

  await redis.srem(`usercreds:${s.username}`, id);
  await redis.del(`cred:${id}`);
  return json(res, 200, { ok: true, remaining: left - 1 });
}
