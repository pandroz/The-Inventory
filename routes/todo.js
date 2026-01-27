const express = require('express');

const todoController = require('../controllers/todo');

const router = express.Router();

// GET
router.get('/', todoController.getTodo);

// POST
router.post('/add-todo', todoController.postAddTodo);

router.post('/delete-todo', todoController.postDeleteTodo);

module.exports = router;