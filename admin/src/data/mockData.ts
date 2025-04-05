// Types for our data models
export interface Template {
  id: number;
  name: string;
  owner: string;
  powerForms: string;
  createdDate: string;
  createdTime: string;
  lastChange: string;
  lastChangeTime: string;
  folders: string;
}

// Mock data for templates
export const mockTemplates: Template[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  name: "Template Name",
  owner: "John Smith",
  powerForms: "Null",
  createdDate: "12/01/2025",
  createdTime: "9:30 AM",
  lastChange: "01/01/2025",
  lastChangeTime: "10:45 AM",
  folders: "Null",
}));

// Export a function to get a limited number of templates if needed
export const getTemplates = (count: number = mockTemplates.length) => {
  return mockTemplates.slice(0, count);
};
