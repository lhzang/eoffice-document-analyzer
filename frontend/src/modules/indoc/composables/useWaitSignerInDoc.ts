import { ref } from 'vue'

export const useWaitSignerInDoc = () => {
  const waitSigner = ref(false)

  const setWaitSigner = (value: boolean) => {
    waitSigner.value = value
  }

  const getWaitSigner = () => {
    return waitSigner.value
  }

  return {
    setWaitSigner,
    getWaitSigner
  }
}
