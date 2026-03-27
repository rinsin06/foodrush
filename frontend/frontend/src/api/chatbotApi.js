import axiosInstance from './axiosInstance.js';

export const chatbotApi = {
  chat: (payload) => axiosInstance.post('/api/v1/chatbot/chat', payload),
};
