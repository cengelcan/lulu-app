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
  auth: {
    title: string;
    subtitle: string;
    titleSignUp: string;
    subtitleSignUp: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    signInButton: string;
    signUpButton: string;
    toggleToSignUp: string;
    toggleToSignIn: string;
    confirmEmailTitle: string;
    confirmEmailMessage: string;
    errors: {
      emailRequired: string;
      emailInvalid: string;
      passwordRequired: string;
      passwordTooShort: string;
      invalid_credentials: string;
      email_taken: string;
      weak_password: string;
      email_not_confirmed: string;
      network: string;
      unknown: string;
    };
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
    noPet: string;
    next: string;
    back: string;
    exportPdf: string;
    shareReport: string;
    exportFailed: string;
    exportFileName: string;
    steps: {
      label: string;
      rangeTitle: string;
      dataTitle: string;
      previewTitle: string;
      reviewTitle: string;
    };
    petCard: {
      owner: string;
      microchip: string;
      weightRecorded: string;
      ageYearsMonths: string;
      ageYears: string;
      ageMonths: string;
    };
    review: {
      hint: string;
      appStoreBadge: string;
      dailyObservations: string;
      recordsSection: string;
      empty: string;
      generatedOn: string;
      pageOf: string;
      dayStatusNormal: string;
      dayStatusAlert: string;
      summaryTitle: string;
      summaryObservedDays: string;
      summaryAttentionDays: string;
      summaryAllNormal: string;
    };
    range: {
      sectionTitle: string;
      customTitle: string;
      startDate: string;
      endDate: string;
      presets: {
        '7d': string;
        '30d': string;
        '90d': string;
        custom: string;
      };
    };
    data: {
      checkInsSection: string;
      recordsSection: string;
    };
    preview: {
      petSection: string;
      checkInsSection: string;
      recordsSection: string;
      empty: string;
    };
    validation: {
      invalidRange: string;
      noDataSelected: string;
    };
    pdf: {
      title: string;
      generatedFor: string;
      dateRange: string;
    };
  };
  records: {
    title: string;
    addRecord: string;
    addRecordType: string;
    editRecord: string;
    saveRecord: string;
    saveChanges: string;
    saveFailed: string;
    recentTitle: string;
    sectionTitle: string;
    sections: {
      details: string;
      notes: string;
      attachments: string;
    };
    fields: {
      date: string;
      datePlaceholder: string;
      notes: string;
      notesPlaceholder: string;
      clinicName: string;
      clinicNamePlaceholder: string;
      reason: string;
      reasonPlaceholder: string;
      vaccineName: string;
      vaccineNamePlaceholder: string;
      batchNumber: string;
      batchNumberPlaceholder: string;
      nextDueDate: string;
      productName: string;
      productNamePlaceholder: string;
      medicationName: string;
      medicationNamePlaceholder: string;
      dosage: string;
      dosagePlaceholder: string;
      frequency: string;
      frequencyPlaceholder: string;
      endDate: string;
      severity: string;
      weightValue: string;
      weightValuePlaceholder: string;
      weightUnit: string;
      title: string;
      titlePlaceholder: string;
    };
    severity: {
      mild: string;
      moderate: string;
      severe: string;
    };
    units: {
      kg: string;
      lb: string;
    };
    summary: {
      vetVisit: string;
      vaccine: string;
      parasite: string;
      medication: string;
      vomiting: string;
      weightValue: string;
      other: string;
    };
    attachment: {
      title: string;
      subtitle: string;
    };
    validation: {
      dateRequired: string;
      dateInvalid: string;
      vaccineNameRequired: string;
      medicationNameRequired: string;
      weightValueRequired: string;
      weightValueInvalid: string;
      titleRequired: string;
      notesTooLong: string;
    };
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
