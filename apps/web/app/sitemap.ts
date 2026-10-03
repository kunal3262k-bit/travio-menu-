import type { MetadataRoute } from "next";

const SITE_URL = "https://justswifttab.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  return [
    { url: SITE_URL, lastModified: currentDate, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/demo`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/register`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/login`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/llms.txt`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/llms-full.txt`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.6 },
  ];
}
