import * as Sentry from "@sentry/nextjs";
import { isSentryConfigured, sentryBaseOptions } from "./sentry.shared";

if (isSentryConfigured) {
  Sentry.init({
    ...sentryBaseOptions,
    // Session replay is deliberately off: checkout and the comercio panel show
    // buyer names, emails and sales figures.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
