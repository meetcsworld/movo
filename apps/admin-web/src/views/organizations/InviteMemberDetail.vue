<script setup lang="ts">
import { ref, watch } from 'vue';
import { NAlert, NTable, useMessage } from 'naive-ui';
import { fetchInviteMembers, type InviteHistoryItem, type InviteMemberItem } from '@/api/directory';
import { formatAdminDateTime } from '@/composables/adminTimezone';
import { t } from '@/composables/i18n';

const props = defineProps<{ invite: InviteHistoryItem; departmentName: string; roleName: string }>();
const emit = defineEmits<{ (event: 'back'): void }>();
const rows = ref<InviteMemberItem[]>([]);
const total = ref(0);
const unattributedCount = ref(0);
const page = ref(1);
const loading = ref(false);
const pageSize = 25;
const message = useMessage();
let requestVersion = 0;

async function load() {
  const version = ++requestVersion;
  loading.value = true;
  try {
    const result = await fetchInviteMembers(props.invite.id, page.value, pageSize);
    if (version !== requestVersion) return;
    rows.value = result.items;
    total.value = result.total;
    unattributedCount.value = result.unattributedCount;
  } catch { message.error(t('inviteHistory.membersLoadFailed')); }
  finally { if (version === requestVersion) loading.value = false; }
}
watch(() => props.invite.id, () => {
  if (page.value !== 1) page.value = 1;
  else void load();
}, { immediate: true });
watch(page, () => { void load(); });
function changePage(value: number) { page.value = value; }
async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    message.success(t('inviteHistory.copied'));
  } catch { message.error(t('inviteHistory.copyFailed')); }
}
</script>

<template>
  <section class="member-detail">
    <n-button text @click="emit('back')">← {{ t('inviteHistory.back') }}</n-button>
    <div class="detail-heading">
      <h3>{{ departmentName }} · {{ roleName }}</h3>
      <p class="muted">{{ t('inviteHistory.members') }}: {{ invite.acceptedCount }} <span class="separator">·</span> {{ t('inviteHistory.expires') }}: {{ formatAdminDateTime(invite.expiresAt) }}</p>
    </div>
    <div class="invite-details">
      <div class="invite-source"><span>{{ t('inviteHistory.link') }}</span><input :value="invite.inviteUrl" readonly /><n-button size="small" :disabled="invite.status !== 'active'" @click="copy(invite.inviteUrl)">{{ t('inviteHistory.copy') }}</n-button></div>
      <div class="invite-source"><span>{{ t('inviteHistory.code') }}</span><input :value="invite.token" readonly /><n-button size="small" :disabled="invite.status !== 'active'" @click="copy(invite.token)">{{ t('inviteHistory.copyCode') }}</n-button></div>
    </div>
    <n-alert v-if="unattributedCount" type="warning" :bordered="false" class="legacy-notice">
      {{ t('inviteHistory.unattributed', { count: unattributedCount }) }}
    </n-alert>
    <div class="member-section-title">{{ t('inviteHistory.registeredMembers') }}</div>
    <div class="member-scroll">
      <n-spin :show="loading">
        <n-empty v-if="!rows.length && !loading" :description="t('inviteHistory.noMembers')" />
        <n-table v-else size="small" :single-line="false">
          <thead><tr><th>{{ t('inviteHistory.name') }}</th><th>{{ t('inviteHistory.loginName') }}</th><th>{{ t('inviteHistory.email') }}</th><th>{{ t('inviteHistory.joinedAt') }}</th><th>{{ t('inviteHistory.memberStatus') }}</th></tr></thead>
          <tbody>
            <tr v-for="member in rows" :key="member.userId">
              <td>{{ member.name || t('inviteHistory.deletedUser') }}</td>
              <td>{{ member.loginName || '—' }}</td>
              <td>{{ member.email || '—' }}</td>
              <td>{{ formatAdminDateTime(member.joinedAt) }}</td>
              <td>{{ member.status === 'deleted' ? t('inviteHistory.deletedUser') : member.status === 'active' ? t('inviteHistory.activeUser') : t('inviteHistory.disabledUser') }}</td>
            </tr>
          </tbody>
        </n-table>
      </n-spin>
    </div>
    <div class="member-footer">
      <span>{{ t('inviteHistory.attributed', { count: total }) }}</span>
      <n-pagination v-if="total > pageSize" :page="page" :page-size="pageSize" :item-count="total" @update:page="changePage" />
    </div>
  </section>
</template>

<style scoped>
.member-detail { min-height:0; height:100%; display:flex; flex-direction:column; gap:16px; }
.member-detail > .n-button { align-self:flex-start; }
.detail-heading { padding-bottom:4px; }
.member-detail h3 { margin:0 0 6px; font-size:18px; line-height:1.45; }
.muted { margin:0; color:#6b7280; font-size:13px; }
.separator { padding:0 8px; color:#d5dae2; }
.invite-details { display:grid; gap:10px; padding:16px; border:1px solid #e6e9ee; border-radius:10px; background:#f7f8fa; }
.invite-source { display:flex; align-items:center; gap:10px; font-size:13px; }
.invite-source span { width:64px; flex:none; color:#6b7280; }
.invite-source input { min-width:0; flex:1; padding:7px 10px; border:1px solid #e6e9ee; border-radius:6px; color:#374151; background:#fff; text-overflow:ellipsis; }
.member-section-title { padding-top:2px; font-size:15px; font-weight:600; color:#1f2329; }
.member-scroll { min-height:0; flex:1; overflow:auto; }
.member-scroll :deep(.n-table) { min-width:720px; border-radius:8px; overflow:hidden; }
.member-scroll :deep(th) { white-space:nowrap; background:#f7f8fa; font-weight:600; }
.member-scroll :deep(td) { max-width:230px; overflow-wrap:anywhere; }
.member-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding-top:12px; border-top:1px solid #e6e9ee; color:#6b7280; font-size:13px; }
.legacy-notice { flex:none; }
@media (max-width:650px) { .invite-source { flex-wrap:wrap; } .invite-source span { width:100%; } .invite-source input { flex-basis:60%; } }
</style>
