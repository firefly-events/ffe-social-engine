export class ZernioClient {
  private apiKey: string;
  private baseUrl = 'https://api.zernio.com/v1';

  constructor() {
    this.apiKey = process.env.ZERNIO_API_KEY || '';
  }

  async connectAccount(userId: string) {
    const res = await fetch(`${this.baseUrl}/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to connect Zernio account');
    return res.json();
  }

  async getAccounts(zernioProfileId: string) {
    const res = await fetch(`${this.baseUrl}/profiles/${zernioProfileId}/accounts`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch Zernio accounts');
    return res.json();
  }

  async createPost(zernioProfileId: string, content: string, platforms: string[]) {
    const res = await fetch(`${this.baseUrl}/profiles/${zernioProfileId}/post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, platforms })
    });
    if (!res.ok) throw new Error('Failed to create Zernio post');
    return res.json();
  }

  async getAnalytics(postId: string) {
    const res = await fetch(`${this.baseUrl}/posts/${postId}/analytics`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch Zernio analytics');
    return res.json();
  }
}

export const zernio = new ZernioClient();
