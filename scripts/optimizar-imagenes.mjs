/**
 * Optimiza los assets pesados. Los originales pesan 6,5 MB entre los tres,
 * lo que en 4G de predio ferial es media eternidad. Se corre a mano cuando
 * entra un asset nuevo:  node scripts/optimizar-imagenes.mjs
 *
 * Las piezas del mail se recortan porque cada bloque lleva su propio enlace:
 * el de Halaxia y el de LinkedIn no pueden ser la misma imagen.
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';

const kb = (f) => (statSync(f).size / 1024).toFixed(0).padStart(5);

const LANDING = [
  { de: 'assets-fuente/FASTA-13.jpg.jpeg', a: 'public/hero-desktop.webp', ancho: 1800 },
  { de: 'assets-fuente/banner-mobile-ufasta.png', a: 'public/hero-mobile.webp', ancho: 900 },
  { de: 'assets-fuente/footer-17.jpg.jpeg', a: 'public/pie-banner.webp', ancho: 1800 },
];

// [archivo, y donde corta, nombre de arriba, nombre de abajo]
const MAIL = [
  ['assets-fuente/mail-15.jpg.jpeg', 826, 'mail-intro', 'mail-halaxia'],
  ['assets-fuente/mail-16.jpg.jpeg', 323, 'mail-linkedin', 'mail-cierre'],
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
for (const [de, corte, arriba, abajo] of MAIL) {
  const { width, height } = await sharp(de).metadata();
  const trozos = [
    [arriba, 0, corte],
    [abajo, corte, height - corte],
  ];
  for (const [nombre, top, alto] of trozos) {
    const salida = `public/mail/${nombre}.jpg`;
    await sharp(de).extract({ left: 0, top, width, height: alto })
      .resize({ width: 760, withoutEnlargement: true })
      .jpeg({ quality: 76, mozjpeg: true }).toFile(salida);
    console.log(`  ${kb(salida)} kB   ${salida}  (${width}x${alto} -> 760w)`);
  }
}
