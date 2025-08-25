export enum UserProfile {
  ADMINISTRADOR = 'Administrador',
  MEDICO = 'Médico',
}

export const UserProfileLabels = {
  [UserProfile.ADMINISTRADOR]: 'Administrador',
  [UserProfile.MEDICO]: 'Médico',
} as const;