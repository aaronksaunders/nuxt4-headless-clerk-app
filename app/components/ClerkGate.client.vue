<template>
  <div v-if="ready">
    <slot />
  </div>
  <div v-else class="p-6 text-center">Loading…</div>
</template>

<script setup lang="ts">
/**
 * Ensures Clerk is ready before rendering children.
 * Uses @clerk/vue state to avoid hydration mismatches.
 */
import { computed, watchEffect } from "vue";
import { useUser } from "@clerk/vue";

const { isLoaded } = useUser();
const ready = computed(() => !!isLoaded?.value);

watchEffect(() => {
  // establish reactive dependency
  void ready.value;
});
</script>
