export interface TestTemplate {
  id: string;
  title: string;
  description: string;
  price: number;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestTemplateFormData {
  title: string;
  description: string;
  price: number;
  isActive: boolean;
  isCurrent: boolean;
}
