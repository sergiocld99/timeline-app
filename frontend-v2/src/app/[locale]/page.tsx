import { Suspense } from "react";
import HomePageClient from "@/components/pages/HomePageClient";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomePageClient />
    </Suspense>
  );
}
