<script setup lang="ts">
import { onMounted, ref } from 'vue';

import useAuth from '@/composables/AuthService';
import router from '@/router';

const { getTwitchLoginUrl, isAuthenticated } = useAuth();

const error = ref('');
const loginUrl = ref('');

onMounted(async () => {
  try {
    if (isAuthenticated()) {
      router.push({ name: 'client-home' });
      return;
    }

    const url = (await getTwitchLoginUrl())!;

    loginUrl.value = url;
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = String(err);
    }
  }
});
</script>
<template>
  <h2>Client Auth</h2>
  <p>
    <a :href="loginUrl">Login with Twitch</a>
  </p>
  <div v-if="error" class="notification is-danger">{{ error }}</div>
</template>
