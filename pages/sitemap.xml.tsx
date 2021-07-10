import React from "react";
import fs from "fs";

import { removeExtension } from "utils/stringUtils";

const Sitemap = () => { };

export const getServerSideProps = async ({ res }) => {
  const baseUrl = "https://polyhaven.com"

  const staticPages = fs
    .readdirSync("pages")
    .filter((staticPage) => {
      return ![
        "sitemap.xml.tsx",
        "a",
        "api",
        "index.tsx",
        "account.tsx",
        "404.tsx",
      ].includes(staticPage) && !staticPage.startsWith('_') && !staticPage.startsWith('[');
    })
    .map((staticPagePath) => {
      return `${baseUrl}/${removeExtension(staticPagePath)}`;
    });


  let dynamicPages = {}
  // Assets
  await fetch(`https://api.polyhaven.com/assets`)
    .then(response => response.json())
    .then(resdata => {
      for (const [slug, info] of Object.entries(resdata)) {
        dynamicPages[`https://polyhaven.com/a/${slug}`] = {
          lastmod: new Date(info['date_published'] * 1000).toISOString(),
          changefreq: "monthly",
          priority: "1.0",
          img: [
            `https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?width=630`,
            `https://cdn.polyhaven.com/asset_img/primary/${slug}.png?height=780`
          ]
        }
      }
    })

  // Categories
  let types = []
  await fetch(`https://api.polyhaven.com/categories/all`)
    .then(response => response.json())
    .then(resdata => {
      for (const type of Object.keys(resdata)) {
        if (type === 'all') continue
        types.push(type)
        dynamicPages[`https://polyhaven.com/${type}`] = {
          lastmod: new Date().toISOString(),
          changefreq: "daily",
          priority: "1.0"
        }
      }
    })
  for (const type of types) {
    await fetch(`https://api.polyhaven.com/categories/${type}`)
      .then(response => response.json())
      .then(resdata => {
        for (const cat of Object.keys(resdata)) {
          if (cat === 'all') continue
          dynamicPages[`https://polyhaven.com/${type}/${encodeURIComponent(cat)}`] = {
            lastmod: new Date().toISOString(),
            changefreq: "monthly",
            priority: "0.5"
          }
        }
      })
  }

  // Compile sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      ${["https://polyhaven.com/", ...staticPages]
      .map((url) => {
        return `
            <url>
              <loc>${url}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>0.5</priority>
            </url>
          `;
      })
      .join("")}
      ${Object.keys(dynamicPages)
      .map((url) => {
        return `
            <url>
              <loc>${url}</loc>
              <lastmod>${dynamicPages[url].lastmod}</lastmod>
              <changefreq>${dynamicPages[url].changefreq}</changefreq>
              <priority>${dynamicPages[url].priority}</priority>
              ${dynamicPages[url].img && dynamicPages[url].img.map(u => `<image:image><image:loc>${u}</image:loc></image:image>`).join("")}
            </url>
          `;
      })
      .join("")}
    </urlset>
  `;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;