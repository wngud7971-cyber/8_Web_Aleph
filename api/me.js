import { allowMethods, requireSession, json } from './_lib/http.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  const s = await requireSession(req, res);
  if (!s) return;
  return json(res, 200, { username: s.username });
}
