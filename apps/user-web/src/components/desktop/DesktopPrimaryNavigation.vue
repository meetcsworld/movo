<script setup lang="ts">
import { computed } from 'vue'

export type DesktopPrimarySection = 'home' | 'scheduled' | 'skills' | 'plugins' | 'tools' | 'knowledge'

interface NavigationItem {
  id: DesktopPrimarySection
  zh: string
  en: string
  visible: boolean
  badge: number
}

const props = withDefaults(defineProps<{
  active: DesktopPrimarySection
  locale?: 'zh' | 'en'
  skillsAvailable?: boolean
  toolsAvailable?: boolean
  knowledgeAvailable?: boolean
  skillBadge?: number
  knowledgeBadge?: number
  loggedIn?: boolean
  avatarUrl?: string
  avatarText?: string
  accountLabel?: string
}>(), {
  locale: 'zh',
  skillsAvailable: true,
  toolsAvailable: true,
  knowledgeAvailable: true,
  skillBadge: 0,
  knowledgeBadge: 0,
  loggedIn: false,
  avatarUrl: '',
  avatarText: '?',
  accountLabel: '',
})

const emit = defineEmits<{
  (event: 'navigate', section: DesktopPrimarySection): void
  (event: 'account'): void
  (event: 'avatar-error', value: Event): void
}>()

const items = computed<NavigationItem[]>(() => [
  { id: 'home', zh: '首页', en: 'Home', visible: true, badge: 0 },
  { id: 'scheduled', zh: '定时', en: 'Tasks', visible: true, badge: 0 },
  { id: 'skills', zh: 'Skill', en: 'Skills', visible: props.skillsAvailable, badge: props.skillBadge },
  { id: 'plugins', zh: '插件', en: 'Plugins', visible: true, badge: 0 },
  { id: 'tools', zh: 'MCP', en: 'MCP', visible: props.toolsAvailable, badge: 0 },
  { id: 'knowledge', zh: '知识库', en: 'Knowledge Base', visible: props.knowledgeAvailable, badge: props.knowledgeBadge },
])
</script>

<template>
  <nav class="desktop-primary-nav" :aria-label="locale === 'en' ? 'Primary navigation' : '主导航'">
    <div class="desktop-primary-nav__items">
      <button
        v-for="item in items.filter(entry => entry.visible)"
        :key="item.id"
        type="button"
        class="desktop-primary-nav__item"
        :class="{ active: active === item.id }"
        :aria-current="active === item.id ? 'page' : undefined"
        :aria-label="locale === 'en' ? item.en : item.zh"
        :data-tooltip="locale === 'en' ? item.en : item.zh"
        @click="emit('navigate', item.id)"
      >
        <span class="desktop-primary-nav__icon" aria-hidden="true">
          <svg v-if="item.id === 'home'" viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"/></svg>
          <svg v-else-if="item.id === 'scheduled'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          <svg v-else-if="item.id === 'skills'" viewBox="0 0 24 24"><path d="m12 3 1.35 3.65L17 8l-3.65 1.35L12 13l-1.35-3.65L7 8l3.65-1.35L12 3Z"/><path d="m5 13 .9 2.1L8 16l-2.1.9L5 19l-.9-2.1L2 16l2.1-.9L5 13Zm14-1 .9 2.1 2.1.9-2.1.9L19 18l-.9-2.1L16 15l2.1-.9L19 12Z"/></svg>
          <svg v-else-if="item.id === 'plugins'" viewBox="0 0 24 24"><path d="M8 3h8v4h4v5h-4v3h4v6H4v-6h4v-3H4V7h4V3Z"/><path d="M8 7h8M8 15h8"/></svg>
          <svg v-else-if="item.id === 'tools'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><circle cx="4" cy="7" r="2"/><circle cx="20" cy="7" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="m6 8 3.5 2.5M18 8l-3.5 2.5M7 18l3-3.5m7 3.5-3-3.5"/></svg>
          <svg v-else class="desktop-primary-nav__knowledge-icon" viewBox="0 0 512 512">
            <rect x="32" y="96" width="64" height="368" rx="16" ry="16" />
            <path d="M112 224h128M112 400h128" />
            <rect x="112" y="160" width="128" height="304" rx="16" ry="16" />
            <rect x="256" y="48" width="96" height="416" rx="16" ry="16" />
            <path d="m422.46 96.11-40.4 4.25c-11.12 1.17-19.18 11.57-17.93 23.1l34.92 321.59c1.26 11.53 11.37 20 22.49 18.84l40.4-4.25c11.12-1.17 19.18-11.57 17.93-23.1L445 115c-1.31-11.58-11.42-20.06-22.54-18.89Z" />
          </svg>
        </span>
        <span v-if="item.badge > 0" class="desktop-primary-nav__badge" aria-hidden="true">{{ item.badge > 99 ? '99+' : item.badge }}</span>
      </button>
    </div>
    <button
      type="button"
      class="desktop-primary-nav__account"
      :aria-label="accountLabel"
      :data-tooltip="accountLabel"
      data-user-menu
      @click.stop="emit('account')"
    >
      <img
        v-if="loggedIn && avatarUrl"
        :src="avatarUrl"
        alt=""
        @error="emit('avatar-error', $event)"
      />
      <span v-else>{{ loggedIn ? avatarText : '?' }}</span>
    </button>
  </nav>
</template>

<style scoped>
.desktop-primary-nav {
  --desktop-nav-bg: #eff1f4;
  --desktop-nav-border: #e6e9ee;
  --desktop-nav-ink: #4b5563;
  --desktop-nav-hover-bg: #e6e9ee;
  --desktop-nav-hover-ink: #a0520c;
  --desktop-nav-active-bg: #fff;
  --desktop-nav-active-ink: #c96a12;
  --desktop-nav-active-border: #ffd0a6;
  --desktop-nav-tooltip-bg: #1f2329;
  --desktop-nav-tooltip-ink: #f7f8fa;
  --desktop-nav-avatar-border: #ffd0a6;
  --desktop-nav-avatar-shadow: rgba(40, 28, 17, .14);
  display: flex;
  width: 52px;
  min-height: 0;
  flex: none;
  flex-direction: column;
  padding: 10px 5px 12px;
  border-right: 1px solid var(--desktop-nav-border);
  color: var(--desktop-nav-ink);
  background: var(--desktop-nav-bg);
}

.desktop-primary-nav__items {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.desktop-primary-nav__item {
  position: relative;
  display: flex;
  width: 42px;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: 0;
  border-radius: 10px;
  color: inherit;
  background: transparent;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
}

.desktop-primary-nav__item:hover {
  color: var(--desktop-nav-hover-ink);
  background: var(--desktop-nav-hover-bg);
}

.desktop-primary-nav__item.active {
  color: var(--desktop-nav-active-ink);
  background: var(--desktop-nav-active-bg);
  box-shadow: 0 1px 3px rgba(40, 28, 17, .08), inset 0 0 0 1px var(--desktop-nav-active-border);
}

.desktop-primary-nav__item:focus-visible {
  outline: 2px solid #e8811f;
  outline-offset: 1px;
}

.desktop-primary-nav__icon {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
}

.desktop-primary-nav__icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.desktop-primary-nav__icon .desktop-primary-nav__knowledge-icon {
  stroke-width: 32;
}

.desktop-primary-nav__item::after {
  position: absolute;
  z-index: 60;
  top: 50%;
  left: calc(100% + 10px);
  padding: 6px 9px;
  border-radius: 7px;
  color: var(--desktop-nav-tooltip-ink);
  background: var(--desktop-nav-tooltip-bg);
  box-shadow: 0 6px 18px rgba(40, 28, 17, .18);
  content: attr(data-tooltip);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  opacity: 0;
  pointer-events: none;
  transform: translate(2px, -50%);
  transition: opacity 140ms ease, transform 140ms ease;
  white-space: nowrap;
}

.desktop-primary-nav__item:hover::after,
.desktop-primary-nav__item:focus-visible::after {
  opacity: 1;
  transform: translate(0, -50%);
}

.desktop-primary-nav__badge {
  position: absolute;
  top: 3px;
  right: 3px;
  display: grid;
  min-width: 15px;
  height: 15px;
  place-items: center;
  padding: 0 2px;
  border: 2px solid #fff6ee;
  border-radius: 999px;
  color: #fff;
  background: #ef4444;
  font-size: 8px;
  font-weight: 800;
  line-height: 11px;
}

.desktop-primary-nav__account {
  position: relative;
  display: grid;
  width: 34px;
  height: 34px;
  flex: none;
  place-items: center;
  align-self: center;
  margin-top: auto;
  padding: 0;
  overflow: visible;
  border: 1px solid var(--desktop-nav-avatar-border);
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(145deg, #f59a3c, #c96a12);
  box-shadow: 0 2px 7px var(--desktop-nav-avatar-shadow);
  cursor: pointer;
}

.desktop-primary-nav__account:hover {
  border-color: var(--desktop-nav-active-ink);
  box-shadow: 0 4px 11px var(--desktop-nav-avatar-shadow);
}

.desktop-primary-nav__account:focus-visible {
  outline: 2px solid #e8811f;
  outline-offset: 2px;
}

.desktop-primary-nav__account img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.desktop-primary-nav__account span {
  font-size: 13px;
  font-weight: 750;
}

.desktop-primary-nav__account::after {
  position: absolute;
  z-index: 60;
  top: 50%;
  left: calc(100% + 10px);
  padding: 6px 9px;
  border-radius: 7px;
  color: var(--desktop-nav-tooltip-ink);
  background: var(--desktop-nav-tooltip-bg);
  box-shadow: 0 6px 18px rgba(40, 28, 17, .18);
  content: attr(data-tooltip);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  opacity: 0;
  pointer-events: none;
  transform: translate(2px, -50%);
  transition: opacity 140ms ease, transform 140ms ease;
  white-space: nowrap;
}

.desktop-primary-nav__account:hover::after,
.desktop-primary-nav__account:focus-visible::after {
  opacity: 1;
  transform: translate(0, -50%);
}

:global(html.platform-desktop.theme-dark .desktop-primary-nav) {
  --desktop-nav-bg: #1f2329;
  --desktop-nav-border: #393d44;
  --desktop-nav-ink: #98a0ae;
  --desktop-nav-hover-bg: #374151;
  --desktop-nav-hover-ink: #eff1f4;
  --desktop-nav-active-bg: #3b3f46;
  --desktop-nav-active-ink: #fff;
  --desktop-nav-active-border: #50555e;
  --desktop-nav-tooltip-bg: #e6e9ee;
  --desktop-nav-tooltip-ink: #14171c;
  --desktop-nav-avatar-border: #4b5563;
  --desktop-nav-avatar-shadow: rgba(0, 0, 0, .34);
}

:global(html.platform-desktop.theme-dark .desktop-primary-nav__badge) {
  border-color: #1f2329;
}

@media (prefers-reduced-motion: reduce) {
  .desktop-primary-nav__item,
  .desktop-primary-nav__item::after,
  .desktop-primary-nav__account::after { transition: none; }
}
</style>
