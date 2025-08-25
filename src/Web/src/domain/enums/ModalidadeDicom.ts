export enum ModalidadeDicom {
  CT = 'CT',
  MR = 'MR',
  US = 'US',
  XR = 'XR',
  CR = 'CR',
  DR = 'DR',
  MG = 'MG',
  NM = 'NM',
  PT = 'PT',
  RF = 'RF',
}

export const ModalidadeDicomLabels = {
  [ModalidadeDicom.CT]: 'Tomografia Computadorizada',
  [ModalidadeDicom.MR]: 'Ressonância Magnética',
  [ModalidadeDicom.US]: 'Ultrassom',
  [ModalidadeDicom.XR]: 'Radiografia',
  [ModalidadeDicom.CR]: 'Radiografia Computadorizada',
  [ModalidadeDicom.DR]: 'Radiografia Digital',
  [ModalidadeDicom.MG]: 'Mamografia',
  [ModalidadeDicom.NM]: 'Medicina Nuclear',
  [ModalidadeDicom.PT]: 'Tomografia por Emissão de Pósitrons',
  [ModalidadeDicom.RF]: 'Radiofluoroscopia',
} as const;