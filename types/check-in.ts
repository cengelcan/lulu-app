export type Appetite = 'good' | 'normal' | 'reduced' | 'not_eating';

export type Energy = 'high' | 'normal' | 'low';

export type Symptom = 'none' | 'vomiting' | 'diarrhea' | 'other';

export type CheckInPreference =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'multiple_times_daily';

export type CheckIn = {
  id: string;
  petId: string;
  date: string;
  appetite: Appetite;
  energy: Energy;
  symptom: Symptom;
  createdAt: string;
};
