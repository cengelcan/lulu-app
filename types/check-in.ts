export type Appetite = 'less' | 'normal' | 'more';

export type WaterIntake = 'less' | 'normal' | 'more';

export type Energy = 'low' | 'normal' | 'high';

export type Mood = 'low' | 'normal' | 'high';

export type Pee = 'not_observed' | 'normal' | 'not_normal';

export type Poop = 'not_observed' | 'normal' | 'not_normal';

export type CheckInCategory = 'appetite' | 'waterIntake' | 'poop' | 'pee' | 'energy' | 'mood';

export type CheckIn = {
  id: string;
  petId: string;
  date: string;
  appetite: Appetite;
  waterIntake: WaterIntake;
  energy: Energy;
  mood: Mood;
  pee: Pee;
  poop: Poop;
  notes?: string | null;
  createdAt: string;
};

export type CheckInFormState = {
  appetite: Appetite | null;
  waterIntake: WaterIntake | null;
  energy: Energy | null;
  mood: Mood | null;
  pee: Pee | null;
  poop: Poop | null;
  notes?: string | null;
};

export type CheckInFormValues = {
  appetite: Appetite;
  waterIntake: WaterIntake;
  energy: Energy;
  mood: Mood;
  pee: Pee;
  poop: Poop;
  notes?: string | null;
};
