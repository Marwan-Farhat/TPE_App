import { TestTemplate, TestTemplateFormData } from '@/types/testTemplate';

const STORAGE_KEY = 'proenglish_test_templates';

const getAll = (): TestTemplate[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const save = (templates: TestTemplate[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

const getById = (id: string): TestTemplate | undefined => {
  return getAll().find((t) => t.id === id);
};

const getActive = (): TestTemplate[] => {
  return getAll().filter((t) => t.isActive);
};

const getCurrent = (): TestTemplate | undefined => {
  return getAll().find((t) => t.isCurrent);
};

const create = (data: TestTemplateFormData): TestTemplate => {
  const all = getAll();

  // If setting as current, unset previous current
  if (data.isCurrent) {
    all.forEach((t) => (t.isCurrent = false));
  }

  const newTemplate: TestTemplate = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(newTemplate);
  save(all);
  return newTemplate;
};

const update = (id: string, data: Partial<TestTemplateFormData>): TestTemplate | null => {
  const all = getAll();
  const index = all.findIndex((t) => t.id === id);
  if (index === -1) return null;

  // If setting as current, unset previous current
  if (data.isCurrent) {
    all.forEach((t) => (t.isCurrent = false));
  }

  all[index] = { ...all[index], ...data, updatedAt: new Date().toISOString() };
  save(all);
  return all[index];
};

const toggleActive = (id: string): TestTemplate | null => {
  const all = getAll();
  const template = all.find((t) => t.id === id);
  if (!template) return null;

  // Cannot deactivate if it's the current one
  if (template.isActive && template.isCurrent) {
    return null; // Caller should show warning
  }

  template.isActive = !template.isActive;
  template.updatedAt = new Date().toISOString();
  save(all);
  return template;
};

const toggleCurrent = (id: string): TestTemplate | null => {
  const all = getAll();
  const template = all.find((t) => t.id === id);
  if (!template) return null;

  if (template.isCurrent) {
    // Cannot unset current without setting another
    return null;
  }

  // Must be active to become current
  if (!template.isActive) return null;

  // Unset all others
  all.forEach((t) => (t.isCurrent = false));
  template.isCurrent = true;
  template.updatedAt = new Date().toISOString();
  save(all);
  return template;
};

const remove = (id: string): boolean => {
  const all = getAll();
  const template = all.find((t) => t.id === id);
  if (!template) return false;

  // Cannot delete current template
  if (template.isCurrent) return false;

  const filtered = all.filter((t) => t.id !== id);
  save(filtered);
  return true;
};

export const testTemplateService = {
  getAll,
  getById,
  getActive,
  getCurrent,
  create,
  update,
  toggleActive,
  toggleCurrent,
  remove,
};
