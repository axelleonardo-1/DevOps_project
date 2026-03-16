<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#f8f5ee] text-[#2f3e31] antialiased">
    <Navbar />

    <main class="mx-auto my-8 w-full max-w-5xl flex-1 rounded-2xl border border-[#d6e2cc] bg-[#eef5e9] px-4 py-10 sm:px-6">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>
