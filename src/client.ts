import path from 'path';
import axios from 'axios';

interface RequestConfig {
  url: string
  token?: string
  username?: string
  password?: string
}

interface Snippet {
  content: string
  created_at: string
  language: string
  name: string
  public: boolean
  updated_at: string
}

interface AuthRequest {
  username: string
  password: string
  provider: 'local'
}

interface RequestOptions {
  headers: { Authorization?: string }
}

const getToken = async ({ token, url, username, password }: RequestConfig): Promise<string | undefined> => {
  if (token) {
    return token;
  }

  if (username && password) {
    const body: AuthRequest = { username, password, provider: 'local' };
    const res = await axios.post(path.join(url, "/auth"), body);

    return res.headers.authorization;
  }
};

export const getSnippets = async (config: RequestConfig): Promise<Snippet[]> => {
  const options: RequestOptions = { headers: {} };

  if (config.token || (config.username && config.password)) {
    options.headers.Authorization = `Bearer ${getToken(config)}`;
  }

  const res = await axios.get(path.join(config.url, "/snippets"), options);

  return res.data["snippets"] as Snippet[];
};

export const createSnippet = async (config: RequestConfig, { content, language, name }: Partial<Snippet>): Promise<Snippet> => {
  const options: RequestOptions = { headers: {} };

  if (config.token || (config.username && config.password)) {
    const bearerToken = await getToken(config);

    options.headers.Authorization = `Bearer ${bearerToken}`;
  }

  return await axios.post(path.join(config.url, "/snippets"), { content, language, name, public: true }, options);
};
