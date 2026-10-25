<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { loginWithPassword, selectTenantAndLogin, type TenantCandidate, type UserProfile } from '../../api/auth'
import { t } from '../../composables/i18n'

const props = defineProps<{
  suggestedUsername?: string
}>()

const emit = defineEmits<{
  (event: 'login-success', payload: { token: string; username: string; profile?: UserProfile }): void
}>()

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const challengeToken = ref('')
const tenantCandidates = ref<TenantCandidate[]>([])
const selectedMainId = ref('')
const pendingSelection = computed(() => Boolean(challengeToken.value) && tenantCandidates.value.length > 0)

watch(
  () => props.suggestedUsername,
  (value) => {
    if (!username.value) username.value = value || ''
  },
  { immediate: true },
)

function resetError() {
  errorMessage.value = ''
}

async function submit() {
  resetError()
  const normalizedUsername = username.value.trim()
  if (!normalizedUsername) {
    errorMessage.value = t('login.username_empty')
    return
  }
  if (!password.value) {
    errorMessage.value = t('login.password_empty')
    return
  }

  isSubmitting.value = true
  try {
    const result = pendingSelection.value
      ? await selectTenantAndLogin(challengeToken.value, selectedMainId.value)
      : await loginWithPassword(normalizedUsername, password.value)

    if (result.requiresTenantSelection) {
      challengeToken.value = result.challengeToken || ''
      tenantCandidates.value = result.tenantCandidates || []
      selectedMainId.value = tenantCandidates.value[0]?.mainId || ''
      errorMessage.value = result.message || t('api.auth.select_org')
      return
    }
    if (!result.ok || !result.token) {
      errorMessage.value = result.message || t('api.auth.login_failed')
      return
    }
    emit('login-success', { token: result.token, username: normalizedUsername, profile: result.profile })
  } catch (error: any) {
    console.error('[auth] password login completion failed', error)
    errorMessage.value = error?.message || t('api.auth.login_failed')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div class="space-y-2">
      <label for="movo-login-username" class="text-sm font-medium text-slate-700">{{ t('login.username_label') }}</label>
      <input
        id="qianyiclaw-login-username"
        v-model="username"
        type="text"
        autocomplete="username"
        class="min-h-[44px] w-full rounded-ctl border border-brand-200 px-4 text-slate-900 outline-none transition-colors focus:border-accent-400 focus-visible:ring-2 focus-visible:ring-accent-100"
        :placeholder="t('login.username_placeholder')"
        :disabled="pendingSelection"
        @input="resetError"
      />
    </div>

    <div class="space-y-2">
      <label for="movo-login-password" class="text-sm font-medium text-slate-700">{{ t('login.password_label') }}</label>
      <input
        id="qianyiclaw-login-password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        class="min-h-[44px] w-full rounded-ctl border border-brand-200 px-4 text-slate-900 outline-none transition-colors focus:border-accent-400 focus-visible:ring-2 focus-visible:ring-accent-100"
        :placeholder="t('login.password_placeholder')"
        :disabled="pendingSelection"
        @input="resetError"
      />
    </div>

    <div v-if="pendingSelection" class="space-y-2">
      <label for="movo-login-tenant" class="text-sm font-medium text-slate-700">{{ t('login.select_org_label') }}</label>
      <select
        id="qianyiclaw-login-tenant"
        v-model="selectedMainId"
        class="min-h-[44px] w-full rounded-ctl border border-brand-200 px-4 text-slate-900 outline-none focus:border-accent-400 focus-visible:ring-2 focus-visible:ring-accent-100"
        @change="resetError"
      >
        <option v-for="tenant in tenantCandidates" :key="tenant.mainId" :value="tenant.mainId">
          {{ tenant.orgName || tenant.mainId }}
        </option>
      </select>
    </div>

    <p v-if="errorMessage" role="alert" class="rounded-ctl bg-rose-50 px-3 py-2 text-sm text-rose-600">
      {{ errorMessage }}
    </p>

    <button
      type="submit"
      class="min-h-[44px] w-full rounded-ctl bg-accent-500 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      :disabled="isSubmitting || (pendingSelection && !selectedMainId)"
    >
      {{ isSubmitting ? t('phase.verifying') : pendingSelection ? t('login.btn_enter_org') : t('login.password_submit') }}
    </button>

    <p class="rounded-ctl bg-brand-50 px-3 py-2 text-xs leading-5 text-slate-500">
      {{ pendingSelection ? t('login.multiple_org_notice') : t('login.password_help') }}
    </p>
  </form>
</template>
