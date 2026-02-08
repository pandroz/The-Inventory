document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM fully loaded and parsed');
    const form = document.getElementById("addTodoForm");
    const remindMeCheckbox = document.getElementById("remindMe");
    const reminderDateInput = document.getElementById("reminderDate");
    const recurringPattern = document.getElementById("recurringPattern");
    const recurringStartDate = document.getElementById("recurringStartDate");
    const recurringEndDate = document.getElementById("recurringEndDate");

    // Enable/disable reminder date based on checkbox
    remindMeCheckbox?.addEventListener("change", function () {
        if (this.checked) {
            reminderDateInput.required = true;
            reminderDateInput.parentElement.classList.add("border-warning");
        } else {
            reminderDateInput.required = false;
            reminderDateInput.value = "";
            reminderDateInput.parentElement.classList.remove("border-warning");
        }
    });

    // Enable/disable recurring dates based on pattern selection
    recurringPattern?.addEventListener("change", function () {
        if (this.value && this.value !== "") {
            recurringStartDate.parentElement.parentElement.classList.add("border-info");
            recurringEndDate.parentElement.parentElement.classList.add("border-info");
        } else {
            recurringStartDate.value = "";
            recurringEndDate.value = "";
            recurringStartDate.parentElement.parentElement.classList.remove("border-info");
            recurringEndDate.parentElement.parentElement.classList.remove("border-info");
        }
    });

    // Validate dates
    form?.addEventListener("submit", function (e) {
        const completeBy = document.getElementById("completeBy").value;
        const reminderDate = reminderDateInput.value;

        // Check if reminder date is before complete by date
        if (completeBy && reminderDate) {
            const completeByDate = new Date(completeBy);
            const reminder = new Date(reminderDate);

            if (reminder > completeByDate) {
                e.preventDefault();
                alert("La data del promemoria non può essere successiva alla scadenza!");
                return false;
            }
        }

        // Check recurring dates
        const startDate = recurringStartDate.value;
        const endDate = recurringEndDate.value;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (end < start) {
                e.preventDefault();
                alert("La data di fine ricorrenza non può essere precedente alla data di inizio!");
                return false;
            }
        }

        // If remind me is checked, reminder date is required
        if (remindMeCheckbox.checked && !reminderDate) {
            e.preventDefault();
            alert("Se attivi il promemoria, devi specificare una data!");
            reminderDateInput.focus();
            return false;
        }
    });

    // Set minimum date for completeBy to today
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("completeBy").min = today;
    reminderDateInput.min = new Date().toISOString().slice(0, 16);
    recurringStartDate.min = today;






    const filter = {};
    // FILTERS
    document.getElementById('filterCollapse').addEventListener('change', (e) => {
        const target = e.target;
        const id = target.id;

        if (id === 'statusFilter')
            target.value !== '' ? _.set(filter, 'done', target.value) : _.unset(filter, 'done');

        if (id === 'categoryFilter')
            target.value !== '' ? _.set(filter, 'category', target.value) : _.unset(filter, 'category');

        if (id === 'priorityFilter')
            target.value !== '' ? _.set(filter, 'priority', target.value) : _.unset(filter, 'priority');

        if (id === 'assigneeFilter')
            target.value !== '' ? _.set(filter, 'assignedTo', target.value) : _.unset(filter, 'assignedTo');

        getTodoList(filter);
    });



    // TODO LIST
    document.getElementById('todoList').addEventListener('click', (e) => {

        const target = e.target;
        const dataset = target.dataset;
        const classList = target.classList;

        // DELETE ITEM
        if (classList.contains('deleteTodo')) {
            const button = e.target;
            const todoId = button.dataset.todoId;
            const todoDesc = button.dataset.todoDesc;
            deleteTodo(todoId, todoDesc);
            return;
        }

        // UPDATE DONE STATUS
        if (classList.contains('todoDone')) {
            const checkbox = e.target;
            const todoId = checkbox.dataset.todoId;
            const done = checkbox.checked;
            updateStatus(todoId, done);
            return;
        }

    });


    document.getElementById('loading').style.display = 'none';
    console.log('(Inventory) DOM fully loaded and parsed');
});

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


const getTodoList = (filter) => {
    axios.post('/todo/filter-todos', {
        filter: filter
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status == 200) {
            filterTodoList(res.data.todos);
        } else {
            toastMessage('error', 'Error getting ToDo list', `Error getting ToDo list ${res.data.message}`);
            console.error('Failed to get ToDo list');
        }
    }).catch(err => {
        console.error('Failed to get ToDo list', err);
    });
}


const filterTodoList = (todos) => {
    const filteredTodoIds = todos.map(todo => 'todo_' + todo._id);

    const sizeFilteredIds = _.size(filteredTodoIds);
    document.getElementById('totalItems').innerHTML = sizeFilteredIds;


    const todoList = _.filter(_.map(document.getElementById('todoList').childNodes, 'id'), _.identity);

    // RESET TODOS DISPLAY
    _.each(todoList, todoId => {
        document.getElementById(todoId).style.display = 'block';
    });

    _.difference(todoList, filteredTodoIds).forEach(todoId => {
        document.getElementById(todoId).style.display = 'none';
    });
}





// Initialize Bootstrap tooltips
document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});