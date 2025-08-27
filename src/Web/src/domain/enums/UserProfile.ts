// Enum compatível com UserRole do backend
export enum UserProfile {
  ADMINISTRADOR = 1, // Mudança: agora usa valores numéricos como no backend
  MEDICO = 2,
}

// Enum com strings para exibição na UI (compatível com backend Description)
export enum UserProfileStrings {
  ADMINISTRADOR = 'Administrador',
  MEDICO = 'Médico',
}

export const UserProfileLabels = {
  [UserProfile.ADMINISTRADOR]: 'Administrador',
  [UserProfile.MEDICO]: 'Médico',
} as const;

// Função para converter string para enum numérico
export const stringToUserProfile = (roleString: string): UserProfile => {
  switch (roleString) {
    case 'Administrador':
      return UserProfile.ADMINISTRADOR;
    case 'Médico':
      return UserProfile.MEDICO;
    default:
      throw new Error(`Role não reconhecido: ${roleString}`);
  }
};

// Função para converter enum numérico para string
export const userProfileToString = (role: UserProfile): string => {
  return UserProfileLabels[role];
};