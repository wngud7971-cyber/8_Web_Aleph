import { allowMethods, requireSession, json } from '../../../_lib/http.js';
import { loadItems } from '../../../_lib/items.js';

// 주소에 계정을 적어 읽는 길: /api/private/accounts/<계정>/items
// 세션의 주인과 주소의 계정이 다르면 403. (남의 자료를 읽으려는 요청이 거절되는 자리)
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  const s = await requireSession(req, res);
  if (!s) return;

  if (String(req.query.id).toLowerCase() !== s.username) {
    return json(res, 403, { error: 'forbidden' });
  }
  return json(res, 200, await loadItems(s));
}
