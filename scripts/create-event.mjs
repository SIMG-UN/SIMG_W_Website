#!/usr/bin/env node
/**
 * create-event.mjs
 * 
 * Interactive CLI tool to easily create new SIMG events.
 * Generates markdown content files for both EN and ES,
 * and optionally generates thumbnails.
 * 
 * Usage:
 *   node scripts/create-event.mjs
 *   node scripts/create-event.mjs --non-interactive --title "My Event" --date "2026-04-01" ...
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const EVENTS_EN = join(ROOT, "src", "content", "events", "en");
const EVENTS_ES = join(ROOT, "src", "content", "events", "es");

// Ensure directories exist
[EVENTS_EN, EVENTS_ES].forEach(dir => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
});

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateMarkdown(data, lang) {
  const isEn = lang === "en";
  return `---
title: "${data.title[lang]}"
description: "${data.description[lang]}"
date: ${data.date}
time: "${data.time}"
speaker: "${data.speaker}"
eventType: "${data.eventType}"
${data.eventType !== "virtual" ? `location: "${data.location}"
building: "${data.building}"
room: "${data.room}"` : ""}
${data.meetingLink ? `meetingLink: "${data.meetingLink}"
meetingPlatform: "${data.meetingPlatform || "Google Meet"}"` : ""}
googleCalendarLink: ""
recurrent: ${data.recurrent || false}
thumbnail: "/images/events/${data.slug}.svg"
banner: ""
resources: []
recordingUrl: ""
tags: [${data.tags.map(t => `"${t}"`).join(", ")}]
status: "upcoming"
lang: "${lang}"
translationKey: "${data.slug}"
participants: []
duration: "${data.duration}"
---

${data.body[lang]}
`;
}

async function interactiveMode() {
  console.log("\n🐢 SIMG Event Creator\n");
  console.log("Fill in the event details below. Press Enter to use defaults shown in [brackets].\n");

  // English title
  const titleEn = await ask("📝 Event title (EN): ");
  const titleEs = await ask("📝 Event title (ES): ");

  const descEn = await ask("📄 Short description (EN): ");
  const descEs = await ask("📄 Short description (ES): ");

  const date = await ask("📅 Date (YYYY-MM-DD) [next Friday]: ") || getNextFriday();
  const time = await ask("⏰ Time [2:00 PM - 4:00 PM]: ") || "2:00 PM - 4:00 PM";
  const speaker = await ask("🎤 Speaker [SIMG Research Group]: ") || "SIMG Research Group";
  const duration = await ask("⏱️ Duration [1h 30m]: ") || "1h 30m";

  const eventTypeInput = await ask("📍 Event type (1=in-person, 2=virtual, 3=hybrid) [1]: ") || "1";
  const typeMap = { "1": "in-person", "2": "virtual", "3": "hybrid" };
  const eventType = typeMap[eventTypeInput] || "in-person";

  let location = "", building = "", room = "", meetingLink = "", meetingPlatform = "";

  if (eventType !== "virtual") {
    location = await ask("📍 Location [Universidad Nacional de Colombia, Bogotá]: ") || "Universidad Nacional de Colombia, Bogotá";
    building = await ask("🏛️ Building [404 - Yu Takeuchi]: ") || "404 - Yu Takeuchi";
    room = await ask("🚪 Room [202-405]: ") || "202-405";
  }

  if (eventType !== "in-person") {
    meetingLink = await ask("🔗 Meeting link: ") || "";
    meetingPlatform = await ask("💻 Platform [Google Meet]: ") || "Google Meet";
  }

  const tagsInput = await ask("🏷️ Tags (comma separated) [AI, Research]: ") || "AI, Research";
  const tags = tagsInput.split(",").map(t => t.trim());

  console.log("\n📝 Now enter the event body content (markdown). Type 'END' on a new line when done.\n");

  const bodyEn = await collectMultiline("Body (EN):");
  const bodyEs = await collectMultiline("Body (ES):");

  const slug = slugify(titleEn);

  const data = {
    title: { en: titleEn, es: titleEs },
    description: { en: descEn, es: descEs },
    date,
    time,
    speaker,
    eventType,
    location,
    building,
    room,
    meetingLink,
    meetingPlatform,
    tags,
    duration,
    slug,
    recurrent: false,
    body: { en: bodyEn, es: bodyEs },
  };

  // Generate files
  const enPath = join(EVENTS_EN, `${slug}.md`);
  const esPath = join(EVENTS_ES, `${slug}.md`);

  writeFileSync(enPath, generateMarkdown(data, "en"), "utf-8");
  writeFileSync(esPath, generateMarkdown(data, "es"), "utf-8");

  console.log(`\n✅ Event files created:`);
  console.log(`   EN: src/content/events/en/${slug}.md`);
  console.log(`   ES: src/content/events/es/${slug}.md`);

  // Generate thumbnail
  const genThumb = await ask("\n🎨 Generate thumbnail? (y/n) [y]: ") || "y";
  if (genThumb.toLowerCase() === "y") {
    const { execSync } = await import("child_process");
    try {
      execSync(`node scripts/generate-thumbnail.mjs --title "${titleEn}" --date "${date}" --type "${eventType}"`, {
        cwd: ROOT,
        stdio: "inherit",
      });
    } catch (e) {
      console.warn("⚠️  Thumbnail generation failed:", e.message);
    }
  }

  console.log("\n🐢 All done! Run 'bun run dev' to preview your new event.\n");
  rl.close();
}

async function collectMultiline(label) {
  console.log(`  ${label} (type END to finish)`);
  const lines = [];
  while (true) {
    const line = await ask("  > ");
    if (line.trim() === "END") break;
    lines.push(line);
  }
  return lines.join("\n");
}

function getNextFriday() {
  const today = new Date();
  const day = today.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  return nextFriday.toISOString().split("T")[0];
}

// Non-interactive mode support
const args = process.argv.slice(2);
if (args.includes("--non-interactive")) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--") && args[i] !== "--non-interactive") {
      const key = args[i].replace("--", "");
      flags[key] = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : "";
      if (flags[key]) i++;
    }
  }

  const slug = slugify(flags.title || "untitled-event");
  const data = {
    title: { en: flags.title || "Untitled Event", es: flags["title-es"] || flags.title || "Evento sin título" },
    description: { en: flags.desc || "", es: flags["desc-es"] || flags.desc || "" },
    date: flags.date || getNextFriday(),
    time: flags.time || "2:00 PM - 4:00 PM",
    speaker: flags.speaker || "SIMG Research Group",
    eventType: flags.type || "in-person",
    location: flags.location || "Universidad Nacional de Colombia, Bogotá",
    building: flags.building || "404 - Yu Takeuchi",
    room: flags.room || "202-405",
    meetingLink: flags["meeting-link"] || "",
    meetingPlatform: flags.platform || "",
    tags: (flags.tags || "AI,Research").split(",").map(t => t.trim()),
    duration: flags.duration || "1h 30m",
    slug,
    recurrent: false,
    body: { en: flags.body || "", es: flags["body-es"] || flags.body || "" },
  };

  writeFileSync(join(EVENTS_EN, `${slug}.md`), generateMarkdown(data, "en"), "utf-8");
  writeFileSync(join(EVENTS_ES, `${slug}.md`), generateMarkdown(data, "es"), "utf-8");
  console.log(`✅ Created: ${slug}.md (en + es)`);
  rl.close();
} else {
  interactiveMode();
}
