const isDevelopment = import.meta.env.MODE === 'development';
const preamble = '🔮 The Orb Reveals 🔮';

function info(...messages: unknown[]) {
  console.log(preamble, ...messages);
}

function warn(...messages: unknown[]) {
  if (isDevelopment) {
    console.warn(preamble, ...messages);
  }
}

function error(...messages: unknown[]) {
  console.error(preamble, ...messages);
}

function useLoggingService() {
  return {
    info,
    warn,
    error,
  };
}

export default useLoggingService;
