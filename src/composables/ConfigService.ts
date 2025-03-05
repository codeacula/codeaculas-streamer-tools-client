import { ref } from 'vue';

import type { ConfigOptions } from '@/interfaces';

const state = {
  apiHost: ref(''),
  isDevelopment: ref(true),
};

function getApiHost() {
  return state.apiHost;
}

function isDevelopment() {
  return state.isDevelopment;
}

function setConfig(config: ConfigOptions) {
  state.apiHost.value = config.apiHost;
  state.isDevelopment.value = config.isDevelopment;
}

function useConfig() {
  return {
    getApiHost,
    isDevelopment,
    setConfig,
  };
}

export default useConfig;
