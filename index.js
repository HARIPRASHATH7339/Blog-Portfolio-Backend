
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const verifyAdmin = require('./authMiddleware');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/blogDB')
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection failed:', err.message));

// Blog schema
const blogSchema = new mongoose.Schema({
    newTitle: { type: String, required: true },
    newContent: { type: String, required: true },
    date: String,
    likes: { type: Number, default: 0 }
});

const Blog = mongoose.model('Blog', blogSchema);

// GET: Anyone can view blogs
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find({});
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH: Anyone can like a blog
app.patch('/api/blogs/like/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true, runValidators: true }
        );

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json(blog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST: Admin only - create a blog
app.post('/api/blogs', verifyAdmin, async (req, res) => {
    try {
        const blog = new Blog({
            newTitle: req.body.newTitle,
            newContent: req.body.newContent,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            likes: 0
        });

        const newBlog = await blog.save();
        res.status(201).json(newBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT: Admin only - edit a blog
app.put('/api/blogs/:id', verifyAdmin, async (req, res) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                newTitle: req.body.newTitle,
                newContent: req.body.newContent
            },
            { new: true, runValidators: true }
        );

        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json(updatedBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE: Admin only - delete a blog
app.delete('/api/blogs/:id', verifyAdmin, async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

        if (!deletedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
