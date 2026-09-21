import { allowMethods, requireSession, json } from '../_lib/http.js';
import { loadItems } from '../_lib/items.js';

// 비공개 자료 조회. 세션이 없으면 401.
// 누구의 자료인지는 "세션"만 정한다. ?owner=, ?account=, ?userId= 같은 값을 붙여도 읽지 않는다.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  const s = await requireSession(req, res);
  if (!s) return;
  return json(res, 200, await loadItems(s));
}
