
import { 
  Lead, PipelineStage, Comment, EnrichmentData, LeadFile, Owner, 
  Task, Todo, Project, UserSettings, Deal, EmailSettings, EmailProvider, UserStatus 
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type } from "@google/genai";

// Simulated Latency to make it feel like a real backend
const SIMULATED_LATENCY = 300; 

const STORAGE_KEYS = {
  LEADS: 'lead_generator_leads',
  TASKS: 'lead_generator_tasks',
  TODOS: 'lead_generator_todos',
  PROJECTS: 'lead_generator_projects',
  SETTINGS: 'lead_generator_settings',
  DEALS: 'lead_generator_deals',
  OWNERS: 'lead_generator_owners',
  EMAIL_SETTINGS: 'lead_generator_email_settings',
};

const INITIAL_SETTINGS: UserSettings = {
  pushNotificationsEnabled: true,
  theme: 'light',
  language: 'de'
};

const INITIAL_EMAIL_SETTINGS: EmailSettings = {
  provider: EmailProvider.WORKSPACE_GMAIL_API,
  serviceMailboxEmail: 'mailer@firma.tld',
  brandFromEmail: 'sales@firma.tld',
  fromName: 'Lead Generator Pro',
  replyToEmail: 'sales@firma.tld'
};

const INITIAL_OWNERS: Owner[] = [
  { id: 'o1', name: 'Max Mustermann', email: 'max@firma.tld', role: 'Sales Lead', avatar: 'MM', status: UserStatus.ACTIVE },
  { id: 'o2', name: 'Sarah Schmidt', email: 'sarah@firma.tld', role: 'Account Manager', avatar: 'SS', status: UserStatus.ACTIVE },
  { id: 'o3', name: 'Julian Weber', email: 'julian@firma.tld', role: 'Business Development', avatar: 'JW', status: UserStatus.ACTIVE },
];

// Helper to simulate "fetch" with latency
const mockFetch = async <T>(callback: () => T): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, SIMULATED_LATENCY));
  return callback();
};

export const api = {
  // --- Email Settings ---
  getEmailSettings: async (): Promise<EmailSettings> => {
    return mockFetch(() => {
      const data = localStorage.getItem(STORAGE_KEYS.EMAIL_SETTINGS);
      return data ? JSON.parse(data) : INITIAL_EMAIL_SETTINGS;
    });
  },

  updateEmailSettings: async (updates: Partial<EmailSettings>): Promise<EmailSettings> => {
    return mockFetch(() => {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMAIL_SETTINGS) || JSON.stringify(INITIAL_EMAIL_SETTINGS));
      const updated = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEYS.EMAIL_SETTINGS, JSON.stringify(updated));
      return updated;
    });
  },

  checkSendAsPermission: async (): Promise<{ ok: boolean; message: string }> => {
    // Simulated backend identity check
    await new Promise(r => setTimeout(r, 1200));
    const settings = await api.getEmailSettings();

    if (settings.provider === EmailProvider.WORKSPACE_GMAIL_API) {
      const isAuthorized = settings.brandFromEmail.includes('firma.tld'); 
      if (!isAuthorized) {
        return { 
          ok: false, 
          message: `Fehler: Die Service-Mailbox ist nicht berechtigt als ${settings.brandFromEmail} zu senden.` 
        };
      }
      return { ok: true, message: 'Validierung erfolgreich.' };
    }
    return { ok: true, message: 'Verbindung erfolgreich.' };
  },

  sendTestEmail: async (target: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 1000));
    console.log(`[API] Sending Test Mail to ${target}...`);
  },

  // --- Users / Owners ---
  getOwners: async (): Promise<Owner[]> => {
    return mockFetch(() => {
      const data = localStorage.getItem(STORAGE_KEYS.OWNERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(INITIAL_OWNERS));
        return INITIAL_OWNERS;
      }
      return JSON.parse(data);
    });
  },

  addOwner: async (ownerData: Omit<Owner, 'id' | 'avatar' | 'status' | 'inviteToken' | 'tokenExpiresAt'>): Promise<Owner> => {
    const owners = await api.getOwners();
    const initials = ownerData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const newOwner: Owner = {
      ...ownerData,
      id: uuidv4(),
      avatar: initials,
      status: UserStatus.INVITED,
      invitedAt: new Date().toISOString(),
      inviteToken: uuidv4().replace(/-/g, ''),
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    owners.push(newOwner);
    localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(owners));
    return newOwner;
  },

  resendInvitation: async (userId: string): Promise<void> => {
    const owners = await api.getOwners();
    const owner = owners.find(o => o.id === userId);
    if (!owner) throw new Error('User not found');
    owner.invitedAt = new Date().toISOString();
    owner.inviteError = undefined;
    localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(owners));
  },

  // --- Leads ---
  getLeads: async (): Promise<Lead[]> => {
    return mockFetch(() => {
      const data = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (!data) return [];
      const leads: Lead[] = JSON.parse(data);
      return leads.map(l => ({ ...l, files: l.files || [] }));
    });
  },

  saveLeads: async (leads: Lead[]): Promise<void> => {
    return mockFetch(() => {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    });
  },

  updateLead: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    const leads = await api.getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');
    leads[index] = { ...leads[index], ...updates, updatedAt: new Date().toISOString() };
    await api.saveLeads(leads);
    return leads[index];
  },

  createLead: async (leadData: Partial<Lead>): Promise<Lead> => {
    const leads = await api.getLeads();
    const newLead: Lead = {
      id: uuidv4(),
      firstName: leadData.firstName || '',
      lastName: leadData.lastName || '',
      currentPosition: leadData.currentPosition || '',
      company: leadData.company || '',
      linkedinUrl: leadData.linkedinUrl || '',
      ownerName: leadData.ownerName || 'Unassigned',
      pipelineStage: leadData.pipelineStage || PipelineStage.IDENTIFIED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      files: []
    };
    leads.push(newLead);
    await api.saveLeads(leads);
    return newLead;
  },

  // --- Settings ---
  getSettings: async (): Promise<UserSettings> => {
    return mockFetch(() => {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    });
  },

  updateSettings: async (updates: Partial<UserSettings>): Promise<UserSettings> => {
    return mockFetch(() => {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(INITIAL_SETTINGS));
      const updated = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    });
  },

  // --- Tasks & Todos ---
  getTasks: async (): Promise<Task[]> => {
    return mockFetch(() => {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    });
  },

  assignTask: async (ownerId: string, senderName: string, text: string, deadline?: string): Promise<Task> => {
    const tasks = await api.getTasks();
    const newTask: Task = { id: uuidv4(), ownerId, senderName, text, deadline, createdAt: new Date().toISOString(), isRead: false };
    tasks.push(newTask);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return newTask;
  },

  getTodos: async (): Promise<Todo[]> => {
    return mockFetch(() => {
      const data = localStorage.getItem(STORAGE_KEYS.TODOS);
      return data ? JSON.parse(data) : [];
    });
  },

  addTodo: async (todo: Omit<Todo, 'id' | 'createdAt' | 'isCompleted'>): Promise<Todo> => {
    const todos = await api.getTodos();
    const newTodo: Todo = { ...todo, id: uuidv4(), createdAt: new Date().toISOString(), isCompleted: false };
    todos.push(newTodo);
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    return newTodo;
  },

  toggleTodo: async (id: string): Promise<Todo[]> => {
    const todos = await api.getTodos();
    const updated = todos.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t);
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(updated));
    return updated;
  },

  deleteTodo: async (id: string): Promise<Todo[]> => {
    const todos = await api.getTodos();
    const updated = todos.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(updated));
    return updated;
  },

  // --- Projects & Deals ---
  getProjects: async (): Promise<Project[]> => {
    return mockFetch(() => {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    });
  },

  createProject: async (projectData: Omit<Project, 'id' | 'createdAt'>, leadIds: string[]): Promise<Project> => {
    const projects = await api.getProjects();
    const newProject: Project = { ...projectData, id: uuidv4(), createdAt: new Date().toISOString() };
    projects.push(newProject);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    const leads = await api.getLeads();
    const updatedLeads = leads.map(l => leadIds.includes(l.id) ? { ...l, projectId: newProject.id, updatedAt: new Date().toISOString() } : l);
    await api.saveLeads(updatedLeads);
    return newProject;
  },

  getDeals: async (): Promise<Deal[]> => {
    return mockFetch(() => {
      const data = localStorage.getItem(STORAGE_KEYS.DEALS);
      return data ? JSON.parse(data) : [];
    });
  },

  saveDeal: async (dealData: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal> => {
    const deals = await api.getDeals();
    const newDeal: Deal = { ...dealData, id: uuidv4(), createdAt: new Date().toISOString() };
    deals.push(newDeal);
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
    return newDeal;
  },

  // --- AI Enrichment & Search ---
  enrichLinkedIn: async (url: string): Promise<EnrichmentData> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Enrich lead data from this LinkedIn URL: "${url}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              firstName: { type: Type.STRING },
              lastName: { type: Type.STRING },
              currentPosition: { type: Type.STRING },
              company: { type: Type.STRING },
            },
            required: ["firstName", "lastName", "currentPosition"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error('LinkedIn Enrichment failed:', error);
      return { firstName: 'Imported', lastName: 'Lead', currentPosition: 'LinkedIn Member' };
    }
  },

  searchSocialMedia: async (firstName: string, lastName: string): Promise<Partial<Lead>> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Search social media profiles for ${firstName} ${lastName}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              facebookUrl: { type: Type.STRING },
              instagramUrl: { type: Type.STRING },
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      return {};
    }
  },

  addComment: async (leadId: string, author: string, text: string): Promise<Comment> => {
    const leads = await api.getLeads();
    const leadIndex = leads.findIndex(l => l.id === leadId);
    if (leadIndex === -1) throw new Error('Lead not found');
    const newComment: Comment = { id: uuidv4(), leadId, author, text, createdAt: new Date().toISOString() };
    leads[leadIndex].comments.push(newComment);
    await api.saveLeads(leads);
    return newComment;
  },

  addFile: async (leadId: string, file: Omit<LeadFile, 'id' | 'uploadedAt'>): Promise<LeadFile> => {
    const leads = await api.getLeads();
    const leadIndex = leads.findIndex(l => l.id === leadId);
    if (leadIndex === -1) throw new Error('Lead not found');
    const newFile: LeadFile = { ...file, id: uuidv4(), uploadedAt: new Date().toISOString() };
    if (!leads[leadIndex].files) leads[leadIndex].files = [];
    leads[leadIndex].files.push(newFile);
    await api.saveLeads(leads);
    return newFile;
  }
};
