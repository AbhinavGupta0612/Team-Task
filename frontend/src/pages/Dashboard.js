import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format, isAfter } from 'date-fns';

const statusColors = { 'todo': '#5a5a8a', 'in-progress': '#38bdf8', 'done': '#22d3a4' };
const priorityColors = { low: '#22d3a4', medium: '#f59e0b', high: '#ff6b8a' };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-container">
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: '1 1 200px', height: 100, background: '#14142a', borderRadius: 18, border: '1.5px solid #2a2a4a', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );

  const stats = data?.stats || {};
  const recentTasks = data?.recentTasks || [];

  const statCards = [
    { label: 'Total Tasks', value: stats.total || 0, color: 'var(--accent)', cls: 'accent', icon: '📋' },
    { label: 'In Progress', value: stats.inProgress || 0, color: '#38bdf8', cls: 'blue', icon: '⚡' },
    { label: 'Completed', value: stats.done || 0, color: '#22d3a4', cls: 'green', icon: '✅' },
    { label: 'Overdue', value: stats.overdue || 0, color: '#ff6b8a', cls: 'red', icon: '⚠️' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, color: '#e8e8f5', marginBottom: 6 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#5a5a8a', fontSize: 15 }}>Here's what's happening with your tasks today</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map(card => (
          <div key={card.label} style={{ background: '#14142a', border: `1.5px solid ${card.color}33`, borderRadius: 18, padding: '20px 24px', boxShadow: `0 0 20px ${card.color}10` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 36, fontFamily: 'Syne', fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 13, color: '#9090b8', marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div style={{ background: '#14142a', border: '1.5px solid #2a2a4a', borderRadius: 18, padding: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16 }}>Overall Progress</h3>
            <span style={{ fontSize: 22, fontFamily: 'Syne', fontWeight: 800, color: '#22d3a4' }}>
              {Math.round((stats.done / stats.total) * 100)}%
            </span>
          </div>
          <div style={{ background: '#1a1a35', borderRadius: 100, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${(stats.done / stats.total) * 100}%`, background: 'linear-gradient(90deg, #6c63ff, #22d3a4)', height: '100%', borderRadius: 100, transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            {[
              { label: 'To Do', count: stats.todo, color: '#5a5a8a' },
              { label: 'In Progress', count: stats.inProgress, color: '#38bdf8' },
              { label: 'Done', count: stats.done, color: '#22d3a4' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                <span style={{ fontSize: 12, color: '#9090b8' }}>{s.label}: <strong style={{ color: '#e8e8f5' }}>{s.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20 }}>Recent Tasks</h2>
          <Link to="/my-tasks" style={{ fontSize: 13, color: '#6c63ff', fontWeight: 500 }}>View all →</Link>
        </div>
        {recentTasks.length === 0 ? (
          <div className="empty-state" style={{ background: '#14142a', border: '1.5px solid #2a2a4a', borderRadius: 18, padding: 40 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🚀</p>
            <p style={{ color: '#5a5a8a' }}>No tasks yet. {user?.role === 'admin' ? 'Create a project and add tasks!' : 'Your assigned tasks will appear here.'}</p>
            {user?.role === 'admin' && (
              <Link to="/projects" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>Go to Projects</Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentTasks.map(task => {
              const overdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.status !== 'done';
              return (
                <div key={task._id} style={{ background: '#14142a', border: `1.5px solid ${overdue ? '#ff6b8a33' : '#2a2a4a'}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColors[task.status], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e8f5', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: '#5a5a8a' }}>{task.project?.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: priorityColors[task.priority], background: `${priorityColors[task.priority]}20`, border: `1px solid ${priorityColors[task.priority]}40`, padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{task.priority}</span>
                    {task.dueDate && <span style={{ fontSize: 11, color: overdue ? '#ff6b8a' : '#5a5a8a' }}>{format(new Date(task.dueDate), 'MMM d')}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
