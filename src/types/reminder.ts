export interface ReminderSettings {
  enabled: boolean
  /** 24-hour "HH:MM", matches <input type="time">'s value format. */
  time: string
  /** YYYY-MM-DD of the last date a reminder notification actually fired. */
  lastNotifiedDate: string | null
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  time: '08:00',
  lastNotifiedDate: null,
}
