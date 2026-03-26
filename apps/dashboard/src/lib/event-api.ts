export interface EventApiEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  venue: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  ticketUrl?: string;
  organizer: string;
  tags: string[];
}

export interface EventApiFilters {
  categories?: string[];
  location?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface EventApiResponse {
  events: EventApiEvent[];
  total: number;
  hasMore: boolean;
}

const EVENT_API_BASE_URL = process.env.EVENT_API_BASE_URL || "https://api.fireflyevents.com/v1";
const EVENT_API_KEY = process.env.EVENT_API_KEY || "";

async function eventApiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${EVENT_API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${EVENT_API_KEY}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Event API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchEvents(filters: EventApiFilters = {}): Promise<EventApiResponse> {
  const params = new URLSearchParams();
  if (filters.categories?.length) params.set("categories", filters.categories.join(","));
  if (filters.location) params.set("location", filters.location);
  if (filters.startDate) params.set("start_date", filters.startDate);
  if (filters.endDate) params.set("end_date", filters.endDate);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  const query = params.toString();
  return eventApiFetch<EventApiResponse>(`/events${query ? `?${query}` : ""}`);
}

export async function fetchEventById(eventId: string): Promise<EventApiEvent> {
  return eventApiFetch<EventApiEvent>(`/events/${encodeURIComponent(eventId)}`);
}

export async function registerWebhook(callbackUrl: string, eventTypes: string[]): Promise<{ webhookId: string }> {
  return eventApiFetch<{ webhookId: string }>("/webhooks", {
    method: "POST",
    body: JSON.stringify({ url: callbackUrl, events: eventTypes }),
  });
}
