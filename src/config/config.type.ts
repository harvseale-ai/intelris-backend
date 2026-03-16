export type Config = {
  app: AppConfig;
  postgres: PostgresConfig;
  openai: OpenAIConfig;
  api: ApiConfig;
  wpApi: WPApiConfig;
};

export type AppConfig = {
  port: number;
  host: string;
};

export type PostgresConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  dbName: string;
};

export type OpenAIConfig = {
  apiKey: string;
  model: string;
  temperature: number;
};

export type ApiConfig = {
  key: string;
};

export type WPApiConfig = {
  baseUrl: string;
  apiKey: string;
};
