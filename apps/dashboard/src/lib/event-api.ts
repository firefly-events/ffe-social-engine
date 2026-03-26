export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  category?: string;
  imageUrl?: string;
  url?: string;
}

const getBaseUrl = () => process.env.EVENT_API_BASE_URL || "";
const getApiKey = () => process.env.EVENT_API_KEY || "";

async function apiFetch<T>(path: string): Promise<T | null> {
  const baseUrl = getBaseUrl();
  const apiKey = getApiKey();

  if (!baseUrl || !apiKey) {
    console.error("Event API not configured: missing EVENT_API_BASE_URL or EVENT_API_KEY");
    return null;
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`Event API error: ${res.status} ${res.statusText}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Event API fetch failed:", error);
    return null;
  }
}

export async function getUpcomingEvents(
  limit: number = 10
): Promise<EventData[]> {
  const result = await apiFetch<EventData[]>(
    `/events/upcoming?limit=${limit}`
  );
  return result || [];
}

export async function getEvent(eventId: string): Promise<EventData | null> {
  return await apiFetch<EventData>(`/events/${eventId}`);
}

export async function searchEvents(query: string): Promise<EventData[]> {
  const result = await apiFetch<EventData[]>(
    `/events/search?q=${encodeURIComponent(query)}`
  );
  return result || [];
}
