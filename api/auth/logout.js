import { allowMethods, sameOrigin, destroySession, json } from '../_lib/http.js';

// 서버에서 세션을 지운다. 쿠키만 지우는 게 아니므로, 같은 값을 다시 보내도 401.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST']) || !sameOrigin(req, res)) return;
  await destroySession(req, res);
  return json(res, 200, { ok: true });
}
