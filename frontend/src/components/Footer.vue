<script setup>
import { appConfig } from '@/config/app'
</script>

<template>
  <footer class="mt-auto border-t border-[#c5d7b8] bg-[#dce8d2] px-4 py-6 text-center text-sm text-[#4f6854]">
    <p>E-Commerce Team 3 | MLOps and Cloudflare Microservices</p>
    <p class="mt-1 text-xs text-[#5f765f]">Version {{ appConfig.appVersion }}</p>
  </footer>
</template>
