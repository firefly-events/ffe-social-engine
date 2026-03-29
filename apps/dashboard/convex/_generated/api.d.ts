/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as authHelpers from "../authHelpers.js";
import type * as composedVideos from "../composedVideos.js";
import type * as content from "../content.js";
import type * as exportHistory from "../exportHistory.js";
import type * as generationJobs from "../generationJobs.js";
import type * as http from "../http.js";
import type * as media from "../media.js";
import type * as posts from "../posts.js";
import type * as schedules from "../schedules.js";
import type * as sessions from "../sessions.js";
import type * as socialAccounts from "../socialAccounts.js";
import type * as users from "../users.js";
import type * as variants from "../variants.js";
import type * as voiceClones from "../voiceClones.js";
import type * as voices from "../voices.js";
import type * as workflowRuns from "../workflowRuns.js";
import type * as workflows from "../workflows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  authHelpers: typeof authHelpers;
  composedVideos: typeof composedVideos;
  content: typeof content;
  exportHistory: typeof exportHistory;
  generationJobs: typeof generationJobs;
  http: typeof http;
  media: typeof media;
  posts: typeof posts;
  schedules: typeof schedules;
  sessions: typeof sessions;
  socialAccounts: typeof socialAccounts;
  users: typeof users;
  variants: typeof variants;
  voiceClones: typeof voiceClones;
  voices: typeof voices;
  workflowRuns: typeof workflowRuns;
  workflows: typeof workflows;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
