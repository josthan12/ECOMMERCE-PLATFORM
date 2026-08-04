import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

function stripQueryAndFragment(url: string) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}${parsedUrl.pathname}`;
  } catch {
    return url.split(/[?#]/, 1)[0];
  }
}

export const sentryPrivacyOptions = {
  enableLogs: false,
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: {
      request: false,
      response: false,
    },
    httpBodies: [],
    urlQueryParams: false,
    graphQL: {
      document: false,
      variables: false,
    },
    genAI: {
      inputs: false,
      outputs: false,
    },
    databaseQueryData: false,
    stackFrameVariables: false,
  },
  beforeSend(event: ErrorEvent) {
    delete event.user;

    if (event.request) {
      if (event.request.url) {
        event.request.url = stripQueryAndFragment(event.request.url);
      }

      delete event.request.cookies;
      delete event.request.data;
      delete event.request.env;
      delete event.request.headers;
      delete event.request.query_string;
    }

    return event;
  },
  beforeBreadcrumb(breadcrumb: Breadcrumb) {
    return {
      ...breadcrumb,
      data: undefined,
    };
  },
};
