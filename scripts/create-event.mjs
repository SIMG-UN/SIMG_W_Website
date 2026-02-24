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

/**
 * Extract the first HTTP/HTTPS URL found in any text.
 * Useful when users paste Google Calendar invite text that contains the Meet link.
 */
function extractUrl(text) {
  if (!text) return "";
  const match = text.match(/https?:\/\/[^\s"'<>]+/);
  return match ? match[0].replace(/[.,;)\]]+$/, "") : "";
}

/**
 * Detect the meeting platform enum value from a URL.
 * Returns one of: 'zoom' | 'meet' | 'teams' | 'discord' | 'other'
 */
function detectPlatform(url) {
  if (!url) return "other";
  if (url.includes("meet.google.com")) return "meet";
  if (url.includes("zoom.us")) return "zoom";
  if (url.includes("teams.microsoft.com") || url.includes("teams.live.com")) return "teams";
  if (url.includes("discord.gg") || url.includes("discord.com")) return "discord";
  return "other";
}

/**
 * Generate a Google Calendar "Add to Calendar" URL from event data.
 * Times are assumed to be in GMT-5 (Colombia/Bogotá).
 */
function generateGoogleCalendarUrl(title, date, time, description, meetingLink) {
  try {
    // Parse start/end times like "7:00 PM - 9:00 PM"
    const timeParts = time.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*[-–]\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
    let startStr, endStr;

    const parseTime12 = (t) => {
      const m = t.trim().match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
      if (!m) return null;
      let h = parseInt(m[1]);
      const min = parseInt(m[2]);
      const ampm = m[3].toUpperCase();
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return { h, min };
    };

    const [year, month, day] = date.split("-").map(Number);
    const pad = (n) => String(n).padStart(2, "0");

    if (timeParts) {
      const start = parseTime12(timeParts[1]);
      const end = parseTime12(timeParts[2]);
      // Convert GMT-5 → UTC (+5h)
      const toUTC = ({ h, min }) => {
        const totalMin = h * 60 + min + 5 * 60;
        const utcH = Math.floor(totalMin / 60) % 24;
        const utcMin = totalMin % 60;
        const dayOffset = Math.floor((h * 60 + min + 5 * 60) / (24 * 60));
        const d = new Date(year, month - 1, day + dayOffset);
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(utcH)}${pad(utcMin)}00Z`;
      };
      if (start && end) {
        startStr = toUTC(start);
        endStr = toUTC(end);
      }
    }

    // Fallback: use full day
    if (!startStr) {
      startStr = `${year}${pad(month)}${pad(day)}`;
      endStr = startStr;
    }

    const enc = encodeURIComponent;
    const details = meetingLink
      ? `Join via Google Meet: ${meetingLink}`
      : description;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(title)}&dates=${startStr}%2F${endStr}&details=${enc(details)}&location=${enc(meetingLink || "")}`;
  } catch {
    return "";
  }
}

function generateMarkdown(data, lang) {
  const locationBlock = data.eventType !== "virtual"
    ? `location: "${data.location}"
building: "${data.building}"
room: "${data.room}"` : "";

  const meetingBlock = data.meetingLink
    ? `meetingLink: "${data.meetingLink}"
meetingPlatform: "${data.meetingPlatform}"` : "";

  const calBlock = data.googleCalendarLink
    ? `googleCalendarLink: "${data.googleCalendarLink}"` : "";

  return `---
title: "${data.title[lang]}"
description: "${data.description[lang]}"
date: ${data.date}
time: "${data.time}"
speaker: "${data.speaker}"
eventType: "${data.eventType}"
${locationBlock}
${meetingBlock}
${calBlock}
recurrent: ${data.recurrent || false}
thumbnail: "/images/events/${data.slug}.svg"
resources: []
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
    const rawLink = await ask("🔗 Meeting link (paste URL or full Google Calendar invite text): ");
    meetingLink = extractUrl(rawLink) || rawLink.trim();
    // Auto-detect platform from the extracted URL
    const platformDetected = detectPlatform(meetingLink);
    const platformInput = await ask(`💻 Platform [${platformDetected === "meet" ? "Google Meet" : platformDetected}] (zoom/meet/teams/discord/other): `);
    meetingPlatform = platformInput.trim() || platformDetected;
    // Normalize to enum
    const platformMap = { "google meet": "meet", "googlemeet": "meet", "zoom": "zoom", "teams": "teams", "discord": "discord" };
    meetingPlatform = platformMap[meetingPlatform.toLowerCase()] || meetingPlatform || "other";
    console.log(`  ✅ Extracted URL: ${meetingLink}`);
    console.log(`  ✅ Platform: ${meetingPlatform}`);
  }

  const tagsInput = await ask("🏷️ Tags (comma separated) [AI, Research]: ") || "AI, Research";
  const tags = tagsInput.split(",").map(t => t.trim());

  console.log("\n📝 Now enter the event body content (markdown). Type 'END' on a new line when done.\n");

  const bodyEn = await collectMultiline("Body (EN):");
  const bodyEs = await collectMultiline("Body (ES):");

  const slug = slugify(titleEn);

  // Auto-generate Google Calendar link from event data
  const googleCalendarLink = generateGoogleCalendarUrl(
    titleEn, date, time,
    descEn,
    meetingLink
  );
  if (googleCalendarLink) {
    console.log(`\n  📅 Google Calendar link auto-generated!`);
  }

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
    googleCalendarLink,
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
      const meetArg  = meetingLink ? ` --meetingLink "${meetingLink}"` : "";
      const tagsArg  = tags.length  ? ` --tags "${tags.join(",")}"` : "";
      const timeArg  = time         ? ` --time "${time}"` : "";
      execSync(`node scripts/generate-thumbnail.mjs --title "${titleEn}" --date "${date}" --type "${eventType}"${meetArg}${tagsArg}${timeArg}`, {
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
