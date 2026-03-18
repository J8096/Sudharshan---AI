import axios from 'axios';

// In production (Vercel), point to the Render backend URL via env var.
// In development, Vite proxy handles /api → localhost:3001.
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

// Attach JWT token
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('kova_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Handle 401 → logout
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kova_token');
      localStorage.removeItem('kova_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Upload helper — needs full URL for FormData
export const getUploadUrl = () =>
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/upload`
    : '/api/upload';

export const getChatUrl = () =>
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/chat`
    : '/api/chat';

// Auth
export const authApi = {
  login:         (data) => api.post('/auth/login', data),
  register:      (data) => api.post('/auth/register', data),
  me:            ()     => api.get('/auth/me'),
  team:          ()     => api.get('/auth/team'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Chat
export const chatApi = {
  models:        ()           => api.get('/models'),
  sessions:      ()           => api.get('/sessions'),
  session:       (id)         => api.get(`/session/${id}`),
  deleteSession: (id)         => api.delete(`/session/${id}`),
  updateTitle:   (id, title)  => api.put(`/session/${id}/title`, { title }),
  deleteFile:    (fileId, sessionId) => api.delete(`/file/${fileId}`, { data: { sessionId } }),
  health:        ()           => api.get('/health'),
};

// Projects
export const projectApi = {
  list:       ()              => api.get('/projects'),
  get:        (id)            => api.get(`/projects/${id}`),
  create:     (data)          => api.post('/projects', data),
  update:     (id, data)      => api.put(`/projects/${id}`, data),
  delete:     (id)            => api.delete(`/projects/${id}`),
  createTask: (pid, data)     => api.post(`/projects/${pid}/tasks`, data),
  updateTask: (pid, tid, data)=> api.put(`/projects/${pid}/tasks/${tid}`, data),
  deleteTask: (pid, tid)      => api.delete(`/projects/${pid}/tasks/${tid}`),
};

// Analytics
export const analyticsApi = { stats: () => api.get('/analytics') };

// Notifications
export const notifApi = {
  list:       ()   => api.get('/notifications'),
  markRead:   (id) => api.put(`/notifications/${id}/read`),
  markAllRead:()   => api.put('/notifications/read-all'),
  delete:     (id) => api.delete(`/notifications/${id}`),
};

export default api;
