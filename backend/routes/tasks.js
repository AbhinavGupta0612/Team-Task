const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper: check project access
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isMember = project.members.some(m => m.user.toString() === userId.toString());
  const isCreator = project.createdBy.toString() === userId.toString();
  return (isMember || isCreator) ? project : null;
};

// @GET /api/tasks/project/:projectId - Get tasks for a project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const project = await checkProjectAccess(req.params.projectId, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied' });

    const { status, priority, assignedTo } = req.query;
    const filter = { project: req.params.projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Members see only their tasks
    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/tasks/my - Get current user's tasks across all projects
router.get('/my', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/tasks/dashboard - Get dashboard stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    let taskFilter = {};
    if (req.user.role !== 'admin') {
      taskFilter.assignedTo = req.user._id;
    }

    const allTasks = await Task.find(taskFilter);
    const now = new Date();

    const stats = {
      total: allTasks.length,
      todo: allTasks.filter(t => t.status === 'todo').length,
      inProgress: allTasks.filter(t => t.status === 'in-progress').length,
      done: allTasks.filter(t => t.status === 'done').length,
      overdue: allTasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'done').length,
    };

    // Recent tasks
    const recentTasks = await Task.find(taskFilter)
      .populate('project', 'name')
      .populate('assignedTo', 'name')
      .sort('-createdAt')
      .limit(5);

    res.json({ stats, recentTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/tasks - Create task (admin only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create tasks' });
    }

    const { title, description, status, priority, dueDate, project, assignedTo, tags } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    const projectAccess = await checkProjectAccess(project, req.user._id);
    if (!projectAccess) return res.status(403).json({ message: 'Access denied to this project' });

    const task = await Task.create({
      title, description, status, priority, dueDate,
      project, assignedTo, tags,
      createdBy: req.user._id
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/tasks/:id - Update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const projectAccess = await checkProjectAccess(task.project, req.user._id);
    if (!projectAccess) return res.status(403).json({ message: 'Access denied' });

    // Members can only update status of their own tasks
    if (req.user.role !== 'admin') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update your own tasks' });
      }
      task.status = req.body.status || task.status;
    } else {
      const { title, description, status, priority, dueDate, assignedTo, tags } = req.body;
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.status = status || task.status;
      task.priority = priority || task.priority;
      task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
      task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
      task.tags = tags || task.tags;
    }

    await task.save();

    const updated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @DELETE /api/tasks/:id - Delete task (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
