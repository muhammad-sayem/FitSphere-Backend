export interface ICreateTrainerProfile {
  bio?: string;
  specialties: string;
  experience: number;
  feePerHour: number;
}

export interface IUpdateTrainerProfile {
  bio?: string;
  specialties?: string;
  experience?: number;
  feePerHour?: number;
}