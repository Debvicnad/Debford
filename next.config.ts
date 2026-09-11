import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jwrbcrtsndptbzabnlvy.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cmJjcnRzbmRwdGJ6YWJubHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDU3NzIsImV4cCI6MjEwNDYyMTc3Mn0.b4oEmDLJ9sJ57Sle9eGM9NMjdP8Lv28D_B0FGjz-CIg",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://debford.vercel.app",
    NEXT_PUBLIC_APP_NAME: "Debford",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
