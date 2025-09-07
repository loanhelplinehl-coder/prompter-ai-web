const fs = require("fs")
const { createCanvas } = require("canvas")

const sizes = [16, 48, 128]

sizes.forEach((size) => {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext("2d")

  // Background रंग
  ctx.fillStyle = "#4F46E5" // Indigo
  ctx.fillRect(0, 0, size, size)

  // Text (P = Prompter AI)
  ctx.fillStyle = "white"
  ctx.font = `${size * 0.6}px sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("P", size / 2, size / 2)

  const buffer = canvas.toBuffer("image/png")
  fs.writeFileSync(`extension/images/icon-${size}.png`, buffer)
  console.log(`✅ Created icon-${size}.png`)
})
