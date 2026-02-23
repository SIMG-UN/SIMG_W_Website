#!/usr/bin/env node
/**
 * generate-thumbnail.mjs
 * 
 * Generates event thumbnails using Nano Banana (Banana.dev) + Google Cloud Vision
 * or falls back to a canvas-based local generator.
 * 
 * Usage:
 *   node scripts/generate-thumbnail.mjs --title "GPU Programming Model" --date "2026-02-27" --type "in-person"
 *   node scripts/generate-thumbnail.mjs --all   # Generate thumbnails for all events missing one
 * 
 * Environment variables:
 *   BANANA_API_KEY        - Banana.dev API key for Nano Banana image generation
 *   BANANA_MODEL_KEY      - Nano Banana model key
 *   GOOGLE_CLOUD_KEY      - (Optional) Google Cloud Vision API key for image validation
 * 
 * If no API keys are set, the script generates a stylized placeholder with
 * the SIMG branding colors (Yellow Turtle #F4C542 + Starry Blue #2E6DB4).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const EVENTS_DIR = join(ROOT, "src", "content", "events");
const OUTPUT_DIR = join(ROOT, "public", "images", "events");

// SIMG Brand Colors
const COLORS = {
  yellow: "#F4C542",
  blue: "#2E6DB4",
  green: "#5FA36A",
  darkBg: "#0C1A26",
  lightText: "#E6E9EF",
};

// Parse CLI arguments
const args = process.argv.slice(2);
const flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const key = args[i].replace("--", "");
    flags[key] = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
    if (flags[key] !== true) i++;
  }
}

/**
 * Parse frontmatter from a markdown file
 */
function parseFrontmatter(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split("\n");
  let currentKey = null;

  for (const line of lines) {
    const kvMatch = line.match(/^(\w[\w-]*)\s*:\s*(.+)/);
    if (kvMatch) {
      let value = kvMatch[2].trim();
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[kvMatch[1]] = value;
      currentKey = kvMatch[1];
    }
  }
  return frontmatter;
}

/**
 * Generate thumbnail using Nano Banana API
 */
async function generateWithNanoBanana(title, eventType, date) {
  const BANANA_API_KEY = process.env.BANANA_API_KEY;
  const BANANA_MODEL_KEY = process.env.BANANA_MODEL_KEY;

  if (!BANANA_API_KEY || !BANANA_MODEL_KEY) {
    return null;
  }

  const prompt = `Professional academic event poster, modern minimalist design, dark blue background (#2E6DB4), golden accent elements (#F4C542), tech/AI theme, clean typography area for title "${title}", 16:9 aspect ratio, high quality, digital art`;

  try {
    console.log(`  🍌 Calling Nano Banana API for: ${title}`);
    const response = await fetch("https://api.banana.dev/start/v4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: BANANA_API_KEY,
        modelKey: BANANA_MODEL_KEY,
        modelInputs: {
          prompt,
          negative_prompt: "blurry, low quality, text, watermark, distorted",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 1280,
          height: 720,
        },
      }),
    });

    const data = await response.json();
    if (data.modelOutputs && data.modelOutputs[0] && data.modelOutputs[0].image_base64) {
      return Buffer.from(data.modelOutputs[0].image_base64, "base64");
    }
    console.warn("  ⚠️  Nano Banana returned no image, falling back to local generation");
    return null;
  } catch (error) {
    console.warn(`  ⚠️  Nano Banana API error: ${error.message}`);
    return null;
  }
}

/**
 * Generate a simple SVG-based placeholder thumbnail
 * This is the fallback when no AI API is available
 */
function generateLocalThumbnail(title, eventType, date) {
  const typeColors = {
    "in-person": { bg: COLORS.blue, label: "IN-PERSON" },
    virtual: { bg: COLORS.green, label: "VIRTUAL" },
    hybrid: { bg: COLORS.yellow, label: "HYBRID" },
  };

  const typeConfig = typeColors[eventType] || typeColors["in-person"];
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Truncate title for SVG
  const maxCharsPerLine = 30;
  const words = title.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += " " + word;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  const titleLines = lines
    .slice(0, 3)
    .map(
      (line, i) =>
        `<text x="640" y="${320 + i * 52}" text-anchor="middle" fill="${COLORS.lightText}" font-family="Arial, sans-serif" font-size="42" font-weight="bold">${escapeXml(line)}</text>`
    )
    .join("\n    ");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.darkBg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#142238;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${COLORS.yellow};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${COLORS.blue};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bg)"/>

  <!-- Decorative circles (Starry Night inspired) -->
  <circle cx="100" cy="120" r="60" fill="${COLORS.blue}" opacity="0.15"/>
  <circle cx="1180" cy="600" r="80" fill="${COLORS.yellow}" opacity="0.1"/>
  <circle cx="200" cy="600" r="45" fill="${COLORS.green}" opacity="0.1"/>
  <circle cx="1100" cy="150" r="35" fill="${COLORS.blue}" opacity="0.2"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="1280" height="6" fill="url(#accent)"/>

  <!-- SIMG Logo Text -->
  <text x="640" y="140" text-anchor="middle" fill="${COLORS.yellow}" font-family="Arial, sans-serif" font-size="28" font-weight="bold" letter-spacing="8">SIMG</text>
  <text x="640" y="175" text-anchor="middle" fill="${COLORS.lightText}" font-family="Arial, sans-serif" font-size="16" opacity="0.7">Semillero de Investigación en Modelos Generativos</text>

  <!-- Divider -->
  <line x1="440" y1="210" x2="840" y2="210" stroke="url(#accent)" stroke-width="2" opacity="0.5"/>

  <!-- Event Type Badge -->
  <rect x="${640 - typeConfig.label.length * 7}" y="235" width="${typeConfig.label.length * 14 + 24}" height="32" rx="16" fill="${typeConfig.bg}" opacity="0.9"/>
  <text x="640" y="257" text-anchor="middle" fill="${eventType === 'hybrid' ? COLORS.darkBg : COLORS.lightText}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" letter-spacing="2">${typeConfig.label}</text>

  <!-- Title -->
  ${titleLines}

  <!-- Date -->
  <text x="640" y="${320 + Math.min(lines.length, 3) * 52 + 40}" text-anchor="middle" fill="${COLORS.yellow}" font-family="Arial, sans-serif" font-size="22">${escapeXml(formattedDate)}</text>

  <!-- Bottom accent bar -->
  <rect x="0" y="714" width="1280" height="6" fill="url(#accent)"/>

  <!-- Turtle icon (small) -->
  <text x="640" y="670" text-anchor="middle" font-size="36">🐢</text>
</svg>`;

  return svg;
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Slugify a string for filenames
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Process a single event
 */
async function processEvent(title, date, eventType, outputName) {
  const outputPath = join(OUTPUT_DIR, `${outputName}.svg`);
  const pngPath = join(OUTPUT_DIR, `${outputName}.png`);

  // Check if thumbnail already exists
  if (existsSync(pngPath)) {
    console.log(`  ⏭️  Thumbnail already exists: ${outputName}.png`);
    return;
  }

  // Try AI generation first
  const aiImage = await generateWithNanoBanana(title, eventType, date);
  if (aiImage) {
    writeFileSync(pngPath, aiImage);
    console.log(`  ✅ AI thumbnail saved: ${outputName}.png`);
    return;
  }

  // Fallback: generate SVG
  const svg = generateLocalThumbnail(title, eventType, date);
  writeFileSync(outputPath, svg, "utf-8");
  console.log(`  ✅ SVG thumbnail saved: ${outputName}.svg`);
}

/**
 * Main execution
 */
async function main() {
  console.log("\n🎨 SIMG Thumbnail Generator\n");

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  if (flags.all) {
    // Process all event files
    console.log("Processing all events...\n");
    for (const lang of ["en", "es"]) {
      const langDir = join(EVENTS_DIR, lang);
      if (!existsSync(langDir)) continue;

      const files = readdirSync(langDir).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        const filePath = join(langDir, file);
        const fm = parseFrontmatter(filePath);
        if (!fm) continue;

        const slug = file.replace(".md", "");
        console.log(`📌 [${lang}] ${fm.title || slug}`);
        await processEvent(
          fm.title || slug,
          fm.date || new Date().toISOString(),
          fm.eventType || "in-person",
          slug
        );
      }
    }
  } else if (flags.title) {
    // Process single event
    const slug = slugify(flags.title);
    console.log(`📌 Generating thumbnail for: ${flags.title}\n`);
    await processEvent(
      flags.title,
      flags.date || new Date().toISOString(),
      flags.type || "in-person",
      slug
    );
  } else {
    console.log("Usage:");
    console.log('  node scripts/generate-thumbnail.mjs --title "Event Title" --date "2026-02-27" --type "in-person"');
    console.log("  node scripts/generate-thumbnail.mjs --all");
    process.exit(1);
  }

  console.log("\n✨ Done!\n");
}

main().catch(console.error);
