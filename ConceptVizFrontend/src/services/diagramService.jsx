import api from './api';

export const diagramService = {
  generate: async (topic) => {
    const response = await api.post('/diagram/generate', { topic });
    return response.data;
  },

  save: async (topic, mermaidCode) => {
    const response = await api.post('/diagram/save', { topic, mermaidCode });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/diagram/my-history');
    return response.data;
  },
};