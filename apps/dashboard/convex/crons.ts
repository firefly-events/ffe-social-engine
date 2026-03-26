import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Weekly digest - runs every Monday at 9am UTC
crons.weekly(
  "weekly event digest",
  { dayOfWeek: "monday", hourUTC: 9, minuteUTC: 0 },
  internal.automations.processWeeklyDigests,
);

export default crons;
