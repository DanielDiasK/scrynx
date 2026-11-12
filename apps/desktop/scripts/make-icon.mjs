import sharp from "sharp";

// Rasterize the brutalist Scrynx logo (full-bleed yellow rounded square)
// into a 1024x1024 master suitable for `tauri icon`.
const svgPath = new URL("../public/logo.svg", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const outPath = new URL("../icon-source.png", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

await sharp(svgPath, { density: 768 })
  .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(outPath);

console.log("icon-source.png written:", outPath);
