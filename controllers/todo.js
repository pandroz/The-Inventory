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
                todos: todos,
                moment: moment,
                _: _
            });
        }).catch(err => {
            console.log('Error fetching To-Dos', err);
        });
}

exports.postAddTodo = (req, res, next) => {
    const todo = new Todo({
        description: req.body.description,
        addDescr: req.body.addDescr,
        category: req.body.category,
        completeBy: req.body.completeBy,
        done: false,
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


exports.postDeleteTodo = (req, res, next) => {
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