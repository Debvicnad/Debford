import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/vehicles", "/search", "/auctions", "/rentals", "/parts", "/services", "/compare"],
        disallow: [
          "/admin",
          "/dashboard",
          "/dealership",
          "/garage",
          "/messages",
          "/notifications",
          "/profile",
          "/sell",
          "/checkout",
          "/cart",
          "/api/",
          "/verification",
        ],
      },
      {
        // Allow all major search engine bots full crawl of public content
        userAgent: ["Googlebot", "Bingbot", "Slurp", "DuckDuckBot"],
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout", "/dashboard"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
