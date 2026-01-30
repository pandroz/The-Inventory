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

const IGNORED_FILTERS = ['completed', 'uncompleted', 'unset'];

var filters = {
    categories: [],
    status: 'unset'
}

// FILTER CHECKED TODOs
document.getElementById('badge_checked').addEventListener('click', (e) => {
    const todoCategory = e.target.dataset.todoCategory;
    let toggle = e.target.dataset.stateSearch;
    let icon = document.getElementById('badge_checked_icon');
    switch (toggle) {
        case 'unset': // STEP TO TRUE
            e.target.dataset.stateSearch = 'completed';
            e.target.classList.remove('text-dark');
            e.target.classList.remove('text-danger');
            e.target.classList.add('text-success');
            icon.classList.remove('fa-circle-xmark');
            icon.classList.remove('fa-circle');
            icon.classList.add('fa-circle-check');
            document.getElementById('badge_checked_text').innerHTML = 'Completed';
            filters.status = 'completed';
            filterTodos();
            break;
        case 'completed': // STEP TO FALSE
            e.target.dataset.stateSearch = 'uncompleted';
            e.target.classList.remove('text-dark');
            e.target.classList.remove('text-success');
            e.target.classList.add('text-danger');
            icon.classList.remove('fa-circle');
            icon.classList.remove('fa-circle-check');
            icon.classList.add('fa-circle-xmark');
            document.getElementById('badge_checked_text').innerHTML = 'Uncompleted';
            filters.status = 'uncompleted';
            filterTodos();
            break;
        case 'uncompleted': // STEP TO UNSET
            e.target.dataset.stateSearch = 'unset';
            e.target.classList.remove('text-success');
            e.target.classList.remove('text-danger');
            e.target.classList.add('text-dark');
            icon.classList.remove('fa-circle-xmark');
            icon.classList.remove('fa-circle-check');
            icon.classList.add('fa-circle');
            document.getElementById('badge_checked_text').innerHTML = 'Any';
            filters.status = 'unset';
            filterTodos();
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


const filterTodos = (category) => {
    console.log('filtering per category ', category);
    const todoItems = document.getElementById('todoList').querySelectorAll('article');

    if (category) {
        let badgeList = document.getElementById('badgeList').children
        badgeList = Array.from(badgeList).filter(item => item.classList.contains('FILTER_BADGE'));
        console.log('badgeList', badgeList);

        if (_.size(badgeList) == 0) {
            filters.categories.push({
                category: category,
                hasBadge: false
            });
        } else {
            badgeList.forEach(item => {
                let badgeCategory = _.get(item, 'dataset.todoCategory');
                if (category && !filters.categories.includes(badgeCategory)) {
                    filters.categories.push({
                        category: category,
                        hasBadge: false
                    });
                } else if (category) {
                    filters.categories.splice(_.findIndex(filters.categories, {
                        "category": category
                    }), 1);
                }
            });
        }
    }

    console.log('filters', filters);


    let badgeToAdd = false;
    if (_.size(filters.categories) > 0) {
        _.each(filters.categories, (cat, i) => {
            _.each(todoItems, todo => {
                let thisTodo = {
                    checked: _.head(todo.getElementsByClassName('todoDone')).checked,
                    category: _.head(todo.getElementsByClassName('LIST_ITEM_CATEGORY')).dataset.todoCategory
                }

                if (checkForStatus(thisTodo, filters.status) && checkForCategory(thisTodo, cat, category))
                    todo.style.display = 'block';
                else
                    todo.style.display = 'none';

                manageBadge(cat, i);
            });
        });
    } else {
        _.each(todoItems, todo => {
            let thisTodo = {
                checked: _.head(todo.getElementsByClassName('todoDone')).checked
            }
            if (checkForStatus(thisTodo, filters.status))
                todo.style.display = 'block';
            else
                todo.style.display = 'none';
        });
    }


}


const checkForCategory = (todo, cat, category) => {
    return category === cat.category && todo.category === category;
}

const checkForStatus = (todo, statusCheck) => {
    if (statusCheck === 'unset')
        return true;
    else if (statusCheck === 'completed')
        return todo.checked;
    else if (statusCheck === 'uncompleted')
        return !todo.checked;
}



const manageBadge = (cat, ix) => {
    let category = cat.category;
    const badgeList = document.getElementById('badgeList');
    // let badge = badgeList.querySelector(`div[data-filter-value="${category}"]`);

    if (!cat.hasBadge) {
        _.set(filters.categories[ix], 'hasBadge', true);
        let newBadge = document.createElement('div');
        newBadge.className = 'badge bg-light text-dark border px-2 py-2 fs-normal cursor-pointer mx-2-2 FILTER_BADGE';
        newBadge.dataset.type = 'filter';
        newBadge.dataset.filterValue = category;
        newBadge.dataset.todoCategory = category;
        newBadge.id = `badge_${category}`;
        newBadge.innerHTML = category;
        newBadge.onclick = () => removeBadge(category);
        newBadge.style.marginLeft = '5px';
        badgeList.appendChild(newBadge);
    } else {
        _.set(filters.categories[ix], 'hasBadge', false);
    }
}


/**
 * Removes a badge from the filter list
 * @param {string} category - The category of the badge to remove
 * If a badge with the same category exists, it will be removed and the filter will be cleared
 */
const removeBadge = (category) => {
    badge = document.getElementById(`badge_${category}`);
    badge.remove();
    filterTodos();
}