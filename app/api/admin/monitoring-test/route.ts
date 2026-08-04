import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminApiAuth";

async function captureMonitoringTestEvent() {
  const { error } = await requireAdminApi();

  if (error) {
    return error;
  }

  if (process.env.MONITORING_TEST_ENABLED !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const eventId = Sentry.captureException(
    new Error("Synthetic production monitoring verification event"),
    {
      tags: {
        monitoring_test: "true",
      },
    },
  );

  await Sentry.flush(2_000);

  return NextResponse.json({ captured: true, eventId });
}

export const GET = captureMonitoringTestEvent;
export const POST = captureMonitoringTestEvent;
