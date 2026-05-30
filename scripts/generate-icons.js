const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const outDir = path.join(process.cwd(), "src-tauri", "icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  const crcBuffer = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  crcBuffer.writeUInt32BE(crc, 0);
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function png(width, height) {
  const pixel = Buffer.from([0x15, 0x15, 0x1f, 0xff]);
  const row = Buffer.alloc(1 + width * 4);
  row[0] = 0;
  for (let i = 0; i < width; i += 1) pixel.copy(row, 1 + i * 4);
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const image = zlib.deflateSync(raw);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([signature, chunk("IHDR", ihdr), chunk("IDAT", image), chunk("IEND", Buffer.alloc(0))]);
}

function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  const buffers = [];

  for (const image of images) {
    const buffer = png(image.size, image.size);
    const entry = Buffer.alloc(16);
    entry[0] = image.size === 256 ? 0 : image.size;
    entry[1] = image.size === 256 ? 0 : image.size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buffer.length;
    entries.push(entry);
    buffers.push(buffer);
    fs.writeFileSync(path.join(outDir, `${image.size}x${image.size}.png`), buffer);
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...buffers]);
  fs.writeFileSync(path.join(outDir, "icon.ico"), icoBuffer);
  fs.writeFileSync(path.join(outDir, "icon.icns"), png(1024, 1024));
}

ico([
  { size: 16 },
  { size: 32 },
  { size: 48 },
  { size: 64 },
  { size: 128 },
  { size: 256 },
]);

