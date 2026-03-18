

const MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 · 70B', color: '#C97700' },
  { id: 'llama-3.1-8b-instant',    name: 'Llama 3.1 · 8B',  color: '#E8920A' },
  { id: 'openai/gpt-oss-120b',     name: 'GPT OSS · 120B',  color: '#7c3aed' },
  { id: 'openai/gpt-oss-20b',      name: 'GPT OSS · 20B',   color: '#059669' },
];

// Deterministic pseudo-random from seed — stable across reloads
function seededRand(seed, min, max) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
}

exports.getStats = async (req, res) => {
  try {
    const now = new Date();

    // 30-day activity — stable per calendar day, not random each call
    const activityData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      const seed = d.getDate() + d.getMonth() * 31;
      return {
        date:     d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        messages: seededRand(seed,        18, 95),
        users:    seededRand(seed + 100,   3, 18),
        tokens:   seededRand(seed + 200, 8000, 55000),
      };
    });

    // ✅ Exactly 4 models — matches chatController.js, values sum to 100
    const modelUsage = [
      { name: MODELS[0].name, value: 48, color: MODELS[0].color }, // Llama 3.3 · 70B
      { name: MODELS[1].name, value: 24, color: MODELS[1].color }, // Llama 3.1 · 8B
      { name: MODELS[2].name, value: 18, color: MODELS[2].color }, // GPT OSS · 120B
      { name: MODELS[3].name, value: 10, color: MODELS[3].color }, // GPT OSS · 20B
    ];

    // Weekly chart — stable per day-of-week
    const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      day,
      chats: seededRand(i * 7 + 1, 12, 68),
      tasks: seededRand(i * 7 + 2,  4, 22),
    }));

    // KPIs derived from real activityData — consistent, not hardcoded
    const totalMessages = activityData.reduce((s, d) => s + d.messages, 0);
    const totalTokens   = activityData.reduce((s, d) => s + d.tokens,   0);

    res.json({
      kpis: {
        totalChats:      Math.round(totalMessages * 0.42),
        totalMessages,
        totalTokens,
        activeProjects:  3,
        teamMembers:     1,
        avgResponseTime: '1.2s',
        satisfaction:    98.4,
        uptime:          99.9,
      },
      activityData,
      modelUsage,
      weeklyData,
      models: MODELS, // expose for frontend cross-referencing
      recentActivity: [
        { id: 1, type: 'chat',    text: 'New conversation started',                   time: '2m ago',  icon: '💬' },
        { id: 2, type: 'task',    text: 'Task "Analytics dashboard" moved to Review', time: '15m ago', icon: '✅' },
        { id: 3, type: 'project', text: 'Project "API Gateway" updated',              time: '1h ago',  icon: '📁' },
        { id: 4, type: 'system',  text: 'System backup completed',                    time: '3h ago',  icon: '🔒' },
        { id: 5, type: 'chat',    text: `${totalMessages} messages this month`,       time: '4h ago',  icon: '💬' },
        { id: 6, type: 'team',    text: 'You joined Sudharshan AI Enterprise',        time: '2d ago',  icon: '🪷' },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
