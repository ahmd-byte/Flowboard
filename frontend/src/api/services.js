import api from './axios';

// Board API
export const boardApi = {
  getAll: () => api.get('/boards'),
  getById: (id) => api.get(`/boards/${id}`),
  getFull: (id) => api.get(`/boards/${id}/full`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
};

// List API
export const listApi = {
  getByBoard: (boardId) => api.get(`/lists/board/${boardId}`),
  create: (data) => api.post('/lists', data),
  update: (id, data) => api.put(`/lists/${id}`, data),
  updatePosition: (id, position) => api.put(`/lists/${id}/position?new_position=${position}`),
  delete: (id) => api.delete(`/lists/${id}`),
};

// Card API
export const cardApi = {
  getByList: (listId) => api.get(`/cards/list/${listId}`),
  getById: (id) => api.get(`/cards/${id}`),
  create: (data) => api.post('/cards', data),
  update: (id, data) => api.put(`/cards/${id}`, data),
  move: (id, data) => api.put(`/cards/${id}/move`, data),
  delete: (id) => api.delete(`/cards/${id}`),
};

// Comment API
export const commentApi = {
  getByCard: (cardId) => api.get(`/comments/card/${cardId}`),
  create: (data) => api.post('/comments', data),
  delete: (id) => api.delete(`/comments/${id}`),
};

// Auth API
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  me: () => api.get('/auth/me'),
};

export default {
  board: boardApi,
  list: listApi,
  card: cardApi,
  comment: commentApi,
  auth: authApi,
};

