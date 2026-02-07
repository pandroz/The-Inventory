const Todo = require('../models/todo');
const _ = require('lodash');
const moment = require('moment');

// GET
exports.getTodo = (req, res, next) => {
    Todo.find()
        .sort({ createdAt: -1 })
        .then(todos => {
            res.render('todo/todo', {
                pageTitle: 'To Do List',
                path: '/todo',
                searchType: 'todo',
                todoAmount: todos.length,
                todos: todos,
                categories: _.uniq(todos.map(todo => todo.category)),
                assignees: _.filter(_.uniq(todos.map(todo => todo.assignedTo)), _.identity),
                moment: moment,
                _: _
            });
        }).catch(err => {
            console.log('Error fetching To-Dos', err);
        });
}

exports.addTodo = (req, res, next) => {
    const todo = new Todo({
        description: req.body.description,
        addDescr: req.body.addDescr,
        category: req.body.category,
        priority: req.body.priority,
        assignedTo: req.body.assignedTo,
        completeBy: req.body.completeBy,
        remindMe: req.body.remindMe === 'on',
        reminderDate: req.body.reminderDate,
        recurringPattern: req.body.recurringPattern,
        recurringStartDate: req.body.recurringStartDate,
        recurringEndDate: req.body.recurringEndDate,
        completedOn: null,
        createdAt: new Date()
    });

    todo.save()
        .then(result => {
            console.log('Saved todo', result);
            res.redirect('/todo');
        }).catch(err => {
            res.status(500).json({ message: 'Error saving todo: ' + err });
            console.log('Error saving todo', err);
        });
}


exports.deleteTodo = (req, res, next) => {
    const id = req.body.todoId;
    Todo.deleteOne({
        _id: id
    }).then(result => {
        console.log('Deleted todo', result);
        res.status(200).json({ message: 'Todo deleted successfully' });
    }).catch(err => {
        console.log('Error deleting todo', err);
    });
}


exports.updateStatus = (req, res, next) => {
    const id = req.body.todoId;
    const done = req.body.done;
    Todo.findById({
        _id: id
    }).then(todo => {
        todo.done = done;
        todo.completedOn = done ? new Date() : null;
        return todo.save();
    }).then(result => {
        console.log('Updated todo', result);
        res.status(200).json({
            message: 'Todo updated successfully',
            done: result.done,
            completedOn: moment(result.completedOn).format('L')
        });
    }).catch(err => {
        res.status(500).json({ message: 'Error updating todo: ' + err, todoName: result.name });
        console.log('Error updating todo', err);
    });
}


exports.filterTodos = (req, res, next) => {
    console.log('filter', req.body.filter);
    const filter = req.body.filter;
    Todo.find(filter)
        .then(todos => {
            res.status(200).json({ todos: todos });
        }).catch(err => {
            res.status(500).json({ message: 'Error fetching filtered To-Dos: ' + err });
            console.log('Error fetching filtered To-Dos', err);
        });
}