const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/favicon.svg');
const outputDir = path.join(__dirname, '../public/icons/pwa');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of sizes) {
    await sharp(svgBuffer, { density: 300 })
      .resize(size, size, { fit: 'contain', background: { r: 10, g: 10, b: 16, alpha: 1 } })
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Also create Apple touch icon
  await sharp(svgBuffer, { density: 300 })
    .resize(180, 180, { fit: 'contain', background: { r: 10, g: 10, b: 16, alpha: 1 } })
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Maskable icon (padded for safe zone)
  await sharp(svgBuffer, { density: 300 })
    .resize(384, 384, { fit: 'contain', background: { r: 10, g: 10, b: 16, alpha: 1 } })
    .png()
    .toFile(path.join(outputDir, 'maskable-icon.png'));
  console.log('Generated maskable-icon.png');

  console.log('All icons generated successfully!');
}

generate().catch(console.error);
