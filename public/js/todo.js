document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM fully loaded and parsed');

    document.getElementById('todoList').addEventListener('click', (e) => {

        // DELETE ITEM
        if (e.target.classList.contains('deleteTodo')) {
            const button = e.target;
            const todoId = button.dataset.todoId;
            const todoDesc = button.dataset.todoDesc;
            deleteTodo(todoId, todoDesc);
        }

        // // EDIT ITEM
        // if (e.target.classList.contains('editItem')) {
        //     const button = e.target;
        //     const itemId = button.dataset.itemId;
        //     window.location.href = `/inventory/edit-item/${itemId}`;
        // }


        // UPDATE DONE STATUS
        if (e.target.classList.contains('todoDone')) {
            const checkbox = e.target;
            const todoId = checkbox.dataset.todoId;
            const done = checkbox.checked;
            updateStatus(todoId, done);
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
        } else {
            toastMessage('error', 'Error updating ToDo status', `Error updateing ToDo status ${res.data.message}`);
            console.error('Failed to update ToDo status');
        }
    }).catch(err => {
        console.error('Failed to update ToDo status', err);
    });
}