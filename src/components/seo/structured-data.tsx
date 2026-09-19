/**
 * Emits a JSON-LD block.
 *
 * Rendered in the body rather than pushed through the router's `head`
 * helper: Google reads JSON-LD wherever it appears in the document, and
 * keeping it in the component tree means the data comes from the same props
 * the page renders, instead of a second hand-maintained copy in a route
 * definition — which is how the metadata in this project drifted in the
 * first place.
 */
export function StructuredData({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is our own object, serialized here. `<` is escaped
      // because a literal `</script>` inside the JSON would close the tag
      // early and put the rest of the document in the wrong context.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const SITE_URL = "https://theweastwing.com";

/**
 * The site itself, declared as satire.
 *
 * `SatiricalArticle` is a real schema.org type and a subtype of Article, so
 * declaring it alongside NewsArticle keeps the page eligible for the same
 * rich results while carrying the signal in the markup rather than only in
 * prose a crawler has to interpret.
 */
export function siteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "The Weast Wing",
        description:
          "A satirical publication. All agencies, officials and statements are invented; sourced allegations are summarized as allegations.",
        publisher: { "@id": `${SITE_URL}/#publisher` },
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#publisher`,
        name: "The Weast Wing",
        url: SITE_URL,
        description:
          "A fictional publication producing political satire. Not a government agency and not affiliated with one.",
      },
    ],
  };
}

/** One satirical piece — an incident file today, a press release later. */
export function satiricalArticleStructuredData(input: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["SatiricalArticle", "NewsArticle"],
    headline: input.headline,
    description: input.description,
    url: input.url,
    datePublished: input.datePublished,
    ...(input.image ? { image: [input.image] } : {}),
    isAccessibleForFree: true,
    publisher: { "@id": `${SITE_URL}/#publisher` },
    // Says in the data what the chip says on the page.
    genre: "satire",
    creativeWorkStatus: "Satire",
  };
}
