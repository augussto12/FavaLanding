/**
 * Optimiza los assets pesados. Los originales pesan 6,5 MB entre los tres,
 * lo que en 4G de predio ferial es media eternidad. Se corre a mano cuando
 * entra un asset nuevo:  node scripts/optimizar-imagenes.mjs
 *
 * Las piezas del mail van enteras, una por bloque, porque cada una lleva su
 * propio enlace: la de Halaxia y la de LinkedIn no pueden ser la misma imagen.
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';

const kb = (f) => (statSync(f).size / 1024).toFixed(0).padStart(5);

const LANDING = [
  { de: 'assets-fuente/FASTA-13.jpg.jpeg', a: 'public/hero-desktop.webp', ancho: 1800 },
  { de: 'assets-fuente/banner-mobile-ufasta.png', a: 'public/hero-mobile.webp', ancho: 900 },
  { de: 'assets-fuente/footer-17.jpg.jpeg', a: 'public/pie-banner.webp', ancho: 1800 },
];

// 1200 px de ancho para una caja que se muestra a 600: es lo que pide una
// pantalla de telefono a 3x. Progresivo a proposito, porque el proxy de
// imagenes de Gmail sirve el archivo entero de una sola vez, y asi la pieza
// aparece completa al abrir el mail en vez de dibujarse de arriba a abajo.
const MAIL = [
  { de: 'assets-fuente/mail-15.jpg.jpeg', a: 'public/mail/mail-halaxia.jpg' },
  { de: 'assets-fuente/mail-16.jpg.jpeg', a: 'public/mail/mail-linkedin.jpg' },
];

console.log('--- landing ---');
for (const { de, a, ancho } of LANDING) {
  await sharp(de).resize({ width: ancho, withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 }).toFile(a);
  console.log(`  ${kb(de)} kB -> ${kb(a)} kB   ${a}`);
}

// El sello de la Expo, recortado del banner del pie. En mobile la pieza
// entera mide 40 px de alto y no se lee, asi que el footer se rearma apilado
// y necesita el sello suelto.
//
// El rojo del recorte va de #d31215 a #de252b, distinto del #e52928 de la
// banda, asi que pegado tal cual se ve un recuadro. Se le vacia el fondo con
// un relleno por inundacion desde los bordes: el sello es lavanda y azul
// oscuro, bien lejos del rojo, asi que la tolerancia no se lo come.
{
  const CAJA = { left: 3430, top: 85, width: 420, height: 255 };
  const { data, info } = await sharp('assets-fuente/footer-17.jpg.jpeg')
    .extract(CAJA)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: W, height: H, channels: C } = info;
  const esRojo = (i) => data[i] > 140 && data[i + 1] < 105 && data[i + 2] < 105;

  const cola = [];
  for (let x = 0; x < W; x++) cola.push([x, 0], [x, H - 1]);
  for (let y = 0; y < H; y++) cola.push([0, y], [W - 1, y]);

  const visto = new Uint8Array(W * H);
  while (cola.length) {
    const [x, y] = cola.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const n = y * W + x;
    if (visto[n]) continue;
    visto[n] = 1;
    const i = n * C;
    if (!esRojo(i)) continue;
    data[i + 3] = 0;
    cola.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  await sharp(data, { raw: { width: W, height: H, channels: C } })
    .resize({ width: 360 })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile('public/sello-expo.webp');
  console.log(`  ${kb('public/sello-expo.webp')} kB   public/sello-expo.webp  (fondo transparente)`);
}

console.log('--- piezas del mail ---');
for (const { de, a } of MAIL) {
  await sharp(de)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 78, progressive: true, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(a);
  console.log(`  ${kb(de)} kB -> ${kb(a)} kB   ${a}`);
}
