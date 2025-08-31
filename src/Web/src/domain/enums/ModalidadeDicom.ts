// DICOM modalities enum - compatible with backend
export enum ModalidadeDicom {
  CR = 'CR', // Computed Radiography
  CT = 'CT', // Computed Tomography
  DX = 'DX', // Digital Radiography (changed from XR)
  MG = 'MG', // Mammography
  MR = 'MR', // Magnetic Resonance
  NM = 'NM', // Nuclear Medicine
  OT = 'OT', // Other (added from backend)
  PT = 'PT', // Positron Emission Tomography
  RF = 'RF', // Radio Fluoroscopy
  US = 'US', // Ultrasound
  XA = 'XA', // X-Ray Angiography (added from backend)
}

export const ModalidadeDicomLabels = {
  [ModalidadeDicom.CR]: 'Radiografia Computadorizada',
  [ModalidadeDicom.CT]: 'Tomografia Computadorizada',
  [ModalidadeDicom.DX]: 'Radiografia Digital',
  [ModalidadeDicom.MG]: 'Mamografia',
  [ModalidadeDicom.MR]: 'Ressonância Magnética',
  [ModalidadeDicom.NM]: 'Medicina Nuclear',
  [ModalidadeDicom.OT]: 'Outros',
  [ModalidadeDicom.PT]: 'Tomografia por Emissão de Pósitrons',
  [ModalidadeDicom.RF]: 'Radiofluoroscopia',
  [ModalidadeDicom.US]: 'Ultrassom',
  [ModalidadeDicom.XA]: 'Angiografia por Raios-X',
} as const;
