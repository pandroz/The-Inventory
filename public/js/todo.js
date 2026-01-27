document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM fully loaded and parsed');

    document.getElementById('itemList').addEventListener('click', (e) => {

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


        // // ADD ONE ITEM
        // if (e.target.classList.contains('moreQuantity') || e.target.classList.contains('lessQuantity')) {
        //     const button = e.target;
        //     const itemId = button.dataset.itemId;
        //     const diff = parseFloat(button.dataset.itemDiff);

        //     axios.post('/inventory/edit-quantity', {
        //         itemId: itemId,
        //         diff: diff
        //     }, {
        //         headers: {
        //             'Content-Type': 'application/json'
        //         }
        //     }).then(res => {
        //         if (res.status == 200) {
        //             document.getElementById(`article_${itemId}_qty`).innerHTML = res.data.qty;
        //         } else {
        //             toastMessage('error', 'Error deleting item', `Error deleting item ${res.data.itemName}`);
        //             console.error('Failed to delete item');
        //         }
        //     }).catch(err => {
        //         console.error('Failed to delete item');
        //     });


        // }



    });
    document.getElementById('loading').style.display = 'none';
    console.log('(Inventory) DOM fully loaded and parsed');
});


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