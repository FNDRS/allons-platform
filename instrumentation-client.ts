import * as Sentry from "@sentry/nextjs";
import { isSentryConfigured, sentryBaseOptions } from "./sentry.shared";

if (isSentryConfigured) {
  Sentry.init({
    ...sentryBaseOptions,
    // Session replay is deliberately off: checkout and the comercio panel show
    // buyer names, emails and sales figures.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // Scripts that in-app browsers (Instagram, Facebook, Snapchat) and wallet
    // or Firefox extensions inject into every page. None of these names exist
    // in our code, and the page works fine around them.
    ignoreErrors: [
      "window.ethereum",
      "__firefox__",
      "SCDynimacBridge",
      "window.webkit.messageHandlers",
    ],
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
