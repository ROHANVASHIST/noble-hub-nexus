import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://noble-hub-nexus.lovable.app";

interface SeoProps {
  title: string;
  description: string;
  /** Override the canonical path (defaults to the current route). */
  path?: string;
  /** Optional JSON-LD structured data for this page. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/** Per-route title, description, canonical and social metadata. */
const Seo = ({ title, description, path, jsonLd }: SeoProps) => {
  const { pathname } = useLocation();
  const url = `${SITE_URL}${path ?? pathname}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default Seo;
