import { AppConfig } from './env';

export const EnvScript = ({ config }: { config: AppConfig }) => {
  return (
    <script
      id="env-vars"
      dangerouslySetInnerHTML={{
        __html: `window.__ENV = ${JSON.stringify(config)};`,
      }}
    />
  );
};
