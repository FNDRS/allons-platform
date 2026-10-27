const APP_ID = "F5AC2P3U57.com.fndrs.allons";

export function GET() {
  return Response.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: APP_ID,
            // Order matters: the first match wins, so the exclusions go
            // before the wildcards. The reserve page stays in the browser:
            // the app has no route for it, and the purchase belongs on the
            // web until the app's hosted checkout is fixed in a store build.
            paths: [
              "NOT /eventos/*/reservar",
              "NOT /eventos/*/reservar/*",
              "NOT /events/*/reservar",
              "NOT /events/*/reservar/*",
              "/verify",
              "/verify/*",
              "/tickets",
              "/tickets/*",
              "/events",
              "/events/*",
              "/eventos",
              "/eventos/*",
            ],
          },
        ],
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
