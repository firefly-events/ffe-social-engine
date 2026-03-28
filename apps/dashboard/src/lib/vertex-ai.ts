import { createVertex } from '@ai-sdk/google-vertex';

/**
 * Creates a Vertex AI provider instance authenticated via service account.
 * Reads GOOGLE_SERVICE_ACCOUNT_KEY (JSON string) from env.
 * Falls back to ADC if the key is not set (local dev with gcloud auth).
 */
function buildVertexProvider() {
  const project = process.env.GOOGLE_CLOUD_PROJECT ?? 'social-engine-dev';
  const location = 'us-central1';

  const saKeyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (saKeyJson) {
    let sa: { client_email: string; private_key: string; project_id?: string };
    try {
      sa = JSON.parse(saKeyJson);
    } catch {
      throw new Error(
        'GOOGLE_SERVICE_ACCOUNT_KEY is set but contains invalid JSON. ' +
          'Check that the secret was synced correctly from GCP Secret Manager.'
      );
    }
    if (!sa.client_email || !sa.private_key) {
      throw new Error(
        'GOOGLE_SERVICE_ACCOUNT_KEY JSON is missing required fields: client_email and/or private_key.'
      );
    }
    return createVertex({
      project: sa.project_id ?? project,
      location,
      googleAuthOptions: {
        credentials: {
          client_email: sa.client_email,
          private_key: sa.private_key,
        },
      },
    });
  }

  // Local dev — relies on Application Default Credentials (gcloud auth application-default login)
  return createVertex({ project, location });
}

export const vertex = buildVertexProvider();
