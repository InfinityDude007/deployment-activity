import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode: static build in build/client, deployable to Vercel with no server.
  ssr: false,
} satisfies Config;
