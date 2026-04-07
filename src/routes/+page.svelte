<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { RefreshCw, Sparkles, Copy, Check } from "lucide-svelte";
    import { getRandomWords } from "$lib/words";
    import { onMount } from "svelte";

    let selectedWords = $state<string[]>(["", "", ""]);
    let generatedPrompt = $state("");
    let showToast = $state(false);
    let isGenerating = $state(false);

    function rollAllWords() {
        selectedWords = getRandomWords(3);
        generatedPrompt = "";
    }

    function rerollWord(index: number) {
        const newWord = getRandomWords(1, selectedWords)[0];
        const newWords = [...selectedWords];
        newWords[index] = newWord;
        selectedWords = newWords;
        generatedPrompt = "";
    }

    async function handleGeneratePrompt() {
        if (selectedWords.some((w) => !w)) return;
        const keywordStr = selectedWords.map((w) => `[${w}]`).join(", ");
        const rawPrompt = `${keywordStr}\n\n이 세 개의 단어를 핵심 소재로 사용해서 사람들에게 영감을 줄 수 있는 아주 매력적이고 창의적인 문장(또는 짧은 텍스트)을 하나 완성해 줘. (군더더기 인사말은 빼고 결과 내용만 텍스트로 출력해)`;

        isGenerating = true;
        generatedPrompt = "";

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: rawPrompt }),
            });
            const data = await response.json();

            if (data.success) {
                generatedPrompt = data.text;
            } else {
                generatedPrompt = `API 호출 오류: ${data.error}`;
            }
        } catch (error) {
            console.error("Fetch error:", error);
            generatedPrompt =
                "통신에 실패했습니다. 서버가 켜져 있는지 확인해 주세요.";
        } finally {
            isGenerating = false;
        }
    }

    async function copyToClipboard() {
        if (!generatedPrompt) return;
        try {
            await navigator.clipboard.writeText(generatedPrompt);
            showToast = true;
            setTimeout(() => (showToast = false), 3000);
        } catch (err) {
            console.error("Clipboard copy failed:", err);
        }
    }

    onMount(() => {
        rollAllWords();
    });
</script>

<div class="flex flex-col gap-12 mt-4 pb-24">
    <!-- Phase 1: 단어 생성기 -->
    <section class="flex flex-col items-center gap-6">
        <div class="text-center space-y-2 mb-2">
            <h2 class="text-xl font-semibold text-slate-200">
                1. 마법의 키워드 뽑기
            </h2>
            <p class="text-sm text-slate-400">
                무작위로 등장한 세 단어를 엮어 엄청난 영감을 얻어보세요.
            </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {#each selectedWords as word, index (index + "_" + word)}
                {#if word}
                    <div
                        in:fly={{ y: 20, duration: 400, delay: index * 100 }}
                        out:fade={{ duration: 200 }}
                        class="relative group aspect-[4/3] flex flex-col items-center justify-center bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 shadow-lg transition-all duration-300"
                    >
                        <span
                            class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400"
                        >
                            {word}
                        </span>
                        <button
                            onclick={() => rerollWord(index)}
                            class="absolute top-3 right-3 p-2 rounded-full bg-slate-700/0 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            title="이 단어만 바꾸기"
                        >
                            <RefreshCw
                                size={18}
                                class="transition-transform hover:rotate-180 duration-500"
                            />
                        </button>
                    </div>
                {:else}
                    <div
                        class="aspect-[4/3] rounded-2xl bg-slate-800/50 border border-slate-700/30 animate-pulse"
                    ></div>
                {/if}
            {/each}
        </div>

        <button
            onclick={rollAllWords}
            class="flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
            <RefreshCw size={18} />
            전체 다시 뽑기
        </button>
    </section>

    <!-- Phase 2: 무지성 프롬프트 엮기 -->
    <section class="flex flex-col items-center gap-8 mt-6">
        <button
            onclick={handleGeneratePrompt}
            disabled={isGenerating}
            class="group relative flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20 overflow-hidden disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed"
            class:opacity-50={generatedPrompt !== "" && !isGenerating}
        >
            <div
                class="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-[length:200%_auto] animate-gradient"
            ></div>
            <span class="relative z-10 flex items-center gap-2">
                {#if isGenerating}
                    <RefreshCw size={20} class="animate-spin" />
                    마법의 문장 창조 중...
                {:else}
                    <Sparkles size={20} class="group-hover:animate-pulse" />
                    문장 프롬프트 만들기
                {/if}
            </span>
        </button>

        {#if generatedPrompt}
            <div
                class="w-full relative"
                in:fly={{ y: 30, duration: 500 }}
                out:fade
            >
                <div
                    class="absolute -top-3 left-4 bg-slate-900 px-2 text-xs font-semibold text-emerald-400 tracking-wider z-10"
                >
                    GENERATED PROMPT
                </div>
                <div
                    class="relative w-full bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-8 shadow-2xl"
                >
                    <p
                        class="text-slate-100 leading-relaxed min-h-[120px] whitespace-pre-wrap font-medium text-[15px]"
                    >
                        {generatedPrompt}
                    </p>
                </div>

                <div class="flex justify-end mt-4">
                    <button
                        onclick={copyToClipboard}
                        class="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-medium transition-colors text-white shadow-sm"
                    >
                        {#if showToast}
                            <Check size={16} class="text-emerald-400" />
                            <span class="text-emerald-400">복사 완료!</span>
                        {:else}
                            <Copy size={16} />
                            복사하기
                        {/if}
                    </button>
                </div>
            </div>
        {/if}
    </section>
</div>

<style>
    @keyframes gradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
    .animate-gradient {
        animation: gradient 3s ease infinite;
    }
</style>
