import { ref } from 'vue';

import useLoggingService from '@/composables/LoggingService';
import type { WebsocketMessage } from '@/interfaces/WebsocketMessage';

import useConfig from './ConfigService';

const { getApiHost } = useConfig();
const log = useLoggingService();

const eventHandlers: Record<string, (payload: unknown) => void> = {};
const ws = ref(null as WebSocket | null);

eventHandlers.connected = () => {
  log.info('Websocket connected');

  // Send a ping to make sure bi-directional communication is working
  send('Ping', 'Ping');
};

eventHandlers.ping = (payload: unknown) => {
  if (typeof payload !== 'string' || payload !== 'Ping') {
    log.warn('Received unexpected payload for ping event');
    return;
  }
};

function connectWebsocket(token: string) {
  const host = getApiHost().value;
  ws.value = new WebSocket(`${host.replace('http', 'ws')}/ws?t=${token}`);

  if (ws.value === null) {
    throw new Error('Failed to create websocket');
  }

  ws.value.onopen = () => {
    log.info('Websocket opened');
  };

  ws.value.onmessage = event => {
    const message: WebsocketMessage<unknown> = JSON.parse(event.data);

    if (eventHandlers[message.Event]) {
      eventHandlers[message.Event](message.Payload);
    } else {
      log.warn(`Unhandled websocket event: ${message.Event}`);
    }
  };
}

function send<T>(event: string, data: T) {
  if (ws.value === null) {
    throw new Error('Websocket not connected');
  }

  ws.value.send(JSON.stringify({ Event: event, Payload: data }));
}

function useWebsockets() {
  return {
    connectWebsocket,
  };
}

export default useWebsockets;
