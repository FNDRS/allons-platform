const APP_ID = "F5AC2P3U57.com.fndrs.allons";

export function GET() {
  return Response.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: APP_ID,
            paths: [
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
