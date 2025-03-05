<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div id="appComponent" class="app-component">
    <RouterView />
  </div>
</template>

<style scoped>
.app-component {
  height: 100%;
}
</style>
