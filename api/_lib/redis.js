import Redis from 'ioredis';

// Vercel 이 넣어 주는 REDIS_URL(연결 문자열)로 접속한다.
// 다른 파일은 예전과 같은 모양(get/set/del/…)으로 쓰도록, 값은 JSON 으로 저장·복원한다.
const url = process.env.REDIS_URL;
if (!url) throw new Error('REDIS_URL 환경변수가 없습니다.');

// 함수가 다시 실행되어도 연결을 재사용한다.
const client = globalThis.__redisClient ?? (globalThis.__redisClient = new Redis(url, { maxRetriesPerRequest: 2 }));

const enc = (v) => JSON.stringify(v);
const dec = (s) => (s == null ? null : JSON.parse(s));

export const redis = {
  async get(key) {
    return dec(await client.get(key));
  },
  // opts: { ex: 초, nx: true } → 성공하면 'OK', nx 조건에 걸리면 null
  async set(key, value, opts = {}) {
    const args = [key, enc(value)];
    if (opts.ex) args.push('EX', opts.ex);
    if (opts.nx) args.push('NX');
    return client.set(...args);
  },
  // 꺼내면서 동시에 지운다 (일회용 질문에 쓴다)
  async getdel(key) {
    return dec(await client.call('GETDEL', key));
  },
  async del(key) {
    return client.del(key);
  },
  async exists(key) {
    return client.exists(key);
  },
  async sadd(key, ...members) {
    return client.sadd(key, ...members);
  },
  async smembers(key) {
    return client.smembers(key);
  },
  async srem(key, ...members) {
    return client.srem(key, ...members);
  },
  async scard(key) {
    return client.scard(key);
  },
  async mget(...keys) {
    return (await client.mget(...keys)).map(dec);
  },
};
