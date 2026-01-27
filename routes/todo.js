const express = require('express');

const todoController = require('../controllers/todo');

const router = express.Router();

// GET
router.get('/', todoController.getTodo);

// POST
router.post('/add-todo', todoController.addTodo);

router.post('/delete-todo', todoController.deleteTodo);

router.post('/todo-status', todoController.updateStatus);

module.exports = router;