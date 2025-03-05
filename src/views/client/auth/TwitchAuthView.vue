<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import useAuth from '@/composables/AuthService';
import useLoggingService from '@/composables/LoggingService';
import router from '@/router';

const { setToken, useTwitchOauth } = useAuth();
const log = useLoggingService();

const urlParams = new URLSearchParams(window.location.search);

const errorCode = ref(null as string | null);
const errorMessage = ref(null as string | null);

const showError = ref(false);

onMounted(async () => {
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  if (!code || !state) {
    errorCode.value = urlParams.get('error');
    errorMessage.value = urlParams.get('error_description');
    showError.value = true;
    return;
  }

  const jwtResult = await useTwitchOauth(code, state);

  if (jwtResult.success) {
    log.info('Successfully logged in.');
    setToken(jwtResult.data!);
    router.push({ name: 'client-home' });
  } else {
    showError.value = true;
    errorCode.value = jwtResult.errorCode!;
    errorMessage.value = jwtResult.errorMessage!;

    log.error(`Error logging in: ${jwtResult.errorMessage}`);

    return;
  }
});
</script>

<template>
  <article class="message is-danger" v-show="showError">
    <div class="message-body">
      <p>Was unable to complete logging in.</p>
      <p>Error: {{ errorCode }}</p>
      <p>Message: {{ errorMessage }}</p>
      <p><RouterLink :to="{ name: 'client-auth' }">Login Again</RouterLink></p>
    </div>
  </article>
</template>
