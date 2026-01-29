document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM fully loaded and parsed');

    document.getElementById('todoList').addEventListener('click', (e) => {

        // DELETE ITEM
        if (e.target.classList.contains('deleteTodo')) {
            const button = e.target;
            const todoId = button.dataset.todoId;
            const todoDesc = button.dataset.todoDesc;
            deleteTodo(todoId, todoDesc);
            return;
        }

        // UPDATE DONE STATUS
        if (e.target.classList.contains('todoDone')) {
            const checkbox = e.target;
            const todoId = checkbox.dataset.todoId;
            const done = checkbox.checked;
            updateStatus(todoId, done);
            return;
        }

        // FILTER TODOs
        if (e.target.dataset.type === 'filter') {
            const todoCategory = e.target.dataset.todoCategory;
            filterTodos(todoCategory);
            return;
        }

    });
    document.getElementById('loading').style.display = 'none';
    console.log('(Inventory) DOM fully loaded and parsed');
});

// FILTER CHECKED TODOs
document.getElementById('badge_checked').addEventListener('click', (e) => {
    const todoCategory = e.target.dataset.todoCategory;
    let toggle = e.target.dataset.stateSearch;
    let icon = document.getElementById('badge_checked_icon');
    switch(toggle) {
        case 'unset':
            e.target.dataset.stateSearch = 'true';
            e.target.classList.remove('text-dark');
            e.target.classList.remove('text-danger');
            e.target.classList.add('text-success');
            icon.classList.remove('fa-circle-xmark');
            icon.classList.remove('fa-circle');
            icon.classList.add('fa-circle-check');
            document.getElementById('badge_checked_text').innerHTML = 'Completed';
            filterTodos('completed');
            break;
        case 'true':
            e.target.dataset.stateSearch = 'false';
            e.target.classList.remove('text-dark');
            e.target.classList.remove('text-success');
            e.target.classList.add('text-danger');
            icon.classList.remove('fa-circle');
            icon.classList.remove('fa-circle-check');
            icon.classList.add('fa-circle-xmark');
            document.getElementById('badge_checked_text').innerHTML = 'Uncompleted';
            filterTodos('uncompleted');
            break;
        case 'false':
            e.target.dataset.stateSearch = 'unset';
            e.target.classList.remove('text-success');
            e.target.classList.remove('text-danger');
            e.target.classList.add('text-dark');
            icon.classList.remove('fa-circle-xmark');
            icon.classList.remove('fa-circle-check');
            icon.classList.add('fa-circle');
            document.getElementById('badge_checked_text').innerHTML = 'Any';
            filterTodos('CLEARFILTER');
            break;
    }
    return;
})


/**
 * Deletes a ToDo item
 * @param {string} todoId - The ID of the ToDo item to delete
 * @param {string} todoDesc - The description of the ToDo item to delete
 */
const deleteTodo = (todoId, todoDesc) => {
    axios.post('/todo/delete-todo', {
        todoId: todoId
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status == 200) {
            document.getElementById(`todo_${todoId}`).remove();
            const totalItems = parseInt(document.getElementById('totalItems').innerHTML) - 1
            document.getElementById('totalItems').innerHTML = totalItems
            console.log('Item deleted successfully');
            toastMessage('success', 'ToDo deleted successfully', `ToDo ${todoDesc} deleted successfully`);
        } else {
            toastMessage('error', 'Error deleting ToDo', `Error deleting ToDo ${todoDesc}`);
            console.error('Failed to delete item');
        }
    }).catch(err => {
        console.error('Failed to delete item');
    });
}

/**
 * Update the status of a ToDo
 * @param {string} todoId - The ID of the ToDo to update
 * @param {boolean} done - The new status of the ToDo
 */
const updateStatus = (todoId, done) => {
    axios.post('/todo/todo-status', {
        todoId: todoId,
        done: done
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status == 200) {
            console.log('ToDo completed!');
            document.getElementById(`todo_${todoId}_completedOn`).innerHTML = res.data.done ? res.data.completedOn : '-';
            let checkboxClasses = document.getElementById(`todo_${todoId}_completedIcon`).classList;
            checkboxClasses.remove('fa-circle-xmark');
            checkboxClasses.remove('fa-circle-check');
            checkboxClasses.add(done ? 'fa-circle-check' : 'fa-circle-xmark');
            checkboxClasses.add(done ? 'text-success' : 'text-secondary');
        } else {
            toastMessage('error', 'Error updating ToDo status', `Error updateing ToDo status ${res.data.message}`);
            console.error('Failed to update ToDo status');
        }
    }).catch(err => {
        console.error('Failed to update ToDo status', err);
    });
}


/**
 * Filters the list of ToDo items based on the given category
 * @param {string} category - The category to filter the ToDo items by
 * @example
 * filterTodos('WORK') // Will show only the ToDo items with the category 'WORK'
 * @example
 * filterTodos('CLEARFILTER') // Will show all the ToDo items
 */
const filterTodos = (category) => {
    const todoList = document.getElementById('todoList');
    const todoItems = todoList.querySelectorAll('article');


    let badgeToAdd = false;

    todoItems.forEach(todo => {
        const todoCategory = _.head(todo.getElementsByClassName('LIST_ITEM_CATEGORY')).dataset.todoCategory;

        if (category === 'CLEARFILTER') {
            todo.style.display = 'block';
            return;
        }

        if (category === 'completed') {
            let isChecked = _.head(todo.getElementsByClassName('todoDone')).checked
            todo.style.display = isChecked ? 'block' : 'none';
            return;
        }

        if (category === 'uncompleted') {
            let isChecked = _.head(todo.getElementsByClassName('todoDone')).checked
            todo.style.display = !isChecked ? 'block' : 'none';
            return;
        }

        if (category === todoCategory) {
            todo.style.display = 'block';
            badgeToAdd = true;
        } else {
            todo.style.display = 'none';
        }

    });

    if (badgeToAdd) {
        addBadge(category);
    }
}


/**
 * Adds a badge to the filter list
 * @param {string} category - The category of the badge to add
 * If a badge with the same category already exists, it will be removed and the filter will be cleared
 */
const addBadge = (category) => {
    badgeList = document.getElementById('badgeList');

    let badge = document.querySelector(`div[data-filter-value="${category}"]`);
    if (badge) {
        removeBadge(category);
        filterTodos('CLEARFILTER');
        return;
    }

    badge = document.createElement('div');
    badge.className = 'badge bg-light text-dark border px-2 py-2 fs-normal cursor-pointer mx-2-2';
    badge.dataset.type = 'filter';
    badge.dataset.filterValue = category;
    badge.dataset.todoCategory = category;
    badge.id = `badge_${category}`;
    badge.innerHTML = category;
    badge.onclick = () => removeBadge(category);
    badge.style.marginLeft = '5px';
    badgeList.appendChild(badge);
}


/**
 * Removes a badge from the filter list
 * @param {string} category - The category of the badge to remove
 * If a badge with the same category exists, it will be removed and the filter will be cleared
 */
const removeBadge = (category) => {
    badge = document.getElementById(`badge_${category}`);
    badge.remove();
    filterTodos('CLEARFILTER');
}