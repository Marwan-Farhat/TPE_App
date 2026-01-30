// Extra Field Data Types
export type ExtraFieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'options'
  | 'longText'
  | 'phoneNumber'
  | 'email'
  | 'dateTime'
  | 'date'
  | 'time';

export interface ExtraFieldOption {
  value: string;
  label: string;
}

export interface ExtraField {
  id: string;
  code: string; // Unique code for the field
  title: string;
  description?: string;
  type: ExtraFieldType;
  defaultValue?: string | number | boolean;
  options?: ExtraFieldOption[]; // For 'options' type
  isMandatory: boolean;
  isSearchable: boolean; // Shows in filters
  allowOwnerEdit: boolean; // Client/Instructor can edit
  createdAt: string;
  updatedAt: string;
}

// Extra field value for a specific client
export interface ExtraFieldValue {
  fieldId: string;
  value: string | number | boolean | null;
}

// Create/Update payload
export interface CreateExtraFieldPayload {
  title: string;
  description?: string;
  type: ExtraFieldType;
  code: string;
  defaultValue?: string | number | boolean;
  options?: ExtraFieldOption[];
  isMandatory: boolean;
  isSearchable: boolean;
  allowOwnerEdit: boolean;
}

export type UpdateExtraFieldPayload = Partial<CreateExtraFieldPayload>;