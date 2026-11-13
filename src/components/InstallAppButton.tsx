import { useInstallPrompt } from '../hooks/useInstallPrompt'
import './InstallAppButton.css'

export function InstallAppButton() {
  const { isInstallable, promptInstall } = useInstallPrompt()

  if (!isInstallable) {
    return null
  }

  return (
    <button type="button" className="installAppButton" onClick={promptInstall}>
      Install app
    </button>
  )
}
