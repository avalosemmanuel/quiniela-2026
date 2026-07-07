import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#e8c44a';
  ctx.font = `${size * 0.6}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚽', size/2, size/2);
  return canvas.toBuffer('image/png');
}

writeFileSync('public/icon-192.png', createIcon(192));
writeFileSync('public/icon-512.png', createIcon(512));
console.log('Icons created');
