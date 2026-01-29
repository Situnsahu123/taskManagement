import Task from "../models/task.modal.js";
import User from "../models/user.modal.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const user = await User.findById(req.user.id).select("name");
    if (!title) return res.status(400).json({ message: "Title is required" });

    const task = await Task.create({
      name: user.name,
      title,
      description,
      status,
      dueDate,
      userId: req.user._id, // assign logged-in user
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    let filter = {};

    // 🔐 Role-based filter
    if (req.user.role !== "ADMIN") {
      filter.userId = req.user._id;
    }

    // 🎯 Status filter from frontend
    if (req.query.status) {
      filter.status = req.query.status; // Pending | In Progress | Completed
    }

    // 📄 Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const totalTasks = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      tasks,
      currentPage: page,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTask = async (req, res) => {
   try {
     let filter = {};

     // 🔐 Admin can view any user's tasks
     if (req.user.role === "ADMIN") {
       filter.userId = req.params.userId;
     } else {
       // 🔒 Normal user can only see own tasks
       filter.userId = req.user._id;
     }

     // 📄 Pagination
     const page = Number(req.query.page) || 1;
     const limit = Number(req.query.limit) || 4;
     const skip = (page - 1) * limit;

     const totalTasks = await Task.countDocuments(filter);

     const tasks = await Task.find(filter)
       .sort({ createdAt: -1 })
       .skip(skip)
       .limit(limit);

     res.status(200).json({
       success: true,
       tasks,
       currentPage: page,
       totalTasks,
       totalPages: Math.ceil(totalTasks / limit),
     });
   } catch (error) {
     res.status(500).json({ message: error.message });
   }
};


export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (
      req.user.role !== "ADMIN" &&
      task.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, description, status, dueDate } = req.body;

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.dueDate = dueDate || task.dueDate;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (
      req.user.role !== "ADMIN" &&
      task.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskByname = async (req, res) => {
  try {
    const { name } = req.body;
    const { sortBy } = req.query; // 👈 NEW

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const query = name ? { name: { $regex: `^${name}`, $options: "i" } } : {};

    // 🔹 SORT LOGIC
    let sortQuery = { createdAt: -1 }; // default

    if (sortBy === "pending") {
      sortQuery = { status: 1 }; // Pending first
    }

    if (sortBy === "az") {
      sortQuery = { title: 1 }; // A → Z
    }

    if (sortBy === "za") {
      sortQuery = { title: -1 }; // Z → A
    }

    const totalTasks = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};


export const getStatusUSer = async (req, res) => {
  try {
    // 🔐 Only logged-in user's tasks
    const userId = req.user._id;

    const stats = await Task.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Default response
    const result = {
      pending: 0,
      inProgress: 0,
      completed: 0
    };

    // Map DB result → response
    stats.forEach(item => {
      if (item._id === 'Pending') result.pending = item.count;
      if (item._id === 'In Progress') result.inProgress = item.count;
      if (item._id === 'Completed') result.completed = item.count;
    });

    res.status(200).json({
      success: true,
      stats: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




