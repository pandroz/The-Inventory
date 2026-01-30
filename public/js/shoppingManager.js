
// Quantity control functionality
document.addEventListener('DOMContentLoaded', function () {

    // Decrease button
    document.querySelectorAll('.btn-qty.decrease').forEach(btn => {
        btn.addEventListener('click', function () {
            const itemId = this.dataset.itemId;
            const input = document.querySelector(`.qty-input[data-item-id="${itemId}"]`);
            const currentValue = parseInt(input.value) || 0;
            if (currentValue > 0) {
                input.value = currentValue - 1;
                updateQuantity(itemId, input.value);
            }
        });
    });

    // Increase button
    document.querySelectorAll('.btn-qty.increase').forEach(btn => {
        btn.addEventListener('click', function () {
            const itemId = this.dataset.itemId;
            const input = document.querySelector(`.qty-input[data-item-id="${itemId}"]`);
            const currentValue = parseInt(input.value) || 0;
            const maxValue = parseInt(input.max) || 999;
            if (currentValue < maxValue) {
                input.value = currentValue + 1;
                updateQuantity(itemId, input.value);
            }
        });
    });

    // Direct input change
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', function () {
            const itemId = this.dataset.itemId;
            let value = parseInt(this.value) || 0;
            const min = parseInt(this.min) || 0;
            const max = parseInt(this.max) || 999;

            // Validate value
            if (value < min) value = min;
            if (value > max) value = max;

            this.value = value;
            updateQuantity(itemId, value);
        });

        // Prevent invalid characters
        input.addEventListener('keypress', function (e) {
            if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
            }
        });
    });
    
    // Change item name
    document.getElementById('shoppingManangerList').addEventListener('click', e => {

        // document.addEventListener('click', function (e) {
        //     if (!e.target.classList.contains('itemNameForm')) {
        //         console.log('Clicked anywhere else')
                
        //         document.querySelectorAll('.itemNameForm').forEach(form => {
        //             form.classList.add('d-none');
        //         });
                
        //         document.querySelectorAll('.item-name').forEach(h5 => {
        //             h5.classList.remove('d-none');
        //         });
        //     }
        // });

        if (e.target.classList.contains('item-name')) {
            const h5 = e.target;
            console.log('clicked h5')
            h5.classList.add('d-none');
            h5.parentElement.querySelector('.itemNameForm').classList.remove('d-none');
        }

    })
    

    // Delete item
    document.querySelectorAll('.delete-item').forEach(btn => {
        btn.addEventListener('click', function () {
            const itemId = this.dataset.itemId;
            const itemName = this.dataset.itemName;

            if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
                deleteItem(itemId);
            }
        });
    });
});

// Function to update quantity (you'll need to implement the AJAX call)
function updateQuantity(itemId, quantity) {
    // Example AJAX call - adjust to match your backend
    /*
    fetch(`/shopping-list/${itemId}/quantity`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: quantity })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Quantity updated:', data);
        // Optional: Show success message
    })
    .catch(error => {
        console.error('Error updating quantity:', error);
        // Optional: Show error message
    });
    */
    console.log(`Update item ${itemId} to quantity ${quantity}`);
}

// Function to delete item (you'll need to implement the AJAX call)
function deleteItem(itemId) {
    axios.post('shopping-manager/delete-item', {
        itemId: itemId
    }, {
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => {
        if(res.status == 200) {
            document.getElementById(`item_${itemId}`).remove();
        } else {
            console.error('Failed to delete item');
            toastMessage('error', 'Error deleting item', `Error deleting item ${res.data.message}`);
        }
    }).catch(err => {

    });


    // Example AJAX call - adjust to match your backend
    /*
    fetch(`/shopping-list/${itemId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            // Remove item from DOM
            const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
            itemElement.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => itemElement.remove(), 300);
        }
    })
    .catch(error => {
        console.error('Error deleting item:', error);
    });
    */
    console.log(`Delete item ${itemId}`);
}
