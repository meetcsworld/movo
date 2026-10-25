import { computed, ref } from 'vue'
import { fetchChatModels, type ChatModelOption } from '../api/models'
import { t, type Locale } from './i18n'

export function useChatModels(options: {
  getMainId: () => string
  getLocale: () => Locale
  getPreferredModelId?: () => string
  canLoad?: () => boolean
}) {
  const chatModels = ref<ChatModelOption[]>([])
  const selectedModelId = ref('')
  const modelLoadError = ref('')
  const modelsLoading = ref(false)

  const selectedModel = computed(() => chatModels.value.find((item) => item.id === selectedModelId.value) || null)
  const modelSelectorLabel = computed(() => {
    if (modelsLoading.value) return t('chat.models_loading')
    if (modelLoadError.value) return t('chat.models_load_failed')
    if (selectedModel.value) return selectedModel.value.displayName || selectedModel.value.modelName
    const fallback = options.getLocale() === 'en' ? 'No model configured' : '未配置模型'
    if (chatModels.value.length) return chatModels.value[0]?.displayName || chatModels.value[0]?.modelName || fallback
    return fallback
  })

  function isAuthError(error: any) {
    const status = error?.response?.status ?? error?.status
    return status === 401 || status === 403
  }

  async function loadChatModels() {
    // 未登录 / 无可用凭证时不发起模型请求，避免首屏出现 401 与「模型加载失败」误导文案。
    if (options.canLoad && !options.canLoad()) {
      chatModels.value = []
      selectedModelId.value = ''
      modelLoadError.value = ''
      modelsLoading.value = false
      return
    }
    try {
      modelsLoading.value = true
      modelLoadError.value = ''
      const items = await fetchChatModels(options.getMainId() || 'default')
      chatModels.value = items
      const preferredModelId = options.getPreferredModelId?.() || ''
      if (preferredModelId && items.some((item) => item.id === preferredModelId)) {
        selectedModelId.value = preferredModelId
      } else if (!selectedModelId.value) {
        selectedModelId.value = items[0]?.id || ''
      } else if (!items.some((item) => item.id === selectedModelId.value)) {
        selectedModelId.value = items[0]?.id || ''
      }
    } catch (error: any) {
      chatModels.value = []
      selectedModelId.value = ''
      // 认证类错误（如登录前/凭证过期）静默降级，不向用户抛出「加载失败」。
      modelLoadError.value = isAuthError(error) ? '' : String(error?.message || t('chat.models_load_failed'))
    } finally {
      modelsLoading.value = false
    }
  }

  function selectChatModel(modelId: string) {
    selectedModelId.value = modelId
  }

  return {
    chatModels,
    selectedModelId,
    modelLoadError,
    modelsLoading,
    selectedModel,
    modelSelectorLabel,
    loadChatModels,
    selectChatModel,
  }
}
