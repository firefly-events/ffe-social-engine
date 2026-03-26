import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Process automation queue every 5 minutes
crons.interval(
  "process automation queue",
  { minutes: 5 },
  internal.automationActions.processQueue
);

// Weekly digest every Monday at 9am UTC
crons.weekly(
  "weekly digest",
  { dayOfWeek: "monday", hourUTC: 9, minuteUTC: 0 },
  internal.automationActions.processWeeklyDigest
);

export default crons;
