import crypto from 'crypto';

export interface InferenceClientConfig {
  baseUrl: string;
  apiKey: string;
  hmacSecret: string;
}

export class InferenceClient {
  private config: InferenceClientConfig;

  constructor(config: InferenceClientConfig) {
    this.config = config;
  }

  private generateHmac(body: string): string {
    const hmac = crypto.createHmac('sha256', this.config.hmacSecret);
    hmac.update(body, 'utf-8');
    return hmac.digest('hex');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    // Convert body to string if it's an object, or use empty string for GET requests
    let bodyString = '';
    if (options.body) {
      if (typeof options.body === 'string') {
        bodyString = options.body;
      } else {
        bodyString = JSON.stringify(options.body);
        options.body = bodyString;
      }
    }

    const signature = this.generateHmac(bodyString);
    
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Signature': signature,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`Inference API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async cloneVoice(audioSample: string, name: string) {
    return this.request<{ clone_id: string; status: string }>('/v1/voice/clone', {
      method: 'POST',
      body: JSON.stringify({ audio_sample: audioSample, name }),
    });
  }

  async generateVoice(cloneId: string, text: string, speed: number = 1.0) {
    return this.request<{ audio_url: string; duration_ms: number }>('/v1/voice/generate', {
      method: 'POST',
      body: JSON.stringify({ clone_id: cloneId, text, speed }),
    });
  }

  async generateImage(prompt: string, style: string, size: string = '1024x1024') {
    return this.request<{ image_url: string }>('/v1/image/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, style, size }),
    });
  }

  async composeVideo(voiceAudio: string, images: string[], template: string) {
    return this.request<{ video_url: string; duration_ms: number }>('/v1/video/compose', {
      method: 'POST',
      body: JSON.stringify({ voice_audio: voiceAudio, images, template }),
    });
  }

  async getHealth() {
    return this.request<{ status: string; gpu_memory_free: number; queue_depth: number }>('/v1/health', {
      method: 'GET',
    });
  }

  async getQueueStatus(jobId: string) {
    return this.request<{ status: string; result_url?: string }>(`/v1/queue/${jobId}`, {
      method: 'GET',
    });
  }

  async pollJob(jobId: string, maxRetries = 10): Promise<{ status: string; result_url?: string }> {
    let retries = 0;
    while (retries < maxRetries) {
      const res = await this.getQueueStatus(jobId);
      if (res.status === 'complete' || res.status === 'failed') {
        return res;
      }
      
      const backoff = Math.pow(2, retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoff));
      retries++;
    }
    throw new Error('Timeout polling job status');
  }
}
