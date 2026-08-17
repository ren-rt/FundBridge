const fs = require('fs/promises');
const path = require('path');
 
const STORAGE_ROOT = path.join(__dirname, '..', '..', '..', 'storage', 'dealroom');
 
function filePath(dealRoomId, documentId) {
  return path.join(STORAGE_ROOT, dealRoomId, `${documentId}.enc`);
}
 
async function saveEncryptedFile(dealRoomId, documentId, encryptedBuffer) {
  const dir = path.join(STORAGE_ROOT, dealRoomId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath(dealRoomId, documentId), encryptedBuffer);
}
 
async function readEncryptedFile(dealRoomId, documentId) {
  return fs.readFile(filePath(dealRoomId, documentId));
}
 
module.exports = { saveEncryptedFile, readEncryptedFile };
 