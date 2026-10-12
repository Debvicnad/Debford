// scripts/smoke-test.mjs — Comprehensive Route & API Health Check
const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

const ROUTES = [
  { path: "/", name: "Homepage" },
  { path: "/vehicles", name: "Showroom Catalog" },
  { path: "/vehicles/demo-bmw-m4", name: "Vehicle Detail (Showroom)" },
  { path: "/auctions", name: "Auctions Hub" },
  { path: "/auctions/manage", name: "Auction Manager" },
  { path: "/services", name: "Services Marketplace" },
  { path: "/services/providers", name: "Providers Directory" },
  { path: "/parts", name: "Spare Parts Catalog" },
  { path: "/rentals", name: "Fleet Rentals" },
  { path: "/garage", name: "My Garage" },
  { path: "/dealership", name: "Dealership Command Centre" },
  { path: "/admin", name: "Admin Control Hub" },
  { path: "/saved", name: "Saved Watchlist & Alerts" },
  { path: "/compare", name: "Vehicle Comparison" },
  { path: "/cart", name: "Shopping Cart" },
  { path: "/membership", name: "Membership Tiers" },
  { path: "/ai", name: "AI Automotive Assistant (DEBA)" },
  { path: "/verification", name: "Trust & Identity Verification" },
  { path: "/sitemap.xml", name: "SEO Sitemap XML" },
  { path: "/robots.txt", name: "Robots Crawler Policy" },
  { path: "/manifest.json", name: "PWA Web App Manifest" },
  { path: "/sw.js", name: "PWA Service Worker" },
];

async function runSmokeTests() {
  console.log(`\n======================================================`);
  console.log(`  DEBFORD PLATFORM HEALTH & SMOKE TEST`);
  console.log(`  Target Base: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route.path}`;
    const start = Date.now();
    try {
      const response = await fetch(url, { headers: { "User-Agent": "Debford-SmokeTest/1.0" } });
      const duration = Date.now() - start;
      const status = response.status;

      if (status >= 200 && status < 400) {
        console.log(`  ✓ [${status}] ${route.name.padEnd(32)} ${route.path.padEnd(26)} (${duration}ms)`);
        passed++;
      } else {
        console.error(`  ✗ [${status}] ${route.name.padEnd(32)} ${route.path.padEnd(26)} (${duration}ms)`);
        failed++;
      }
    } catch (err) {
      const duration = Date.now() - start;
      console.error(`  ✗ [ERR] ${route.name.padEnd(32)} ${route.path.padEnd(26)} (${duration}ms) - ${err.message}`);
      failed++;
    }
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`  Total Routes Tested : ${ROUTES.length}`);
  console.log(`  Successful (2xx/3xx): ${passed}`);
  console.log(`  Failures            : ${failed}`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log(`  ALL SMOKE TESTS PASSED - PLATFORM 100% OPERATIONAL\n`);
  }
}

runSmokeTests();
