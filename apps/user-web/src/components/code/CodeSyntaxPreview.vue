<script setup lang="ts">
import { computed } from 'vue'
import { highlightCode } from './codeSyntax'

const props = defineProps<{ content: string; path: string; language?: string }>()
const highlighted = computed(() => highlightCode(props.content, props.path, props.language))
</script>

<template>
  <pre class="code-preview"><code v-html="highlighted"></code></pre>
</template>

<style scoped>
.code-preview{box-sizing:border-box;min-height:100%;margin:0;padding:15px 16px;background:#fff;color:#374151;font:12px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace;tab-size:2;white-space:pre;overflow:auto}.code-preview :deep(.hljs-comment),.code-preview :deep(.hljs-quote){color:#98a0ae}.code-preview :deep(.hljs-keyword),.code-preview :deep(.hljs-selector-tag),.code-preview :deep(.hljs-literal){color:#c96a12}.code-preview :deep(.hljs-string),.code-preview :deep(.hljs-attr){color:#15803d}.code-preview :deep(.hljs-number),.code-preview :deep(.hljs-attribute){color:#c2410c}.code-preview :deep(.hljs-title),.code-preview :deep(.hljs-function){color:#e8811f}.code-preview :deep(.hljs-built_in),.code-preview :deep(.hljs-type){color:#a16207}.code-preview :deep(.hljs-meta),.code-preview :deep(.hljs-tag){color:#a0520c}:global(html.theme-dark .code-preview){background:#1f2329;color:#ffe9d5}:global(html.theme-dark .code-preview .hljs-comment),:global(html.theme-dark .code-preview .hljs-quote){color:#6b7280}:global(html.theme-dark .code-preview .hljs-keyword),:global(html.theme-dark .code-preview .hljs-selector-tag),:global(html.theme-dark .code-preview .hljs-literal){color:#c792ea}:global(html.theme-dark .code-preview .hljs-string),:global(html.theme-dark .code-preview .hljs-attr){color:#c3e88d}:global(html.theme-dark .code-preview .hljs-number),:global(html.theme-dark .code-preview .hljs-attribute){color:#f78c6c}:global(html.theme-dark .code-preview .hljs-title),:global(html.theme-dark .code-preview .hljs-function){color:#ffb574}:global(html.theme-dark .code-preview .hljs-built_in),:global(html.theme-dark .code-preview .hljs-type){color:#ffcb6b}:global(html.theme-dark .code-preview .hljs-meta),:global(html.theme-dark .code-preview .hljs-tag){color:#ffb574}
</style>
