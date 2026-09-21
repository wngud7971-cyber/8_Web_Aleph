import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { ORIGIN, RP_ID, B64URL_RE } from '../_lib/config.js';
import { redis } from '../_lib/redis.js';
import { allowMethods, sameOrigin, createSession, json } from '../_lib/http.js';
import { challengeFrom, takeChallenge } from '../_lib/challenge.js';

const fail = (res, reason) => json(res, 401, { error: 'login_failed', reason });

// 서명을 저장해 둔 공개키로 확인한 뒤에만 세션을 만든다.
// reason 값은 확인 기록을 남기기 위한 학습용이다. (실서비스라면 밖으로는 하나로 뭉뚱그린다)
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST']) || !sameOrigin(req, res)) return;

  const response = req.body?.response;
  const challenge = challengeFrom(response);
  if (!challenge || typeof response?.id !== 'string' || !B64URL_RE.test(response.id)) {
    return json(res, 400, { error: 'bad_request' });
  }

  // ① 질문: 꺼내면서 지운다 → 이미 쓴 질문은 여기서 막힌다.
  const rec = await takeChallenge(challenge);
  if (!rec || rec.type !== 'auth') return fail(res, 'challenge_unknown_or_used');

  // ② 이 패스키를 서버가 아는가 (지운 패스키는 여기서 막힌다)
  const cred = await redis.get(`cred:${response.id}`);
  if (!cred) return fail(res, 'unknown_credential');

  // ③ 기기가 알려 준 사용자 표시값이 저장된 계정과 같은가
  const handle = response.response?.userHandle;
  if (handle && handle !== cred.userId) return fail(res, 'user_mismatch');

  // ④ 서명 확인 — 실패하면 던지거나 verified=false
  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: cred.id,
        publicKey: new Uint8Array(Buffer.from(cred.publicKey, 'base64url')),
        counter: cred.counter,
        transports: cred.transports,
      },
      requireUserVerification: true,
    });
  } catch {
    return fail(res, 'bad_signature');
  }
  if (!verification.verified) return fail(res, 'bad_signature');

  await redis.set(`cred:${cred.id}`, { ...cred, counter: verification.authenticationInfo.newCounter });
  await createSession(res, { id: cred.userId, username: cred.username });
  return json(res, 200, { ok: true, username: cred.username, passkeyName: cred.name });
}
