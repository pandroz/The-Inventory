
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
                processUpdateQuantity(itemId, input.value);
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
                processUpdateQuantity(itemId, input.value);
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
            processUpdateQuantity(itemId, value);
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
    axios.post('/shopping-manager/edit-qty', {
        itemId: itemId,
        quantity: quantity
    }, {
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => {
        if(res.status !== 200) {
            toastMessage('error', 'Error updating item quantity', `Error updating item quantity ${res.data.message}`);
        }
    })
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
    
    console.log(`Delete item ${itemId}`);
}


const processUpdateQuantity = _.debounce(updateQuantity, 1000);