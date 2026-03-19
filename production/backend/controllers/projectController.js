const { v4: uuid } = require('uuid');

// In-memory store
const memProjects = new Map();

// Seed sample projects
const seedProjects = [
  {
    _id: 'proj-001', id: 'proj-001',
    title: 'Sudharshan AI Platform v3', description: 'Next-gen AI enterprise workspace with real-time collaboration',
    status: 'active', color: '#5b8dee', icon: '🚀',
    owner: 'demo-admin-001', members: ['demo-admin-001'],
    progress: 68, tags: ['ai', 'platform'],
    tasks: [
      { _id: 't1', id: 't1', title: 'Design system overhaul', status: 'done', priority: 'high', order: 0 },
      { _id: 't2', id: 't2', title: 'Streaming chat refactor', status: 'in-progress', priority: 'critical', order: 1 },
      { _id: 't3', id: 't3', title: 'Analytics dashboard', status: 'review', priority: 'high', order: 2 },
      { _id: 't4', id: 't4', title: 'Team collaboration module', status: 'todo', priority: 'medium', order: 3 },
      { _id: 't5', id: 't5', title: 'Mobile responsive layout', status: 'backlog', priority: 'low', order: 4 },
    ],
    createdAt: new Date('2024-02-01'), updatedAt: new Date(),
  },
  {
    _id: 'proj-002', id: 'proj-002',
    title: 'API Gateway Service', description: 'Unified API gateway with rate limiting and auth',
    status: 'active', color: '#3ecf8e', icon: '⚡',
    owner: 'demo-admin-001', members: ['demo-admin-001'],
    progress: 45, tags: ['backend', 'infrastructure'],
    tasks: [
      { _id: 't6', id: 't6', title: 'Rate limiting middleware', status: 'done', priority: 'high', order: 0 },
      { _id: 't7', id: 't7', title: 'JWT validation service', status: 'in-progress', priority: 'critical', order: 1 },
      { _id: 't8', id: 't8', title: 'Load balancer config', status: 'todo', priority: 'medium', order: 2 },
    ],
    createdAt: new Date('2024-03-10'), updatedAt: new Date(),
  },
  {
    _id: 'proj-003', id: 'proj-003',
    title: 'Marketing Website', description: 'Landing page and blog for Sudharshan AI launch',
    status: 'paused', color: '#f5a623', icon: '🌐',
    owner: 'demo-admin-001', members: ['demo-admin-001'],
    progress: 30, tags: ['frontend', 'marketing'],
    tasks: [
      { _id: 't9', id: 't9', title: 'Homepage design', status: 'review', priority: 'high', order: 0 },
      { _id: 't10', id: 't10', title: 'Blog CMS setup', status: 'backlog', priority: 'low', order: 1 },
    ],
    createdAt: new Date('2024-04-05'), updatedAt: new Date(),
  },
];
seedProjects.forEach(p => memProjects.set(p._id, p));

let Project;
try { Project = require('../models/Project'); } catch {}

function getUserProjects(userId) {
  return [...memProjects.values()].filter(p => p.owner === userId || (p.members || []).includes(userId));
}

exports.getProjects = async (req, res) => {
  try {
    if (Project) {
      const projects = await Project.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] })
        .populate('owner', 'name email avatar').populate('members', 'name email avatar').populate('tasks.assignee', 'name');
      return res.json(projects);
    }
    const projects = getUserProjects(req.user.id);
    res.json(projects);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getProject = async (req, res) => {
  try {
    if (Project) {
      const project = await Project.findById(req.params.id).populate('owner members tasks.assignee');
      if (!project) return res.status(404).json({ error: 'Not found' });
      return res.json(project);
    }
    const p = memProjects.get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, color = '#5b8dee', icon = '📁', tags = [] } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    if (Project) {
      const p = await Project.create({ title, description, color, icon, tags, owner: req.user.id, members: [req.user.id] });
      return res.status(201).json(p);
    }
    const p = { _id: uuid(), id: uuid(), title, description, color, icon, tags, status: 'active', progress: 0, owner: req.user.id, members: [req.user.id], tasks: [], createdAt: new Date(), updatedAt: new Date() };
    memProjects.set(p._id, p);
    res.status(201).json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateProject = async (req, res) => {
  try {
    if (Project) {
      const p = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json(p);
    }
    const p = memProjects.get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    Object.assign(p, req.body, { updatedAt: new Date() });
    memProjects.set(p._id, p);
    res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteProject = async (req, res) => {
  try {
    if (Project) { await Project.findByIdAndDelete(req.params.id); return res.json({ ok: true }); }
    memProjects.delete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status = 'todo', priority = 'medium', dueDate, labels } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    if (Project) {
      const p = await Project.findById(req.params.id);
      p.tasks.push({ title, description, status, priority, dueDate, labels });
      await p.save();
      return res.status(201).json(p.tasks[p.tasks.length - 1]);
    }
    const p = memProjects.get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    const task = { _id: uuid(), id: uuid(), title, description, status, priority, labels: labels || [], order: p.tasks.length, createdAt: new Date() };
    p.tasks.push(task);
    p.progress = Math.round((p.tasks.filter(t => t.status === 'done').length / p.tasks.length) * 100);
    memProjects.set(p._id, p);
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateTask = async (req, res) => {
  try {
    if (Project) {
      const p = await Project.findById(req.params.id);
      const task = p.tasks.id(req.params.taskId);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      Object.assign(task, req.body);
      p.progress = Math.round((p.tasks.filter(t => t.status === 'done').length / p.tasks.length) * 100);
      await p.save();
      return res.json(task);
    }
    const p = memProjects.get(req.params.id);
    const task = p?.tasks.find(t => t._id === req.params.taskId || t.id === req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    Object.assign(task, req.body);
    p.progress = Math.round((p.tasks.filter(t => t.status === 'done').length / p.tasks.length) * 100);
    memProjects.set(p._id, p);
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteTask = async (req, res) => {
  try {
    if (Project) {
      const p = await Project.findById(req.params.id);
      p.tasks.pull(req.params.taskId);
      await p.save();
      return res.json({ ok: true });
    }
    const p = memProjects.get(req.params.id);
    p.tasks = p.tasks.filter(t => t._id !== req.params.taskId && t.id !== req.params.taskId);
    p.progress = p.tasks.length ? Math.round((p.tasks.filter(t => t.status === 'done').length / p.tasks.length) * 100) : 0;
    memProjects.set(p._id, p);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
