import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusColor = { active: '#22d3a4', completed: '#6c63ff', 'on-hold': '#f59e0b' };

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', deadline: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditProject(null);
    setForm({ name: '', description: '', deadline: '' });
    setShowModal(true);
  };

  const openEdit = (e, p) => {
    e.stopPropagation();
    setEditProject(p);
    setForm({ name: p.name, description: p.description, deadline: p.deadline ? p.deadline.substring(0, 10) : '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      if (editProject) {
        const { data } = await api.put(`/projects/${editProject._id}`, form);
        setProjects(p => p.map(x => x._id === data._id ? data : x));
        toast.success('Project updated!');
      } else {
        const { data } = await api.post('/projects', form);
        setProjects(p => [data, ...p]);
        toast.success('Project created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project? All tasks will also be deleted.')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(p => p.filter(x => x._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p style={{ color: '#5a5a8a', fontSize: 14, marginTop: 4 }}>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={openCreate}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16m8-8H4"/></svg>
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 160, background: '#14142a', borderRadius: 18, border: '1.5px solid #2a2a4a', animation: 'pulse 1.5s infinite' }} />)}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state" style={{ background: '#14142a', border: '1.5px solid #2a2a4a', borderRadius: 18, padding: 60 }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📁</p>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#e8e8f5', marginBottom: 8 }}>No projects yet</p>
          <p style={{ color: '#5a5a8a' }}>{user?.role === 'admin' ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'}</p>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 20 }}>Create Project</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {projects.map(p => (
            <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}>
              {/* Status dot */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[p.status] }} />
                  <span style={{ fontSize: 11, color: statusColor[p.status], textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontFamily: 'Syne' }}>{p.status}</span>
                </div>
                {user?.role === 'admin' && p.createdBy._id === user._id && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={e => openEdit(e, p)} style={{ background: 'transparent', color: '#9090b8', padding: '4px 6px', borderRadius: 6, fontSize: 12 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                      onMouseLeave={e => e.currentTarget.style.color = '#9090b8'}>✏️</button>
                    <button onClick={e => handleDelete(e, p._id)} style={{ background: 'transparent', color: '#9090b8', padding: '4px 6px', borderRadius: 6, fontSize: 12 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ff6b8a'}
                      onMouseLeave={e => e.currentTarget.style.color = '#9090b8'}>🗑️</button>
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: '#e8e8f5' }}>{p.name}</h3>
              {p.description && <p style={{ fontSize: 13, color: '#9090b8', marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {p.members.slice(0, 4).map((m, i) => (
                    <div key={m.user._id} style={{ width: 26, height: 26, borderRadius: '50%', background: `hsl(${(i * 60 + 200) % 360}, 60%, 45%)`, border: '2px solid #14142a', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', zIndex: 4 - i }}>
                      {m.user.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {p.members.length > 4 && <span style={{ fontSize: 11, color: '#5a5a8a', marginLeft: 6 }}>+{p.members.length - 4}</span>}
                </div>
                {p.deadline && (
                  <span style={{ fontSize: 11, color: '#5a5a8a' }}>Due {format(new Date(p.deadline), 'MMM d, yyyy')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editProject ? 'Edit Project' : 'Create New Project'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input placeholder="e.g., Website Redesign" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea placeholder="What is this project about?" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editProject ? 'Save Changes' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
