<script setup lang="ts">
import { computed } from 'vue'
import { highlightCode } from './codeSyntax'
import { parseUnifiedDiff } from './unifiedDiff'

const props = defineProps<{ diff: string; path: string }>()
const lines = computed(() => parseUnifiedDiff(props.diff))
const lineNumber = (line: { oldLine: number | null; newLine: number | null }) => line.newLine ?? line.oldLine ?? ''
const highlightedLine = (line: { content: string; kind: string }) => {
  if (!['add', 'delete', 'context'].includes(line.kind)) return line.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const marker = line.content[0] || ''
  return `<span class="diff-marker">${marker}</span>${highlightCode(line.content.slice(1), props.path)}`
}
</script>

<template>
  <div class="diff-table" role="table" aria-label="Code diff">
    <div v-for="line in lines" :key="line.id" class="diff-row" :class="line.kind" role="row">
      <span class="line-number" role="cell">{{ lineNumber(line) }}</span>
      <code role="cell" v-html="highlightedLine(line) || ' '"></code>
    </div>
  </div>
</template>

<style scoped>
.diff-table{width:max-content;min-width:100%;padding:10px 0 18px;color:#374151;font:11px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace}.diff-row{display:grid;min-height:18px;grid-template-columns:44px minmax(max-content,1fr)}.line-number{position:sticky;z-index:1;left:0;display:block;box-sizing:border-box;background:#fff;padding:0 9px 0 4px;border-right:1px solid #e6e9ee;color:#98a0ae;text-align:right;user-select:none}.diff-row code{display:block;padding:0 14px;white-space:pre}.diff-row.add{background:#ecfdf3;color:#166534}.diff-row.delete{background:#fff1f2;color:#b42318}.diff-row.hunk{margin:5px 0;background:#fff6ee;color:#e8811f}.diff-row.hunk .line-number{background:#fff6ee}.diff-row.add .line-number{background:#dcfce7;color:#4d8064}.diff-row.delete .line-number{background:#ffe4e6;color:#a65660}.diff-row :deep(.diff-marker){display:inline-block;width:10px;color:inherit}.diff-row :deep(.hljs-comment),.diff-row :deep(.hljs-quote){color:#6b7280}.diff-row :deep(.hljs-keyword),.diff-row :deep(.hljs-literal){color:#c96a12}.diff-row :deep(.hljs-string),.diff-row :deep(.hljs-attr){color:#15803d}.diff-row :deep(.hljs-number),.diff-row :deep(.hljs-attribute){color:#c2410c}.diff-row.meta{color:#6b7280}:global(html.theme-dark .diff-table){color:#ffe9d5}:global(html.theme-dark .line-number){background:#1f2329;border-color:#1f2329;color:#6b7280}:global(html.theme-dark .diff-row.add){background:#063420;color:#bbf7d0}:global(html.theme-dark .diff-row.delete){background:#45151c;color:#fecaca}:global(html.theme-dark .diff-row.hunk){background:#3a2410;color:#ffb574}:global(html.theme-dark .diff-row.hunk .line-number){background:#3a2410}:global(html.theme-dark .diff-row.add .line-number){background:#092a1d;color:#4d8064}:global(html.theme-dark .diff-row.delete .line-number){background:#34171d;color:#8e5660}:global(html.theme-dark .diff-row .hljs-comment),:global(html.theme-dark .diff-row .hljs-quote){color:#98a0ae}:global(html.theme-dark .diff-row .hljs-keyword),:global(html.theme-dark .diff-row .hljs-literal){color:#e0aaff}:global(html.theme-dark .diff-row .hljs-string),:global(html.theme-dark .diff-row .hljs-attr){color:#d0eaa2}:global(html.theme-dark .diff-row .hljs-number),:global(html.theme-dark .diff-row .hljs-attribute){color:#f7b38c}:global(html.theme-dark .diff-row.meta){color:#98a0ae}
</style>
