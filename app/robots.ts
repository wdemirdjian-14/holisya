import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

// Robots d'IA / LLM explicitement autorisés (référencement dans ChatGPT, Claude,
// Perplexity, Gemini, etc.). On les liste pour lever toute ambiguïté : par défaut
// autorisés, mais certains n'explorent que si on les nomme ou respectent des règles dédiées.
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',       // OpenAI / ChatGPT
  'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'Claude-User', 'Claude-SearchBot', // Anthropic / Claude
  'PerplexityBot', 'Perplexity-User',              // Perplexity
  'Google-Extended',                               // Gemini / Bard (indexation IA Google)
  'Applebot-Extended',                             // Apple Intelligence
  'Amazonbot', 'Bytespider', 'CCBot', 'Meta-ExternalAgent', 'cohere-ai', 'Diffbot', 'DuckAssistBot',
];

export default function robots(): MetadataRoute.Robots {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') ?? process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, '') ?? 'holisya.fr';
  const siteUrl = `https://${host}`;
  const disallow = ['/api/', '/admin/', '/espace-membre/'];

  return {
    rules: [
      // Moteurs classiques + tout le reste.
      { userAgent: '*', allow: '/', disallow },
      // Robots d'IA : explicitement autorisés sur le contenu public.
      ...AI_BOTS.map((bot) => ({ userAgent: bot, allow: '/', disallow })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
