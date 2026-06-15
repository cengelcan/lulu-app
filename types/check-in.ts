export type Appetite = 'no_appetite' | 'reduced' | 'normal' | 'increased';

export type WaterIntake = 'very_low' | 'low' | 'normal' | 'high' | 'very_high';

export type Energy = 'very_low' | 'low' | 'normal' | 'high' | 'very_high';

export type Mood = 'restless' | 'irritable' | 'normal' | 'happy' | 'playful';

export type Pee =
  | 'straining'
  | 'less_than_normal'
  | 'normal'
  | 'more_than_normal'
  | 'not_observed';

export type Poop = 'diarrhea' | 'soft' | 'normal' | 'hard' | 'none' | 'not_observed';

export type CheckInCategory = 'appetite' | 'waterIntake' | 'energy' | 'mood' | 'pee' | 'poop';

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
