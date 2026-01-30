/**
 * Gera build/installerSidebar.bmp (164x314) no estilo Relatórios liveSEO.
 * Cores: #ff9a05 (laranja) e #f4f6f9 (fundo claro).
 * Executar: node build/generate-sidebar.cjs
 */
const fs = require('fs');
const path = require('path');

const W = 164;
const H = 314;
// BGR (Windows BMP)
const ORANGE = { b: 0x05, g: 0x9a, r: 0xff };  // #ff9a05
const LIGHT   = { b: 0xf9, g: 0xf6, r: 0xf4 };  // #f4f6f9

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
  u32(14 + 40);                  // pixel offset

  // BITMAPINFOHEADER
  u32(40);                       // header size
  u32(W);
  u32(-H);                       // top-down
  u16(1);                        // planes
  u16(24);                       // bits per pixel
  u32(0);                        // compression none
  u32(pixelDataSize);
  u32(2835); u32(2835);          // resolution (72 dpi)
  u32(0); u32(0);

  // Pixels (top-down, BGR). Faixa laranja à esquerda (~70px), resto fundo claro
  const pad = rowSize - W * 3;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = x < 70 ? ORANGE : LIGHT;
      u8(c.b); u8(c.g); u8(c.r);
    }
    for (let p = 0; p < pad; p++) u8(0);
  }

  fs.writeFileSync(filepath, buf);
  console.log('Gerado:', filepath);
}

const out = path.join(__dirname, 'installerSidebar.bmp');
writeBMP(out);
