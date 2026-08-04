import * as Sentry from "@sentry/nextjs";
import { sentryPrivacyOptions } from "@/lib/monitoring/sentryPrivacy";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: "production",
  ...sentryPrivacyOptions,
});
