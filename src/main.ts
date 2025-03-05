import './assets/main.css';

import { createApp } from 'vue';

import useAuth from '@/composables/AuthService';
import useConfig from '@/composables/ConfigService';
import useLoggingService from '@/composables/LoggingService';
import useWebsockets from '@/composables/WebsocketService';

import App from './App.vue';

const auth = useAuth();
const log = useLoggingService();
const { setConfig } = useConfig();

async function init() {
  const isDevelopment = import.meta.env.MODE === 'development';
  // Using environment variables or defaults for API endpoints
  const apiHost =
    import.meta.env.VITE_API_HOST || (isDevelopment ? 'http://localhost:5035' : 'https://api.example.com');

  setConfig({ apiHost, isDevelopment });

  const openWebsocket = await auth.provisionToken();

  if (openWebsocket) {
    log.info('Opening websocket');
    const { connectWebsocket } = useWebsockets();
    connectWebsocket(auth.getToken()!);
  }

  log.info('Creating app');
  const app = createApp(App);

  app.mount('#app');
}

init();
