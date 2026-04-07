<script>
  import '../app.css';
</script>

<div class="min-h-screen relative overflow-hidden flex flex-col">
  <!-- Subtle ambient background glow -->
  <div class="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
  <div class="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none"></div>

  <!-- Header -->
  <header class="w-full py-6 px-6 sm:px-12 flex items-center justify-between z-10">
    <h1 class="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
      IDEA PROMPT
    </h1>
  </header>

  <!-- Main Content Area -->
  <main class="flex-grow w-full max-w-4xl mx-auto px-6 sm:px-12 py-8 z-10 flex flex-col relative">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="w-full py-6 text-center text-sm text-slate-500 z-10">
    &copy; {new Date().getFullYear()} Idea Prompt Generator. All rights reserved.
  </footer>
</div>
