export type TranslationParams = Record<string, string | number>;

export type Translations = {
  common: {
    cancel: string;
    save: string;
    tryAgain: string;
    of: string;
  };
  settings: {
    notifications: string;
    dailyCheckInReminder: string;
    reminderTime: string;
    notificationsDisabledFooter: string;
    openSettings: string;
    appearance: string;
    theme: string;
    themeSystem: string;
    themeLight: string;
    themeDark: string;
    general: string;
    language: string;
  };
  checkIn: {
    title: string;
    titleToday: string;
    titlePast: string;
    subtitle: string;
    subtitleUpdate: string;
    progress: string;
    notesTitle: string;
    notesSubtitle: string;
    notesPlaceholder: string;
    notesExpand: string;
    notesCollapse: string;
    save: string;
    update: string;
    validationIncomplete: string;
    validationNotesLength: string;
    futureDateError: string;
    categories: {
      appetite: string;
      waterIntake: string;
      energy: string;
      mood: string;
      pee: string;
      poop: string;
    };
    options: {
      appetite: Record<string, string>;
      waterIntake: Record<string, string>;
      energy: Record<string, string>;
      mood: Record<string, string>;
      pee: Record<string, string>;
      poop: Record<string, string>;
    };
  };
  checkInSuccess: {
    title: string;
    firstMessage: string;
    message: string;
    goHome: string;
  };
  dashboard: {
    startCheckIn: string;
    dailyCheckInProgress: string;
    todaysCheckIn: string;
    todaysCheckInStart: string;
    todaysCheckInUpdate: string;
    notCheckedIn: string;
    allNormalToday: string;
    notes: string;
  };
};
