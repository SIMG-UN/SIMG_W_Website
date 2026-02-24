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

// ── Load SIMG logo once at startup ──────────────────────────────────────────
// Embed the ICO as a base64 data URI; ICO files contain PNG data with alpha
// channel so the background stays transparent inside the SVG <image>.
let LOGO_ICO = "";
try {
  const icoPath = join(ROOT, "public", "images", "website", "SIMG_LOGO.ico");
  const icoBuffer = readFileSync(icoPath);
  LOGO_ICO = "data:image/x-icon;base64," + icoBuffer.toString("base64");
} catch {
  // Logo not found – silently skip
}

// SIMG Brand Colors
const COLORS = {
  yellow:    "#F4C542",
  blue:      "#2E6DB4",
  green:     "#76B900",   // NVIDIA green — matches the CUDA SVGs
  teal:      "#5FA36A",
  darkBg:    "#0C1A26",
  darkest:   "#0a0a0a",
  dark2:     "#1a1a2e",
  lightText: "#E6E9EF",
  muted:     "#A8B3C3",
  orange:    "#ff6b35",
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
 * Detect visual theme from title + tags for the right-panel visualization.
 */
function detectTheme(title, tags = []) {
  const text = [title, ...tags].join(" ").toLowerCase();
  if (text.match(/cuda|warp|kernel|nsight|profil|occupancy|scheduling/)) return "cuda";
  if (text.match(/python|cupy|numba|torch|numpy|colab/))               return "python";
  if (text.match(/neural|gpt|llm|diffusion|transformer|bert|latent/))  return "neural";
  if (text.match(/gpu|sm\b|vram|memory.layout|arch/))                  return "gpu";
  return "simg"; // default SIMG research theme
}

/**
 * Right-panel SVG content (<g> fragment) for each theme.
 * Rendered at translate(760, 90) inside the 1280×720 canvas.
 */
function rightPanel(theme) {
  // Common window frame (420×500)
  const frame = `
  <rect x="0" y="0" width="450" height="500" rx="14" fill="rgba(0,0,0,0.5)" stroke="${COLORS.green}" stroke-width="1.5"/>
  <rect x="0" y="0" width="450" height="34" rx="14" fill="rgba(118,185,0,0.18)"/>
  <rect x="0" y="17" width="450" height="17" fill="rgba(118,185,0,0.18)"/>
  <circle cx="20" cy="17" r="5.5" fill="#ff5f56"/>
  <circle cx="40" cy="17" r="5.5" fill="#ffbd2e"/>
  <circle cx="60" cy="17" r="5.5" fill="#27c93f"/>`;

  if (theme === "cuda" || theme === "gpu") {
    return `${frame}
  <text x="225" y="23" text-anchor="middle" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">NVIDIA Nsight Compute</text>
  <text x="15" y="62" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">GPU Speed Of Light Throughput</text>
  <line x1="15" y1="68" x2="435" y2="68" stroke="${COLORS.green}" stroke-width="0.5" opacity="0.3"/>
  <text x="15" y="92" fill="${COLORS.muted}" font-family="monospace" font-size="10">SM Throughput</text>
  <rect x="150" y="80" width="210" height="16" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
  <rect x="150" y="80" width="165" height="16" rx="3" fill="${COLORS.green}" opacity="0.7"/>
  <text x="372" y="92" fill="${COLORS.green}" font-family="monospace" font-size="10" font-weight="bold">78.5%</text>
  <text x="15" y="120" fill="${COLORS.muted}" font-family="monospace" font-size="10">Memory Throughput</text>
  <rect x="150" y="108" width="210" height="16" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
  <rect x="150" y="108" width="138" height="16" rx="3" fill="${COLORS.yellow}" opacity="0.6"/>
  <text x="372" y="120" fill="${COLORS.yellow}" font-family="monospace" font-size="10" font-weight="bold">65.7%</text>
  <text x="15" y="148" fill="${COLORS.muted}" font-family="monospace" font-size="10">Occupancy</text>
  <rect x="150" y="136" width="210" height="16" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
  <rect x="150" y="136" width="195" height="16" rx="3" fill="${COLORS.blue}" opacity="0.7"/>
  <text x="372" y="148" fill="#93c5fd" font-family="monospace" font-size="10" font-weight="bold">92.8%</text>
  <text x="15" y="188" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">Warp Scheduler Statistics</text>
  <line x1="15" y1="195" x2="435" y2="195" stroke="${COLORS.green}" stroke-width="0.5" opacity="0.3"/>
  <g transform="translate(15,208)">
    <text x="0" y="11" fill="${COLORS.muted}" font-family="monospace" font-size="9">W0</text>
    <text x="0" y="29" fill="${COLORS.muted}" font-family="monospace" font-size="9">W1</text>
    <text x="0" y="47" fill="${COLORS.muted}" font-family="monospace" font-size="9">W2</text>
    <text x="0" y="65" fill="${COLORS.muted}" font-family="monospace" font-size="9">W3</text>
    <rect x="25" y="1"  width="55" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="85" y="1"  width="22" height="12" rx="2" fill="${COLORS.orange}" opacity="0.6"/>
    <rect x="112" y="1" width="72" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="189" y="1" width="16" height="12" rx="2" fill="${COLORS.yellow}" opacity="0.6"/>
    <rect x="210" y="1" width="80" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="295" y="1" width="115" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="25" y="19" width="30" height="12" rx="2" fill="${COLORS.yellow}" opacity="0.6"/>
    <rect x="60" y="19" width="68" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="133" y="19" width="26" height="12" rx="2" fill="${COLORS.orange}" opacity="0.6"/>
    <rect x="164" y="19" width="90" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="259" y="19" width="151" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="25" y="37" width="82" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="112" y="37" width="16" height="12" rx="2" fill="${COLORS.yellow}" opacity="0.6"/>
    <rect x="133" y="37" width="58" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="196" y="37" width="26" height="12" rx="2" fill="${COLORS.orange}" opacity="0.6"/>
    <rect x="227" y="37" width="183" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="25" y="55" width="48" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="78" y="55" width="20" height="12" rx="2" fill="${COLORS.yellow}" opacity="0.6"/>
    <rect x="103" y="55" width="88" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="196" y="55" width="50" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
    <rect x="251" y="55" width="16" height="12" rx="2" fill="${COLORS.orange}" opacity="0.6"/>
    <rect x="272" y="55" width="138" height="12" rx="2" fill="${COLORS.green}" opacity="0.8"/>
  </g>
  <g transform="translate(15,292)">
    <rect x="0"   y="0" width="10" height="10" rx="2" fill="${COLORS.green}"  opacity="0.8"/><text x="14" y="9" fill="${COLORS.muted}" font-family="monospace" font-size="9">Active</text>
    <rect x="65"  y="0" width="10" height="10" rx="2" fill="${COLORS.yellow}" opacity="0.6"/><text x="79" y="9" fill="${COLORS.muted}" font-family="monospace" font-size="9">Stalled</text>
    <rect x="140" y="0" width="10" height="10" rx="2" fill="${COLORS.orange}" opacity="0.6"/><text x="154" y="9" fill="${COLORS.muted}" font-family="monospace" font-size="9">Waiting</text>
  </g>
  <text x="15" y="335" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">Kernel Performance</text>
  <line x1="15" y1="342" x2="435" y2="342" stroke="${COLORS.green}" stroke-width="0.5" opacity="0.3"/>
  <g transform="translate(35,350)">
    <line x1="0" y1="80" x2="370" y2="80" stroke="${COLORS.muted}" stroke-width="0.5" opacity="0.3"/>
    <line x1="0" y1="0"  x2="0"   y2="80" stroke="${COLORS.muted}" stroke-width="0.5" opacity="0.3"/>
    <polyline points="0,70 37,55 74,60 111,40 148,44 185,26 222,30 259,15 296,18 333,8 370,4" fill="none" stroke="${COLORS.green}" stroke-width="2"/>
    <circle cx="111" cy="40" r="3" fill="${COLORS.green}"/>
    <circle cx="222" cy="30" r="3" fill="${COLORS.yellow}"/>
    <circle cx="370" cy="4"  r="3" fill="${COLORS.green}"/>
    <text x="185" y="95" text-anchor="middle" fill="${COLORS.muted}" font-family="monospace" font-size="8">Optimization Iterations →</text>
  </g>`;
  }

  if (theme === "python") {
    return `${frame}
  <text x="225" y="23" text-anchor="middle" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">Python CUDA REPL</text>
  <text x="15" y="62" fill="${COLORS.green}" font-family="monospace" font-size="10">$ python gpu_demo.py</text>
  <text x="15" y="80" fill="${COLORS.muted}" font-family="monospace" font-size="10">import cupy as cp</text>
  <text x="15" y="96" fill="${COLORS.muted}" font-family="monospace" font-size="10">import torch</text>
  <text x="15" y="112" fill="${COLORS.yellow}" font-family="monospace" font-size="10">from numba</text><text x="110" y="112" fill="${COLORS.muted}" font-family="monospace" font-size="10"> import cuda</text>
  <line x1="15" y1="125" x2="435" y2="125" stroke="${COLORS.green}" stroke-width="0.5" opacity="0.2"/>
  <text x="15" y="145" fill="${COLORS.muted}" font-family="monospace" font-size="10"># Move data to GPU</text>
  <text x="15" y="162" fill="${COLORS.lightText}" font-family="monospace" font-size="10">x_gpu = cp.array(x_cpu)</text>
  <text x="15" y="178" fill="${COLORS.lightText}" font-family="monospace" font-size="10">t = torch.tensor(data).cuda()</text>
  <line x1="15" y1="192" x2="435" y2="192" stroke="${COLORS.green}" stroke-width="0.5" opacity="0.2"/>
  <text x="15" y="212" fill="${COLORS.muted}" font-family="monospace" font-size="10"># Custom CUDA kernel (Numba)</text>
  <text x="15" y="228" fill="${COLORS.yellow}" font-family="monospace" font-size="10">@cuda.jit</text>
  <text x="15" y="244" fill="${COLORS.lightText}" font-family="monospace" font-size="10">def kernel(arr, out):</text>
  <text x="15" y="260" fill="${COLORS.muted}" font-family="monospace" font-size="10">    idx = cuda.grid(1)</text>
  <text x="15" y="276" fill="${COLORS.muted}" font-family="monospace" font-size="10">    if idx &lt; arr.size:</text>
  <text x="15" y="292" fill="${COLORS.muted}" font-family="monospace" font-size="10">        out[idx] = arr[idx] ** 2</text>
  <line x1="15" y1="308" x2="435" y2="308" stroke="${COLORS.green}" stroke-width="0.5" opacity="0.2"/>
  <text x="15" y="330" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">Benchmark Results</text>
  <text x="15" y="355" fill="${COLORS.muted}" font-family="monospace" font-size="10">NumPy  (CPU):</text>
  <rect x="150" y="343" width="200" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
  <rect x="150" y="343" width="40"  height="14" rx="3" fill="${COLORS.orange}" opacity="0.7"/>
  <text x="360" y="355" fill="${COLORS.orange}" font-family="monospace" font-size="10">1.00×</text>
  <text x="15" y="378" fill="${COLORS.muted}" font-family="monospace" font-size="10">CuPy   (GPU):</text>
  <rect x="150" y="366" width="200" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
  <rect x="150" y="366" width="180" height="14" rx="3" fill="${COLORS.green}" opacity="0.7"/>
  <text x="360" y="378" fill="${COLORS.green}" font-family="monospace" font-size="10">45×</text>
  <text x="15" y="401" fill="${COLORS.muted}" font-family="monospace" font-size="10">Numba  (GPU):</text>
  <rect x="150" y="389" width="200" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
  <rect x="150" y="389" width="165" height="14" rx="3" fill="${COLORS.blue}" opacity="0.7"/>
  <text x="360" y="401" fill="#93c5fd" font-family="monospace" font-size="10">38×</text>`;
  }

  if (theme === "neural") {
    // Neural network diagram
    const nodes = [];
    const links = [];
    const layers = [[80,3],[200,5],[320,5],[440,3],[560,2]];
    const layerY = [160,130,110,130,160];
    layers.forEach(([x,n],li) => {
      const spacing = 420/(n+1);
      for(let i=0;i<n;i++){
        const y = layerY[li] + (i-(n-1)/2)*spacing*0.8;
        nodes.push({x,y,li,i});
      }
    });
    const nodesBySvg = nodes.map(({x,y,li})=>`<circle cx="${x}" cy="${y}" r="12" fill="${li===0?COLORS.yellow:li===layers.length-1?COLORS.green:COLORS.blue}" opacity="0.85" stroke="${COLORS.darkBg}" stroke-width="1"/>`).join("");
    // links between consecutive layers
    const layerNodes = layers.map((_,li)=>nodes.filter(n=>n.li===li));
    let linksSvg = "";
    for(let li=0;li<layers.length-1;li++){
      layerNodes[li].forEach(a=>{
        layerNodes[li+1].forEach(b=>{
          linksSvg+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${COLORS.blue}" stroke-width="0.6" opacity="0.25"/>`;
        });
      });
    }
    return `${frame}
  <text x="225" y="23" text-anchor="middle" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">Generative Model Architecture</text>
  <g transform="translate(0,40)">
    ${linksSvg}
    ${nodesBySvg}
    <text x="80"  y="320" text-anchor="middle" fill="${COLORS.muted}" font-family="monospace" font-size="9">Input</text>
    <text x="200" y="320" text-anchor="middle" fill="${COLORS.muted}" font-family="monospace" font-size="9">Encoder</text>
    <text x="320" y="320" text-anchor="middle" fill="${COLORS.muted}" font-family="monospace" font-size="9">Latent</text>
    <text x="440" y="320" text-anchor="middle" fill="${COLORS.muted}" font-family="monospace" font-size="9">Decoder</text>
    <text x="560" y="320" text-anchor="middle" fill="${COLORS.muted}" font-family="monospace" font-size="9">Output</text>
  </g>
  <text x="15" y="380" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">Training Metrics</text>
  <line x1="15" y1="387" x2="435" y2="387" stroke="${COLORS.green}" stroke-width="0.5" opacity="0.3"/>
  <text x="15" y="408" fill="${COLORS.muted}" font-family="monospace" font-size="10">Loss</text>
  <rect x="80" y="396" width="280" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
  <rect x="80" y="396" width="60"  height="14" rx="3" fill="${COLORS.orange}" opacity="0.7"/>
  <text x="370" y="408" fill="${COLORS.orange}" font-family="monospace" font-size="10">0.023</text>
  <text x="15" y="430" fill="${COLORS.muted}" font-family="monospace" font-size="10">FID Score</text>
  <rect x="80" y="418" width="280" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
  <rect x="80" y="418" width="210" height="14" rx="3" fill="${COLORS.green}" opacity="0.7"/>
  <text x="370" y="430" fill="${COLORS.green}" font-family="monospace" font-size="10">12.4</text>
  <text x="15" y="452" fill="${COLORS.muted}" font-family="monospace" font-size="10">CLIP Score</text>
  <rect x="80" y="440" width="280" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
  <rect x="80" y="440" width="242" height="14" rx="3" fill="${COLORS.blue}" opacity="0.7"/>
  <text x="370" y="452" fill="#93c5fd" font-family="monospace" font-size="10">0.86</text>`;
  }

  // Default / SIMG research theme
  return `${frame}
  <text x="225" y="23" text-anchor="middle" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">SIMG Research Lab</text>
  <text x="15" y="62" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">Research Tracks</text>
  <line x1="15" y1="69" x2="435" y2="69" stroke="${COLORS.green}" stroke-width="0.5" opacity="0.3"/>
  <g transform="translate(15,85)" fill="${COLORS.muted}" font-family="Arial,sans-serif" font-size="13">
    <circle cx="8" cy="-3" r="5" fill="${COLORS.green}"/>
    <text x="22" y="0">Hard Tech AI &amp; GPU Programming</text>
    <circle cx="8" cy="27" r="5" fill="${COLORS.yellow}"/>
    <text x="22" y="30">Generative Models &amp; Diffusion</text>
    <circle cx="8" cy="57" r="5" fill="${COLORS.blue}"/>
    <text x="22" y="60">Multiagent Systems (PHIN GPT)</text>
    <circle cx="8" cy="87" r="5" fill="${COLORS.orange}"/>
    <text x="22" y="90">Latin American AI Sovereignty</text>
  </g>
  <text x="15" y="218" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">Activity Pulse</text>
  <line x1="15" y1="225" x2="435" y2="225" stroke="${COLORS.green}" stroke-width="0.5" opacity="0.3"/>
  <g transform="translate(20,240)">
    <line x1="0" y1="90" x2="400" y2="90" stroke="${COLORS.muted}" stroke-width="0.5" opacity="0.3"/>
    <line x1="0" y1="0"  x2="0"   y2="90" stroke="${COLORS.muted}" stroke-width="0.5" opacity="0.3"/>
    <polyline points="0,80 40,70 80,60 120,55 160,35 200,40 240,25 280,20 320,15 360,10 400,5"
              fill="none" stroke="${COLORS.yellow}" stroke-width="2.5"/>
    <polyline points="0,85 40,80 80,75 120,65 160,60 200,50 240,45 280,35 320,30 360,22 400,18"
              fill="none" stroke="${COLORS.blue}" stroke-width="1.5" stroke-dasharray="4,3"/>
    <circle cx="160" cy="35" r="4" fill="${COLORS.yellow}"/>
    <circle cx="320" cy="15" r="4" fill="${COLORS.yellow}"/>
    <circle cx="400" cy="5"  r="4" fill="${COLORS.green}"/>
    <text x="200" y="108" text-anchor="middle" fill="${COLORS.muted}" font-family="monospace" font-size="8">Sessions →</text>
  </g>
  <text x="15" y="388" fill="${COLORS.green}" font-family="monospace" font-size="11" font-weight="bold">Current Projects</text>
  <line x1="15" y1="395" x2="435" y2="395" stroke="${COLORS.green}" stroke-width="0.5" opacity="0.3"/>
  <text x="15" y="416" fill="${COLORS.muted}" font-family="monospace" font-size="10">PHIN GPT (Medical AI)</text>
  <rect x="200" y="404" width="180" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
  <rect x="200" y="404" width="144" height="14" rx="3" fill="${COLORS.green}" opacity="0.6"/>
  <text x="388" y="416" fill="${COLORS.green}" font-family="monospace" font-size="10">80%</text>
  <text x="15" y="438" fill="${COLORS.muted}" font-family="monospace" font-size="10">CUDA UNAL Curriculum</text>
  <rect x="200" y="426" width="180" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
  <rect x="200" y="426" width="105" height="14" rx="3" fill="${COLORS.yellow}" opacity="0.6"/>
  <text x="388" y="438" fill="${COLORS.yellow}" font-family="monospace" font-size="10">58%</text>
  <text x="15" y="460" fill="${COLORS.muted}" font-family="monospace" font-size="10">Multiagent Research</text>
  <rect x="200" y="448" width="180" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
  <rect x="200" y="448" width="72"  height="14" rx="3" fill="${COLORS.blue}" opacity="0.6"/>
  <text x="388" y="460" fill="#93c5fd" font-family="monospace" font-size="10">40%</text>`;
}

/**
 * Format a date string or Date object for display (e.g., "Feb 26, 2026")
 */
function formatDate(dateStr) {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return String(dateStr); }
}

/**
 * Split a title into at most 2 display lines without cutting words.
 * Returns array of strings.
 */
function splitTitle(title) {
  // Remove "Lecture N - " prefix — that goes in the badge
  const clean = title.replace(/^lecture\s+\d+\s*[-–:]\s*/i, "");
  const MAX = 32;
  const words = clean.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (lines.length === 1 && (cur + " " + w).trim().length > MAX) { lines.push(cur.trim()); cur = w; continue; }
    if ((cur + " " + w).trim().length > MAX && lines.length < 1) { lines.push(cur.trim()); cur = w; continue; }
    cur += (cur ? " " : "") + w;
  }
  if (cur) lines.push(cur.trim());
  return lines.slice(0, 3);
}

/**
 * Generate a full SIMG-branded SVG thumbnail.
 *
 * @param {string} title
 * @param {string} eventType   "virtual" | "in-person" | "hybrid"
 * @param {string} date        "YYYY-MM-DD"
 * @param {string} meetingLink URL or ""
 * @param {object} options     { tags, time, speaker, location }
 */
function generateLocalThumbnail(title, eventType, date, meetingLink = "", options = {}) {
  const { tags = [], time = "2:00 PM – 4:00 PM", speaker = "", location = "" } = options;

  // ── Badge: Lecture number ──────────────────────────────────────────────────
  const lectureMatch = title.match(/lecture\s*(\d+)/i) || title.match(/sesi[oó]n\s*(\d+)/i);
  const lectureNum   = lectureMatch ? lectureMatch[1] : null;

  // ── Badge: event type ─────────────────────────────────────────────────────
  const typeLabel = eventType === "virtual" ? "VIRTUAL" : eventType === "hybrid" ? "HYBRID" : "IN-PERSON";
  const typeColor = eventType === "virtual" ? COLORS.green : eventType === "hybrid" ? COLORS.yellow : COLORS.blue;
  const typeTxt   = eventType === "hybrid" ? COLORS.darkBg : COLORS.lightText;

  // ── Title lines ───────────────────────────────────────────────────────────
  const titleLines = splitTitle(title);
  let lectureTitleLines = titleLines;
  // If title has subtitle after " - " keep both parts
  const dashIdx = title.replace(/^lecture\s+\d+\s*[-–]\s*/i, "").indexOf(" - ");
  if (dashIdx > 0) {
    const base   = title.replace(/^lecture\s+\d+\s*[-–]\s*/i, "");
    const part1  = base.slice(0, dashIdx).trim();
    const part2  = base.slice(dashIdx + 3).trim();
    lectureTitleLines = [...splitTitle(part1), ...splitTitle(part2)].slice(0, 3);
  }

  // Key topics — first 4 tags or generic
  const topicColors = [COLORS.green, COLORS.orange, COLORS.yellow, COLORS.blue];
  const topicItems  = tags.slice(0, 4);

  // ── Bottom bar content ────────────────────────────────────────────────────
  const fmtDate = formatDate(date);
  const locationText = eventType === "virtual"
    ? (meetingLink ? meetingLink.replace(/^https?:\/\//, "").replace(/\/$/, "") : "Virtual")
    : (location || "Universidad Nacional de Colombia, Bogotá");

  // ── Right panel ───────────────────────────────────────────────────────────
  const theme = detectTheme(title, tags);
  const panel = rightPanel(theme);

  // ── Render title text elements ────────────────────────────────────────────
  const titleYStart = lectureNum ? 220 : 200;
  const titleEls = lectureTitleLines.map((line, i) => {
    const isGreen = i === lectureTitleLines.length - 1 && lectureTitleLines.length > 1;
    return `<text x="50" y="${titleYStart + i * 58}" fill="${isGreen ? COLORS.green : "#FFFFFF"}" font-family="Arial, sans-serif" font-size="46" font-weight="bold">${escapeXml(line)}</text>`;
  }).join("\n  ");

  // ── Topics ────────────────────────────────────────────────────────────────
  const topicsY = titleYStart + lectureTitleLines.length * 58 + 30;
  const topicEls = topicItems.map((tag, i) =>
    `<circle cx="58" cy="${topicsY + i * 30 - 5}" r="4" fill="${topicColors[i]}"/>
  <text x="72" y="${topicsY + i * 30}" fill="${COLORS.muted}" font-family="Arial, sans-serif" font-size="16">${escapeXml(tag)}</text>`
  ).join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   style="stop-color:${COLORS.darkest}"/>
      <stop offset="35%"  style="stop-color:${COLORS.darkBg}"/>
      <stop offset="100%" style="stop-color:${COLORS.dark2}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   style="stop-color:${COLORS.yellow}"/>
      <stop offset="100%" style="stop-color:${COLORS.blue}"/>
    </linearGradient>
    <linearGradient id="nv-green" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   style="stop-color:${COLORS.green}"/>
      <stop offset="100%" style="stop-color:#5a9e00"/>
    </linearGradient>
    <radialGradient id="glow-green" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   style="stop-color:${COLORS.green};stop-opacity:0.18"/>
      <stop offset="100%" style="stop-color:${COLORS.green};stop-opacity:0"/>
    </radialGradient>
    <radialGradient id="glow-yellow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   style="stop-color:${COLORS.yellow};stop-opacity:0.10"/>
      <stop offset="100%" style="stop-color:${COLORS.yellow};stop-opacity:0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="none"/>
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${COLORS.green}" stroke-width="0.3" opacity="0.12"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect width="1280" height="720" fill="url(#grid)"/>

  <!-- Ambient glows -->
  <ellipse cx="1000" cy="280" rx="340" ry="260" fill="url(#glow-green)"/>
  <ellipse cx="280"  cy="520" rx="240" ry="190" fill="url(#glow-yellow)"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="1280" height="4" fill="url(#accent)"/>

  <!-- SIMG branding top-left: logo + text -->
  ${LOGO_ICO ? `<image href="${LOGO_ICO}" x="50" y="18" width="46" height="46"/>` : ""}
  <g transform="translate(${LOGO_ICO ? "104" : "50"}, 42)">
    <text x="0" y="0"  fill="${COLORS.yellow}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" letter-spacing="4">SIMG</text>
    <text x="0" y="18" fill="${COLORS.muted}"  font-family="Arial, sans-serif" font-size="10" letter-spacing="1">SEMILLERO DE INVESTIGACIÓN</text>
  </g>

  <!-- Lecture badge -->
  ${lectureNum ? `<g transform="translate(50, 112)">
    <rect x="0" y="0" width="130" height="36" rx="18" fill="${COLORS.green}"/>
    <text x="65" y="24" text-anchor="middle" fill="${COLORS.darkest}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" letter-spacing="1">LECTURE ${lectureNum}</text>
  </g>` : ""}

  <!-- Event type badge -->
  <g transform="translate(${lectureNum ? "195" : "50"}, 112)">
    <rect x="0" y="0" width="130" height="36" rx="18" fill="none" stroke="${typeColor}" stroke-width="1.5"/>
    <text x="65" y="24" text-anchor="middle" fill="${eventType === "hybrid" ? COLORS.darkBg : "#93c5fd"}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" letter-spacing="1">${typeLabel}</text>
  </g>

  <!-- Main title -->
  ${titleEls}

  <!-- Key topics -->
  <g transform="translate(0, 0)">
  ${topicEls}
  </g>

  <!-- Right panel visualization -->
  <g transform="translate(760, 90)" opacity="0.65">
    ${panel}
  </g>

  <!-- Bottom bar -->
  <rect x="0" y="680" width="1280" height="40" fill="rgba(0,0,0,0.65)"/>
  <rect x="0" y="678" width="1280" height="2"  fill="url(#accent)"/>

  <!-- Date -->
  <text x="50"  y="706" fill="${COLORS.yellow}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">${escapeXml(fmtDate)}</text>
  <text x="${fmtDate.length * 9 + 55}"  y="706" fill="${COLORS.muted}" font-family="Arial, sans-serif" font-size="14">|</text>
  <!-- Time -->
  <text x="${fmtDate.length * 9 + 75}"  y="706" fill="${COLORS.muted}" font-family="Arial, sans-serif" font-size="14">${escapeXml(time)}</text>
  <text x="${fmtDate.length * 9 + 75 + time.length * 8 + 10}" y="706" fill="${COLORS.muted}" font-family="Arial, sans-serif" font-size="14">|</text>
  <!-- Location / Meeting -->
  <text x="${fmtDate.length * 9 + 75 + time.length * 8 + 30}" y="706" fill="${COLORS.muted}" font-family="Arial, sans-serif" font-size="13">${escapeXml(locationText.slice(0, 52))}</text>

  <!-- Turtle + UNAL bottom-right -->
  <text x="1200" y="706" fill="${COLORS.lightText}" font-family="Arial, sans-serif" font-size="11" opacity="0.55">🐢 UNAL</text>

  <!-- Bottom accent bar -->
  <rect x="0" y="716" width="1280" height="4" fill="url(#nv-green)"/>
</svg>`;
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
 * @param {string} title
 * @param {string} date
 * @param {string} eventType
 * @param {string} outputName   slug (no .svg)
 * @param {string} meetingLink
 * @param {object} options      { tags, time, speaker, location }
 */
async function processEvent(title, date, eventType, outputName, meetingLink = "", options = {}) {
  const outputPath = join(OUTPUT_DIR, `${outputName}.svg`);
  const pngPath    = join(OUTPUT_DIR, `${outputName}.png`);

  // Skip if PNG (AI-generated) already exists
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

  // Fallback: high-quality SVG generator
  const svg = generateLocalThumbnail(title, eventType, date, meetingLink, options);
  writeFileSync(outputPath, svg, "utf-8");
  console.log(`  ✅ SVG thumbnail saved: ${outputName}.svg`);
}

/**
 * Parse a YAML-ish tags array from frontmatter string.
 * Handles: `tags: ["A", "B"]` and `tags: [A, B]`
 */
function parseTags(raw = "") {
  if (!raw) return [];
  return raw.replace(/[\[\]"']/g, "").split(",").map(t => t.trim()).filter(Boolean);
}

/**
 * Main execution
 */
async function main() {
  console.log("\n🎨 SIMG Thumbnail Generator\n");

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  if (flags.all) {
    console.log("Processing all events...\n");
    // Only process "en" lang to avoid duplicates
    const langDir = join(EVENTS_DIR, "en");
    if (!existsSync(langDir)) { console.error("No en/ events dir found"); process.exit(1); }

    const files = readdirSync(langDir).filter(f => f.endsWith(".md"));
    for (const file of files) {
      const filePath = join(langDir, file);
      const fm = parseFrontmatter(filePath);
      if (!fm) continue;

      const slug = file.replace(".md", "");
      console.log(`📌 ${fm.title || slug}`);
      await processEvent(
        fm.title || slug,
        fm.date  || new Date().toISOString(),
        fm.eventType || "in-person",
        slug,
        fm.meetingLink || "",
        {
          tags:     parseTags(fm.tags),
          time:     fm.time     || "2:00 PM – 4:00 PM",
          speaker:  fm.speaker  || "",
          location: fm.location || "",
        }
      );
    }
  } else if (flags.title) {
    const slug = slugify(flags.title);
    console.log(`📌 Generating thumbnail for: ${flags.title}\n`);
    await processEvent(
      flags.title,
      flags.date || new Date().toISOString(),
      flags.type || "in-person",
      slug,
      flags.meetingLink || "",
      {
        tags:     flags.tags ? flags.tags.split(",").map(t => t.trim()) : [],
        time:     flags.time     || "2:00 PM – 4:00 PM",
        speaker:  flags.speaker  || "",
        location: flags.location || "",
      }
    );
  } else {
    console.log("Usage:");
    console.log('  node scripts/generate-thumbnail.mjs --title "Event Title" --date "2026-02-27" --type "virtual" --meetingLink "https://meet.google.com/xxx" --tags "AI,Research" --time "7:00 PM – 9:00 PM"');
    console.log("  node scripts/generate-thumbnail.mjs --all   # regenerate all event thumbnails");
    process.exit(1);
  }

  console.log("\n✨ Done!\n");
}

main().catch(console.error);
