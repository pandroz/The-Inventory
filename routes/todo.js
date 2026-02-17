const express = require('express');

const todoController = require('../controllers/todo');
const isAuth = require('../middleware/isAuth');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

// GET
router.get('/', isAuth, todoController.getTodo);

// POST
router.post('/add-todo', isAuth, csrfProtection, todoController.addTodo);

router.post('/delete-todo', isAuth, csrfProtection, todoController.deleteTodo);

router.post('/todo-status', isAuth, csrfProtection, todoController.updateStatus);

router.post('/filter-todos', isAuth, csrfProtection, todoController.filterTodos);

module.exports = router;