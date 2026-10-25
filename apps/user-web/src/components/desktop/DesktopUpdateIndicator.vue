<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  checkDesktopUpdate,
  downloadDesktopUpdate,
  getDesktopUpdateState,
  installDesktopUpdate,
  onDesktopUpdateState,
  type DesktopUpdateState,
} from '../../platform'
import { t } from '../../composables/i18n'

const state = ref<DesktopUpdateState>({ phase: 'idle', current_version: '' })
let stopListening: (() => void) | undefined

const visible = computed(() => ['available', 'downloading', 'downloaded', 'installing', 'error'].includes(state.value.phase))
const panelVisible = computed(() => ['downloading', 'downloaded', 'installing', 'error'].includes(state.value.phase))
const progress = computed(() => Math.max(0, Math.min(100, state.value.progress_percent || 0)))
const progressLabel = computed(() => Math.round(progress.value))
const statusText = computed(() => t(`settings.update.phase.${state.value.phase}`))

onMounted(async () => {
  state.value = await getDesktopUpdateState()
  stopListening = onDesktopUpdateState(next => { state.value = next })
})
onBeforeUnmount(() => stopListening?.())

async function primaryAction() {
  if (state.value.phase === 'available') state.value = await downloadDesktopUpdate()
  else if (state.value.phase === 'downloaded') await installDesktopUpdate()
  else if (state.value.phase === 'error') state.value = await checkDesktopUpdate()
}
</script>

<template>
  <button
    v-if="visible"
    type="button"
    class="desktop-update-trigger"
    :disabled="state.phase === 'downloading' || state.phase === 'installing'"
    :title="statusText"
    @click="primaryAction"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>
    </svg>
    <span v-if="state.phase === 'available'">{{ t('settings.update.main.update') }}</span>
    <span v-else-if="state.phase === 'downloading'">{{ progressLabel }}%</span>
    <span v-else-if="state.phase === 'downloaded'">{{ t('settings.update.main.restart') }}</span>
    <span v-else-if="state.phase === 'installing'">{{ t('settings.update.main.installing') }}</span>
    <span v-else>{{ t('settings.update.main.retry') }}</span>
  </button>

  <Teleport to="body">
    <section v-if="panelVisible" class="desktop-update-popover" aria-live="polite">
      <div class="desktop-update-popover__heading">
        <div>
          <strong>{{ t('settings.update.title') }}</strong>
          <p>{{ statusText }}<template v-if="state.available_version"> · v{{ state.available_version }}</template></p>
        </div>
        <span v-if="state.phase === 'downloading'" class="desktop-update-popover__percent">{{ progressLabel }}%</span>
      </div>
      <div v-if="state.phase === 'downloading'" class="desktop-update-popover__track" role="progressbar" :aria-valuenow="progressLabel" aria-valuemin="0" aria-valuemax="100">
        <span :style="{ width: `${progress}%` }"></span>
      </div>
      <p v-if="state.phase === 'error' && state.message" class="desktop-update-popover__error">{{ state.message }}</p>
      <button v-if="state.phase === 'downloaded'" type="button" class="desktop-update-popover__action" @click="primaryAction">
        {{ t('settings.update.restart') }}
      </button>
      <button v-else-if="state.phase === 'error'" type="button" class="desktop-update-popover__action" @click="primaryAction">
        {{ t('settings.update.main.retry') }}
      </button>
    </section>
  </Teleport>
</template>

<style scoped>
.desktop-update-trigger { display:flex; min-width:44px; height:36px; align-items:center; justify-content:center; gap:6px; border:0; border-radius:9px; background:#fff6ee; padding:0 10px; color:#e8811f; font-size:12px; font-weight:600; cursor:pointer; -webkit-app-region:no-drag; transition:background-color 160ms ease,color 160ms ease; }
.desktop-update-trigger:hover:not(:disabled) { background:#ffe9d5; color:#c96a12; }
.desktop-update-trigger:focus-visible { outline:2px solid #ffb574; outline-offset:1px; }
.desktop-update-trigger:disabled { cursor:default; opacity:.8; }
.desktop-update-trigger svg { width:16px; height:16px; }
.desktop-update-popover { position:fixed; z-index:90; top:60px; right:16px; width:min(340px,calc(100vw - 32px)); border:1px solid #e6e9ee; border-radius:16px; background:rgba(255,255,255,.98); padding:16px; color:#374151; box-shadow:0 16px 48px rgba(40, 28, 17,.18); -webkit-app-region:no-drag; }
:global(html.platform-windows .desktop-update-popover){ top:100px; }
.desktop-update-popover__heading { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
.desktop-update-popover__heading strong { color:#14171c; font-size:14px; }
.desktop-update-popover__heading p { margin:4px 0 0; color:#6b7280; font-size:12px; }
.desktop-update-popover__percent { flex:none; color:#e8811f; font-size:13px; font-variant-numeric:tabular-nums; font-weight:700; }
.desktop-update-popover__track { height:8px; overflow:hidden; margin-top:14px; border-radius:999px; background:#e6e9ee; }
.desktop-update-popover__track span { display:block; height:100%; border-radius:inherit; background:#e8811f; transition:width 180ms ease; }
.desktop-update-popover__error { max-height:80px; overflow:auto; margin:12px 0 0; color:#b91c1c; font-size:12px; line-height:1.5; }
.desktop-update-popover__action { width:100%; min-height:40px; margin-top:14px; border:0; border-radius:10px; background:#e8811f; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
.desktop-update-popover__action:hover { background:#c96a12; }
:global(html.theme-dark .desktop-update-trigger){ background:#1f2329; color:#ffb574; }
:global(html.theme-dark .desktop-update-popover){ border-color:#374151; background:rgba(40, 28, 17,.98); color:#d5dae2; }
:global(html.theme-dark .desktop-update-popover__heading strong){ color:#f7f8fa; }
:global(html.theme-dark .desktop-update-popover__heading p){ color:#98a0ae; }
:global(html.theme-dark .desktop-update-popover__track){ background:#374151; }
</style>
