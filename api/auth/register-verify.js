import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { ORIGIN, RP_ID } from '../_lib/config.js';
import { redis } from '../_lib/redis.js';
import { allowMethods, sameOrigin, getSession, createSession, json } from '../_lib/http.js';
import { challengeFrom, takeChallenge } from '../_lib/challenge.js';
import { seedItems } from '../_lib/items.js';

// 2단계: 기기가 만든 "공개키 + 서명"을 받아 확인하고, 통과하면 공개키만 저장한다.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST']) || !sameOrigin(req, res)) return;

  const response = req.body?.response;
  const challenge = challengeFrom(response);
  if (!challenge) return json(res, 400, { error: 'bad_request' });

  // 질문을 꺼내면서 지운다. 없거나 이미 썼거나 시간이 지났으면 여기서 끝.
  const rec = await takeChallenge(challenge);
  if (!rec || rec.type !== 'reg') {
    return json(res, 400, { error: 'challenge_unknown_or_used', message: '질문이 없거나 이미 쓰였습니다. 처음부터 다시 시도하세요.' });
  }

  // 기존 계정에 더하는 경우: 지금도 그 계정으로 들어와 있어야 한다.
  if (!rec.isNew) {
    const session = await getSession(req);
    if (!session || session.username !== rec.username) return json(res, 401, { error: 'not_signed_in' });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });
  } catch (e) {
    return json(res, 400, { error: 'verification_failed', message: '등록 확인에 실패했습니다.' });
  }
  if (!verification.verified || !verification.registrationInfo) {
    return json(res, 400, { error: 'verification_failed', message: '등록 확인에 실패했습니다.' });
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  if (await redis.exists(`cred:${credential.id}`)) {
    return json(res, 409, { error: 'credential_exists', message: '이미 등록된 패스키입니다.' });
  }

  const user = { id: rec.userId, username: rec.username };
  if (rec.isNew) {
    const created = await redis.set(`user:${rec.username}`, { ...user, createdAt: Date.now() }, { nx: true });
    if (!created) return json(res, 409, { error: 'username_taken', message: '그 사이 다른 사람이 같은 이름을 만들었습니다.' });
    await redis.set(`items:${rec.userId}`, seedItems(rec.username));
  }

  const count = await redis.scard(`usercreds:${rec.username}`);
  const name = String(req.body?.name ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 30) || `패스키 ${count + 1}`;

  // 서버에 저장되는 것: 공개키(publicKey)뿐. 개인키는 애초에 서버로 오지 않는다.
  const stored = {
    id: credential.id,
    userId: rec.userId,
    username: rec.username,
    name,
    publicKey: Buffer.from(credential.publicKey).toString('base64url'),
    counter: credential.counter,
    transports: credential.transports ?? [],
    deviceType: credentialDeviceType, // singleDevice | multiDevice(동기화 가능)
    backedUp: credentialBackedUp,
    createdAt: Date.now(),
  };
  await redis.set(`cred:${credential.id}`, stored);
  await redis.sadd(`usercreds:${rec.username}`, credential.id);

  if (rec.isNew) await createSession(res, user); // 새 계정은 등록 직후 바로 들어간다
  return json(res, 200, { ok: true, username: rec.username, passkey: { id: stored.id, name, publicKey: stored.publicKey } });
}
