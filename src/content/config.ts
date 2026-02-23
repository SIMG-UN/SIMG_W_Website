// Note que la configuracion esta dentro de la caarpeta content para que las subcarpeteas se consideren automaticamente contenidos
// y no hay un src/content.config.ts

import { defineCollection, z } from 'astro:content';

// Remember z is from the Zod library to provide Zod validation

// Esquema para miembros
const membersCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    position: z.string(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    image: z.string().optional(),
    bio: z.string().optional(), // Short bio for card
    order: z.number().default(99), // Para ordenar los miembros
    lang: z.enum(['en', 'es']), // Idioma del contenido
    translationKey: z.string(), // Clave para relacionar contenido en diferentes idiomas
  })
});


// Esquema para entradas de blog
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    image: z.string().optional(),
    pubDate: z.date(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['en', 'es']),
    translationKey: z.string(),
  })
});

// Esquema para investigaciones
const researchCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    category: z.enum(['Research', 'Products', 'Partnerships & Outreach']).optional(),
    researchers: z.array(z.string()).optional(),
    status: z.enum(['active', 'completed', 'planned']).default('active'),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['en', 'es']),
    translationKey: z.string(),
    // Opción 1: Un solo enlace externo
    link: z.string().url().optional(),
    linkText: z.string().optional(),
    // Opción 2: Múltiples enlaces externos
    links: z
      .array(
        z.object({
          url: z.string().url(),
          text: z.string()
        })
      )
      .optional(),
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NEW: Extended article fields for publications/announcements
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Project type (e.g., "Research Paper", "Product Launch", "Announcement")
    projectType: z.string().optional(),
    
    // Publication date for announcements/papers
    publicationDate: z.date().optional(),
    
    // Academic publications (papers, preprints, etc.)
    publications: z
      .array(
        z.object({
          title: z.string(),
          authors: z.array(z.string()).optional(),
          venue: z.string().optional(), // e.g., "NeurIPS 2024", "arXiv"
          date: z.date().optional(),
          url: z.string().url().optional(),
          pdf: z.string().url().optional(),
          arxiv: z.string().optional(), // arXiv ID like "2507.13264"
          doi: z.string().optional(),
          type: z.enum(['preprint', 'conference', 'journal', 'workshop']).optional(),
        })
      )
      .optional(),
    
    // Related resources (demos, code, datasets, etc.)
    resources: z
      .array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          url: z.string().url(),
          type: z.enum(['demo', 'code', 'dataset', 'model', 'blog', 'other']).optional(),
        })
      )
      .optional(),
    
    // Key highlights/features for the project
    highlights: z.array(z.string()).optional(),
    
    // Team/collaborators information
    collaborators: z
      .array(
        z.object({
          name: z.string(),
          affiliation: z.string().optional(),
          url: z.string().url().optional(),
        })
      )
      .optional(),
    
    // Funding/sponsors
    funding: z.array(z.string()).optional(),
  })
});

// Esquema para eventos
const eventsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    endDate: z.date().optional(),
    time: z.string(), // e.g., "2:00 PM - 4:00 PM"
    speaker: z.string(),
    eventType: z.enum(['in-person', 'virtual', 'hybrid']),
    // Location for in-person events
    location: z.string().optional(),
    building: z.string().optional(),
    room: z.string().optional(),
    // Virtual meeting details
    meetingLink: z.string().url().optional(),
    meetingPlatform: z.enum(['zoom', 'meet', 'teams', 'discord', 'other']).optional(),
    // Google Calendar integration
    googleCalendarLink: z.string().url().optional(),
    recurrent: z.boolean().default(false),
    recurrenceRule: z.string().optional(), // RRULE format e.g. "FREQ=WEEKLY;BYDAY=FR"
    // Thumbnail/banner
    thumbnail: z.string().optional(), // path to auto-generated or custom thumbnail
    banner: z.string().optional(),
    // Resources (slides, notebooks, recordings, etc.)
    resources: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
      type: z.enum(['slides', 'notebook', 'code', 'recording', 'paper', 'other']).optional(),
    })).optional(),
    // YouTube recording link
    recordingUrl: z.string().url().optional(),
    // Tags
    tags: z.array(z.string()).default([]),
    // Event status
    status: z.enum(['upcoming', 'live', 'completed', 'cancelled']).default('upcoming'),
    // i18n
    lang: z.enum(['en', 'es']),
    translationKey: z.string(),
    // Participants
    participants: z.array(z.string()).optional(),
    // Duration in readable format
    duration: z.string().optional(),
  })
});

// Exportar colecciones
export const collections = {
  'members': membersCollection,
  'blog': blogCollection,
  'research': researchCollection,
  'events': eventsCollection,
};
