import { useDailyReminder } from '../hooks/useDailyReminder'
import { useReminderSettings } from '../hooks/useReminderSettings'
import type { City } from '../types/city'
import './DailyReminderSettings.css'

interface DailyReminderSettingsProps {
  city: City | null
}

export function DailyReminderSettings({ city }: DailyReminderSettingsProps) {
  const reminder = useReminderSettings(city)

  useDailyReminder({
    time: reminder.settings.time,
    enabled: reminder.settings.enabled,
    canNotify: reminder.support === 'granted',
    lastNotifiedDate: reminder.settings.lastNotifiedDate,
    city,
    onFired: reminder.markNotified,
  })

  if (reminder.support === 'unsupported') {
    return (
      <section className="dailyReminder">
        <h2 className="dailyReminder__title">Daily reminder</h2>
        <p className="dailyReminder__notice">Your browser doesn't support notifications.</p>
      </section>
    )
  }

  return (
    <section className="dailyReminder">
      <h2 className="dailyReminder__title">Daily reminder</h2>

      {reminder.support === 'denied' && (
        <p className="dailyReminder__notice" role="status">
          Notifications are blocked for this site. To turn them on, allow notifications for WeatherBoard in your
          browser's site settings, then reload the page.
        </p>
      )}

      {reminder.support === 'default' && (
        <>
          <p className="dailyReminder__explainer">
            We'll send one notification a day, around the time you choose, with the current weather for your
            last-viewed city — so you know before you head out. We only ask for this permission once, when you
            click below.
          </p>

          <label className="dailyReminder__timeLabel" htmlFor="reminder-time">
            Remind me at
          </label>
          <input
            id="reminder-time"
            type="time"
            className="dailyReminder__timeInput"
            value={reminder.settings.time}
            onChange={(event) => reminder.setTime(event.target.value)}
          />

          <button
            type="button"
            className="dailyReminder__primaryButton"
            onClick={() => void reminder.enableReminders()}
          >
            Enable reminders
          </button>
        </>
      )}

      {reminder.support === 'granted' && (
        <>
          <label className="dailyReminder__timeLabel" htmlFor="reminder-time">
            Remind me at
          </label>
          <input
            id="reminder-time"
            type="time"
            className="dailyReminder__timeInput"
            value={reminder.settings.time}
            onChange={(event) => reminder.setTime(event.target.value)}
          />

          <div className="dailyReminder__actions">
            <button
              type="button"
              className="dailyReminder__primaryButton"
              onClick={reminder.settings.enabled ? reminder.disableReminders : () => void reminder.enableReminders()}
            >
              {reminder.settings.enabled ? 'Turn off reminders' : 'Turn on reminders'}
            </button>
            <button
              type="button"
              className="dailyReminder__secondaryButton"
              disabled={reminder.testNotificationStatus.kind === 'sending'}
              onClick={() => void reminder.sendTestNotification()}
            >
              {reminder.testNotificationStatus.kind === 'sending' ? 'Sending…' : 'Send test notification'}
            </button>
          </div>

          {reminder.testNotificationStatus.kind === 'success' && (
            <p className="dailyReminder__notice dailyReminder__notice--success" role="status">
              Test notification sent — check your system notifications.
            </p>
          )}

          {reminder.testNotificationStatus.kind === 'error' && (
            <p className="dailyReminder__notice dailyReminder__notice--error" role="alert">
              {reminder.testNotificationStatus.message}
            </p>
          )}
        </>
      )}
    </section>
  )
}
