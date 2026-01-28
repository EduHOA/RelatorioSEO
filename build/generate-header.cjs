/**
 * Gera build/installerHeader.bmp (150x57) no estilo Relatórios LiveSEO.
 * Cores: #ff9a05 (laranja) e #f4f6f9 (fundo claro). Gradiente horizontal.
 * Executar: node build/generate-header.cjs
 */
const fs = require('fs');
const path = require('path');

const W = 150;
const H = 57;
// BGR (Windows BMP)
const ORANGE = { b: 0x05, g: 0x9a, r: 0xff };  // #ff9a05
const LIGHT   = { b: 0xf9, g: 0xf6, r: 0xf4 };  // #f4f6f9

function lerp(c1, c2, t) {
  return {
    b: Math.round(c1.b + (c2.b - c1.b) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    r: Math.round(c1.r + (c2.r - c1.r) * t)
  };
}

function writeBMP(filepath) {
  const rowSize = Math.ceil((W * 3) / 4) * 4;
  const pixelDataSize = rowSize * H;
  const fileSize = 14 + 40 + pixelDataSize;
  const buf = Buffer.alloc(14 + 40 + pixelDataSize);
  let o = 0;

  function u8(v) { buf[o++] = v & 0xff; }
  function u16(v) { buf[o++] = v & 0xff; buf[o++] = (v >> 8) & 0xff; }
  function u32(v) { buf[o++] = v & 0xff; buf[o++] = (v >> 8) & 0xff; buf[o++] = (v >> 16) & 0xff; buf[o++] = (v >> 24) & 0xff; }

  // BITMAPFILEHEADER
  u8(0x42); u8(0x4d);           // "BM"
  u32(fileSize);
  u16(0); u16(0);
  u32(14 + 40);

  // BITMAPINFOHEADER
  u32(40);
  u32(W);
  u32(-H);
  u16(1);
  u16(24);
  u32(0);
  u32(pixelDataSize);
  u32(2835); u32(2835);
  u32(0); u32(0);

  // Gradiente horizontal: laranja à esquerda -> fundo claro à direita (estilo do relatório)
  const pad = rowSize - W * 3;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = x / (W - 1);
      const c = lerp(ORANGE, LIGHT, t);
      u8(c.b); u8(c.g); u8(c.r);
    }
    for (let p = 0; p < pad; p++) u8(0);
  }

  fs.writeFileSync(filepath, buf);
  console.log('Gerado:', filepath);
}

const out = path.join(__dirname, 'installerHeader.bmp');
writeBMP(out);
