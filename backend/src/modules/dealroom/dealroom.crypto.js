
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; 
const IV_LENGTH = 12;  
const HKDF_INFO = 'fundbridge-dealroom-v1';

function getMasterKey() {
  const raw = process.env.ENCRYPTION_MASTER_KEY;
  if (!raw) {
    throw new Error(
      'ENCRYPTION_MASTER_KEY is not set. Generate one with: ' +
      'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))" ' +
      'and put it in backend/.env (never commit it).'
    );
  }
  const buf = Buffer.from(raw, 'hex');
  if (buf.length !== KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_MASTER_KEY must be a 64-character hex string (32 bytes), got ${buf.length} bytes.`
    );
  }
  return buf;
}


function deriveRoomKey(dealRoomId) {
  if (!dealRoomId) throw new Error('deriveRoomKey requires a dealRoomId');
  const masterKey = getMasterKey();
  const derived = crypto.hkdfSync(
    'sha256',
    masterKey,
    dealRoomId,   
    HKDF_INFO,    
    KEY_LENGTH
  );
  return Buffer.from(derived);
}


function encryptBuffer(plainBuffer, roomKey) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, roomKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { ciphertext, iv, authTag };
}


function decryptBuffer(ciphertext, roomKey, iv, authTag) {
  const decipher = crypto.createDecipheriv(ALGORITHM, roomKey, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

module.exports = {
  deriveRoomKey,
  encryptBuffer,
  decryptBuffer,
};