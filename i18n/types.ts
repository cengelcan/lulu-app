export type TranslationParams = Record<string, string | number>;

type PetOptionMap = Record<string, string>;

export type Translations = {
  common: {
    cancel: string;
    save: string;
    tryAgain: string;
    of: string;
    ok: string;
    continue: string;
    delete: string;
    edit: string;
    optional: string;
    next: string;
    addPet: string;
    setUpPet: string;
    date: string;
    time: string;
    today: string;
    tomorrow: string;
  };
  tabs: {
    home: string;
    myPets: string;
    profile: string;
  };
  settings: {
    title: string;
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
    languageSystem: string;
    languageEnglish: string;
    languageTurkish: string;
    languageGerman: string;
  };
  onboarding: {
    intro1: { title: string; description: string; button: string };
    intro2: { title: string; description: string; button: string };
    intro3: { title: string; description: string; button: string };
    intro4: { title: string; description: string; button: string };
  };
  setup: {
    petType: { title: string; description: string };
    petName: { title: string; description: string; placeholder: string };
    petBreed: { title: string; description: string };
    petAge: { title: string; description: string };
    healthConditions: { title: string; description: string; addPet: string };
    checkInPrefs: { title: string; description: string };
    notifications: {
      title: string;
      description: string;
      allow: string;
      maybeLater: string;
    };
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
      appetite: PetOptionMap;
      waterIntake: PetOptionMap;
      energy: PetOptionMap;
      mood: PetOptionMap;
      pee: PetOptionMap;
      poop: PetOptionMap;
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
    noPetTitle: string;
    noPetMessage: string;
    petProfileA11y: string;
    upcomingReminder: string;
    remindersOff: string;
    notificationsDisabled: string;
    enableInSettings: string;
    noReminderScheduled: string;
    quickActions: string;
    reports: string;
    records: string;
    medication: string;
    missedCheckInToday: string;
    missedCheckInYesterday: string;
    missedCheckInCta: string;
  };
  reports: {
    title: string;
    comingSoonTitle: string;
    comingSoonMessage: string;
  };
  records: {
    title: string;
    addRecord: string;
    sectionTitle: string;
    types: {
      vetVisit: string;
      vaccine: string;
      parasite: string;
      medication: string;
      vomiting: string;
      weight: string;
      other: string;
    };
  };
  notifications: {
    reminderTitle: string;
    reminderBody: string;
  };
  myPets: {
    noPetsTitle: string;
    noPetsMessage: string;
  };
  profile: {
    addYourName: string;
    openSettingsA11y: string;
    changePhotoA11y: string;
    editNameA11y: string;
    photoAccessTitle: string;
    photoAccessMessage: string;
    couldNotSavePhoto: string;
    couldNotSaveName: string;
    luluPlus: string;
    luluPlusActive: string;
    luluPlusInactive: string;
    manage: string;
    upgrade: string;
    manageA11y: string;
    upgradeA11y: string;
    rateLulu: string;
    shareLulu: string;
    followInstagram: string;
    privacyPolicy: string;
    terms: string;
    deleteAccount: string;
    logOut: string;
    deleteAccountTitle: string;
    deleteAccountMessage: string;
    editNameTitle: string;
    editNameMessage: string;
    editNamePlaceholder: string;
    version: string;
  };
  modals: {
    comingSoonTitle: string;
    comingSoonMessage: string;
  };
  pet: {
    notSet: string;
    none: string;
    profileTitle: string;
    editProfile: string;
    editProfileA11y: string;
    editTitle: string;
    saveA11y: string;
    changePhoto: string;
    changePhotoA11y: string;
    discardTitle: string;
    discardMessage: string;
    keepEditing: string;
    discard: string;
    photoPermissionError: string;
    sections: {
      profilePhoto: string;
      petType: string;
      breed: string;
      basicInformation: string;
      healthInformation: string;
      additionalInformation: string;
      owner: string;
    };
    fields: {
      breed: string;
      color: string;
      sex: string;
      ageGroup: string;
      spayNeuter: string;
      birthDate: string;
      healthConditions: string;
      adoptionDate: string;
      microchip: string;
      ownerName: string;
      petName: string;
      colorPlaceholder: string;
      birthDatePlaceholder: string;
      adoptionDatePlaceholder: string;
      microchipPlaceholder: string;
      ownerNamePlaceholder: string;
      petNamePlaceholder: string;
    };
    options: {
      species: PetOptionMap;
      sex: PetOptionMap;
      spayNeuter: PetOptionMap;
      ageGroup: PetOptionMap;
      healthCondition: PetOptionMap;
      breeds: PetOptionMap;
    };
    validation: {
      nameRequired: string;
      nameMaxLength: string;
      speciesRequired: string;
      ageGroupRequired: string;
      invalidDate: string;
      colorMaxLength: string;
      ownerNameMaxLength: string;
      microchipMaxLength: string;
    };
  };
};
