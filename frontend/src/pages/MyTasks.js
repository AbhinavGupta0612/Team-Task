import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format, isAfter } from 'date-fns';

const priorityColor = { low: '#22d3a4', medium: '#f59e0b', high: '#ff6b8a' };
const statusColor = { 'todo': '#5a5a8a', 'in-progress': '#38bdf8', 'done': '#22d3a4' };
const statusLabel = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks/my');
      setTasks(data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(t => t.map(x => x._id === data._id ? data : x));
      toast.success('Status updated!');
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return t.dueDate && isAfter(new Date(), new Date(t.dueDate)) && t.status !== 'done';
    return t.status === filter;
  });

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.dueDate && isAfter(new Date(), new Date(t.dueDate)) && t.status !== 'done').length,
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>My Tasks</h1>
        <p style={{ color: '#5a5a8a', fontSize: 14 }}>All tasks assigned to you across projects</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'todo', label: 'To Do' },
          { key: 'in-progress', label: 'In Progress' },
          { key: 'done', label: 'Done' },
          { key: 'overdue', label: '⚠️ Overdue' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              padding: '7px 16px', borderRadius: 10,
              background: filter === f.key ? '#6c63ff' : '#14142a',
              color: filter === f.key ? 'white' : '#5a5a8a',
              border: `1.5px solid ${filter === f.key ? '#6c63ff' : '#2a2a4a'}`,
              fontWeight: 500, fontSize: 13, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
            {f.label}
            <span style={{ background: filter === f.key ? 'rgba(255,255,255,0.2)' : '#1a1a35', padding: '1px 6px', borderRadius: 10, fontSize: 11 }}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 72, background: '#14142a', borderRadius: 12, border: '1.5px solid #2a2a4a', animation: 'pulse 1.5s infinite' }} />)}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ background: '#14142a', border: '1.5px solid #2a2a4a', borderRadius: 18, padding: 60 }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>{filter === 'done' ? '🎉' : filter === 'overdue' ? '✨' : '📋'}</p>
          <p style={{ color: '#e8e8f5', fontWeight: 500, marginBottom: 6 }}>
            {filter === 'overdue' ? 'No overdue tasks!' : filter === 'done' ? 'No completed tasks yet' : 'No tasks here'}
          </p>
          <p style={{ color: '#5a5a8a', fontSize: 13 }}>
            {filter === 'all' ? 'Tasks assigned to you will appear here' : `No ${filter} tasks`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(task => {
            const overdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.status !== 'done';
            return (
              <div key={task._id} style={{ background: '#14142a', border: `1.5px solid ${overdue ? '#ff6b8a33' : '#2a2a4a'}`, borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap', transition: 'border-color 0.2s' }}
                onMouseEnter={e => !overdue && (e.currentTarget.style.borderColor = '#3a3a5a')}
                onMouseLeave={e => !overdue && (e.currentTarget.style.borderColor = '#2a2a4a')}>

                {/* Status indicator */}
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: statusColor[task.status], boxShadow: `0 0 6px ${statusColor[task.status]}` }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 6 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#e8e8f5' }}>{task.title}</p>
                    <span style={{ fontSize: 10, color: priorityColor[task.priority], background: `${priorityColor[task.priority]}15`, border: `1px solid ${priorityColor[task.priority]}30`, padding: '2px 7px', borderRadius: 10, fontWeight: 600, textTransform: 'uppercase', flexShrink: 0 }}>{task.priority}</span>
                  </div>
                  {task.description && <p style={{ fontSize: 13, color: '#5a5a8a', marginBottom: 8 }}>{task.description}</p>}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    {task.project && (
                      <Link to={`/projects/${task.project._id}`} style={{ fontSize: 12, color: '#6c63ff', fontWeight: 500 }}>📁 {task.project.name}</Link>
                    )}
                    {task.dueDate && (
                      <span style={{ fontSize: 12, color: overdue ? '#ff6b8a' : '#5a5a8a' }}>
                        {overdue ? '⚠️ Overdue · ' : '📅 '}{format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                    {task.tags?.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Status changer */}
                <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                  style={{ fontSize: 12, padding: '6px 10px', borderRadius: 9, background: '#0d0d1e', border: '1.5px solid #2a2a4a', color: statusColor[task.status], fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
