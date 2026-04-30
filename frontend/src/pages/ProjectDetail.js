import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format, isAfter } from 'date-fns';

const STATUS_COLS = [
  { key: 'todo', label: 'To Do', color: '#5a5a8a' },
  { key: 'in-progress', label: 'In Progress', color: '#38bdf8' },
  { key: 'done', label: 'Done', color: '#22d3a4' },
];
const PRIORITIES = ['low', 'medium', 'high'];
const priorityColor = { low: '#22d3a4', medium: '#f59e0b', high: '#ff6b8a' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '', tags: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    if (user?.role === 'admin') api.get('/users').then(r => setUsers(r.data)).catch(() => {});
  }, [id]);

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  };

  const openCreateTask = () => {
    setEditTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '', tags: '' });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setTaskForm({
      title: task.title, description: task.description, priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
      assignedTo: task.assignedTo?._id || '', tags: task.tags?.join(', ') || ''
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Task title is required');
    setSaving(true);
    try {
      const payload = { ...taskForm, project: id, tags: taskForm.tags ? taskForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;

      if (editTask) {
        const { data } = await api.put(`/tasks/${editTask._id}`, payload);
        setTasks(t => t.map(x => x._id === data._id ? data : x));
        toast.success('Task updated!');
      } else {
        const { data } = await api.post('/tasks', payload);
        setTasks(t => [data, ...t]);
        toast.success('Task created!');
      }
      setShowTaskModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(t => t.map(x => x._id === data._id ? data : x));
      toast.success('Status updated!');
    } catch { toast.error('Failed to update status'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(t => t.filter(x => x._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleAddMember = async (userId) => {
    try {
      const { data } = await api.post(`/projects/${id}/members`, { userId });
      setProject(data);
      toast.success('Member added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      setProject(p => ({ ...p, members: p.members.filter(m => m.user._id !== userId) }));
      toast.success('Member removed');
    } catch { toast.error('Failed to remove member'); }
  };

  if (loading) return <div className="page-container"><p style={{ color: '#5a5a8a' }}>Loading...</p></div>;
  if (!project) return null;

  const memberIds = project.members.map(m => m.user._id);
  const nonMembers = users.filter(u => !memberIds.includes(u._id));
  const isOwner = project.createdBy._id === user._id;

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => navigate('/projects')} style={{ background: 'transparent', color: '#5a5a8a', fontSize: 13, marginBottom: 12, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back to Projects
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 28, color: '#e8e8f5', marginBottom: 4 }}>{project.name}</h1>
            {project.description && <p style={{ color: '#5a5a8a', fontSize: 14 }}>{project.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {isOwner && (
              <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)} style={{ fontSize: 13 }}>
                👥 Manage Members
              </button>
            )}
            {user?.role === 'admin' && (
              <button className="btn btn-primary" onClick={openCreateTask}>
                + Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#14142a', border: '1.5px solid #2a2a4a', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {['board', 'list'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '6px 16px', borderRadius: 9, background: activeTab === tab ? '#6c63ff' : 'transparent', color: activeTab === tab ? 'white' : '#5a5a8a', fontWeight: 500, fontSize: 13, transition: 'all 0.2s', textTransform: 'capitalize' }}>
            {tab === 'board' ? '🗃️ Board' : '📋 List'}
          </button>
        ))}
      </div>

      {/* Board View */}
      {activeTab === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, minHeight: 300 }}>
          {STATUS_COLS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} style={{ background: '#0d0d1e', border: '1.5px solid #1a1a35', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Syne', color: '#9090b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col.label}</span>
                  <span style={{ marginLeft: 'auto', background: '#1a1a35', color: '#5a5a8a', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{colTasks.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {colTasks.map(task => {
                    const overdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.status !== 'done';
                    return (
                      <div key={task._id} style={{ background: '#14142a', border: `1.5px solid ${overdue ? '#ff6b8a33' : '#2a2a4a'}`, borderRadius: 12, padding: 14, transition: 'border-color 0.2s' }}
                        onMouseEnter={e => !overdue && (e.currentTarget.style.borderColor = '#3a3a5a')}
                        onMouseLeave={e => !overdue && (e.currentTarget.style.borderColor = '#2a2a4a')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#e8e8f5', flex: 1 }}>{task.title}</p>
                          {user?.role === 'admin' && (
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <button onClick={() => openEditTask(task)} style={{ background: 'transparent', color: '#5a5a8a', fontSize: 11, padding: '2px 4px' }}>✏️</button>
                              <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'transparent', color: '#5a5a8a', fontSize: 11, padding: '2px 4px' }}>🗑️</button>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, color: priorityColor[task.priority], background: `${priorityColor[task.priority]}15`, border: `1px solid ${priorityColor[task.priority]}30`, padding: '2px 6px', borderRadius: 10, fontWeight: 600, textTransform: 'uppercase' }}>{task.priority}</span>
                          {task.assignedTo && (
                            <span style={{ fontSize: 10, color: '#9090b8', background: '#1a1a35', padding: '2px 6px', borderRadius: 10 }}>👤 {task.assignedTo.name}</span>
                          )}
                          {task.dueDate && (
                            <span style={{ fontSize: 10, color: overdue ? '#ff6b8a' : '#5a5a8a' }}>{overdue ? '⚠️ ' : ''}{format(new Date(task.dueDate), 'MMM d')}</span>
                          )}
                        </div>
                        {/* Status changer for members */}
                        {(user?.role === 'admin' || task.assignedTo?._id === user?._id) && (
                          <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                            style={{ marginTop: 10, fontSize: 11, padding: '4px 8px', borderRadius: 8, background: '#0d0d1e', border: '1px solid #2a2a4a', color: '#9090b8', width: '100%' }}>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <p style={{ fontSize: 12, color: '#3a3a5a', textAlign: 'center', padding: '20px 0' }}>No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.length === 0 ? (
            <div className="empty-state" style={{ background: '#14142a', border: '1.5px solid #2a2a4a', borderRadius: 16, padding: 40 }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
              <p style={{ color: '#5a5a8a' }}>No tasks yet. {user?.role === 'admin' ? 'Create your first task!' : ''}</p>
            </div>
          ) : tasks.map(task => {
            const overdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.status !== 'done';
            return (
              <div key={task._id} style={{ background: '#14142a', border: `1.5px solid ${overdue ? '#ff6b8a33' : '#2a2a4a'}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                  style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, background: '#0d0d1e', border: '1px solid #2a2a4a', color: '#9090b8', width: 120 }}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#e8e8f5', marginBottom: 2 }}>{task.title}</p>
                  {task.description && <p style={{ fontSize: 12, color: '#5a5a8a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: priorityColor[task.priority], background: `${priorityColor[task.priority]}15`, border: `1px solid ${priorityColor[task.priority]}30`, padding: '2px 8px', borderRadius: 10, fontWeight: 600, textTransform: 'uppercase' }}>{task.priority}</span>
                  {task.assignedTo && <span style={{ fontSize: 12, color: '#9090b8' }}>👤 {task.assignedTo.name}</span>}
                  {task.dueDate && <span style={{ fontSize: 12, color: overdue ? '#ff6b8a' : '#5a5a8a' }}>{format(new Date(task.dueDate), 'MMM d')}</span>}
                  {user?.role === 'admin' && (
                    <>
                      <button onClick={() => openEditTask(task)} style={{ background: 'transparent', color: '#5a5a8a', padding: '4px 6px' }}>✏️</button>
                      <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'transparent', color: '#5a5a8a', padding: '4px 6px' }}>🗑️</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Members section */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Team Members</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {project.members.map(m => (
            <div key={m.user._id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#14142a', border: '1.5px solid #2a2a4a', borderRadius: 10, padding: '8px 12px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #22d3a4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                {m.user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#e8e8f5' }}>{m.user.name}</p>
                <p style={{ fontSize: 11, color: '#5a5a8a', textTransform: 'capitalize' }}>{m.role}</p>
              </div>
              {isOwner && m.user._id !== user._id && (
                <button onClick={() => handleRemoveMember(m.user._id)} style={{ background: 'transparent', color: '#5a5a8a', marginLeft: 4, fontSize: 12, padding: '2px 4px' }}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editTask ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input placeholder="e.g., Design landing page" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea placeholder="Task details..." rows={3} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input placeholder="e.g., frontend, urgent, bug" value={taskForm.tags} onChange={e => setTaskForm({ ...taskForm, tags: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Manage Team Members</h2>
            <p style={{ fontSize: 13, color: '#5a5a8a', marginBottom: 16 }}>Add users to this project</p>
            {nonMembers.length === 0 ? (
              <p style={{ color: '#5a5a8a', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>All users are already members</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {nonMembers.map(u => (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0d0d1e', border: '1px solid #1a1a35', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #22d3a4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</p>
                      <p style={{ fontSize: 11, color: '#5a5a8a' }}>{u.email} · {u.role}</p>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => handleAddMember(u._id)}>Add</button>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
