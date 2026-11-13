import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export interface UseInstallPromptResult {
  isInstallable: boolean
  promptInstall: () => void
}

export function useInstallPrompt(): UseInstallPromptResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(() => {
    if (!deferredPrompt) return
    deferredPrompt
      .prompt()
      .then(() => deferredPrompt.userChoice)
      .catch(() => {
        // The prompt can reject if it's no longer valid (e.g. already dismissed once);
        // nothing to show the user for an install action they didn't get to finish.
      })
      .finally(() => setDeferredPrompt(null))
  }, [deferredPrompt])

  return {
    isInstallable: deferredPrompt !== null,
    promptInstall,
  }
}
