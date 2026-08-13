import type { MetadataRoute } from "next";

const SITE_URL = "https://justswifttab.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-11T00:00:00+05:30");

  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/demo`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/register`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/login`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/llms.txt`, lastModified, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/llms-full.txt`, lastModified, changeFrequency: "weekly", priority: 0.5 },
  ];
}
