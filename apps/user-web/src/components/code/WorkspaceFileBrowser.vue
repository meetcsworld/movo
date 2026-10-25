<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { listDshWorkspaceDirectory } from '../../platform'
import type { DshDirectoryEntry } from '../../platform/types'
import WorkspaceFileTreeNode from './WorkspaceFileTreeNode.vue'
import WorkspaceFilePreview from './WorkspaceFilePreview.vue'

const props = defineProps<{ sessionId: string; locale?: 'zh' | 'en'; requestedPath?: string }>()
const emit = defineEmits<{ (event: 'open-file', path: string): void }>()
const roots = ref<DshDirectoryEntry[]>([])
const selectedPath = ref('')
const error = ref('')

async function loadRoot() {
  error.value = ''
  try { roots.value = await listDshWorkspaceDirectory(props.sessionId) }
  catch (value) { error.value = String(value) }
}

async function select(entry: DshDirectoryEntry) {
  await selectPath(entry.path)
}

async function selectPath(path: string) {
  selectedPath.value = path
}

watch(() => props.sessionId, loadRoot)
watch(() => props.requestedPath, path => { if (path && path !== selectedPath.value) void selectPath(path) })
onMounted(loadRoot)
onMounted(() => { if (props.requestedPath) void selectPath(props.requestedPath) })
</script>

<template>
  <div class="file-browser">
    <nav aria-label="Workspace files">
      <WorkspaceFileTreeNode v-for="entry in roots" :key="entry.path" :session-id="sessionId" :entry="entry" :selected-path="selectedPath" @select="select" @open="emit('open-file', $event)" />
    </nav>
    <main><div v-if="error" class="state error">{{ error }}</div><WorkspaceFilePreview v-else :session-id="sessionId" :path="selectedPath" :locale="locale" /></main>
  </div>
</template>

<style scoped>
.file-browser{display:grid;min-height:0;height:100%;grid-template-columns:230px minmax(0,1fr)}nav{overflow:auto;border-right:1px solid #e6e9ee;padding:8px 6px}main{min-width:0;overflow:auto;background:#fff}.preview-heading{position:sticky;z-index:2;top:0;display:flex;min-height:48px;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid #e6e9ee;background:#fff;padding:0 14px;color:#1f2329}.preview-file{display:flex;min-width:0;align-items:center;gap:7px}.preview-file strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.preview-heading>span{flex:none;color:#98a0ae;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}.state{display:grid;height:100%;place-items:center;padding:24px;color:#98a0ae;font-size:12px}.state.error{color:#dc2626}.image-preview{display:block;max-width:100%;max-height:calc(100% - 48px);margin:auto;padding:18px;object-fit:contain}.truncated{position:sticky;bottom:0;background:#fff7ed;padding:7px 12px;color:#9a3412;font-size:11px}:global(html.theme-dark .file-browser main){background:#1f2329}:global(html.theme-dark .preview-heading){border-color:#1f2329;background:#291d12;color:#e6e9ee}:global(html.theme-dark .preview-heading>span){color:#98a0ae}:global(html.theme-dark .state.error){color:#fca5a5}:global(html.theme-dark .truncated){background:#7c2d12;color:#ffedd5}
</style>
