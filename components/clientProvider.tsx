"use client";

import { CacheProvider } from "@emotion/react";
import { createEmotionCache } from "@/utils/createEmotionCache";

const clientSideEmotionCache = createEmotionCache();

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CacheProvider value={clientSideEmotionCache}>{children}</CacheProvider>
  );
}
