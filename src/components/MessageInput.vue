<template>
  <div class="message-input w-full shadow-sm border border-input rounded-lg bg-background p-2 focus-within:ring-1 focus-within:ring-ring transition-all">
    <div v-if="imagePreview"  class="mb-2 relative flex items-center p-2 border border-border rounded-md bg-muted/50 w-fit">
      <img :src="imagePreview" alt="Preview" class="h-16 w-16 object-cover rounded">
      <button @click="clearImage" class="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm hover:bg-destructive/90">
         <Icon icon="radix-icons:cross-2" class="w-3 h-3" />
      </button>
    </div>
    <div class="flex items-center gap-2">
      <input type="file"  accept="image/*" ref="fileInput" class="hidden" @change="handleImageUpload">
      <button
         class="p-2 rounded-md transition-colors"
         :class="[
            disabled ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
         ]"
         @click="triggerFileInput"
      >
        <Icon 
          icon="radix-icons:image" 
          width="20" 
          height="20" 
        />
      </button>

      <input 
        class="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" 
        type="text" 
        v-model="model" 
        :placeholder="t('common.typeMessage')"
        :disabled="disabled"
        @keydown.enter="onCreate"
      >
      
      <Button 
        size="sm" 
        icon-name="radix-icons:paper-plane" 
        @click="onCreate" 
        :disabled="disabled || (!model && !selectedImage)"
      >
        {{ t('common.send') }}
      </Button>
    </div>
  </div>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import Button from './Button.vue'

const { t } = useI18n()

const props = defineProps<{
  disabled?: boolean;
}>()
const emit = defineEmits<{
  create: [value: string, imagePath?: string]
}>()
const model = defineModel<string>()
const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref('')

const triggerFileInput = () => {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}
let selectedImage:File | null = null

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    console.log(target.files[0])
    selectedImage = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      console.log(e.target?.result)
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(selectedImage)
  }
}

const clearImage = () => {
  selectedImage = null
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const onCreate = () => {
  if((model.value && model.value.trim() !== '') || selectedImage) {
    emit('create', model.value || '', selectedImage?.path || undefined)
    clearImage()
  } 
}

</script>
