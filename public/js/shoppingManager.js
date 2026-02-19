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
                processUpdateItem({
                    itemId: itemId,
                    newQty: input.value
                });
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
                processUpdateItem({
                    itemId: itemId,
                    newQty: input.value
                });
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
            processUpdateItem({
                itemId: itemId,
                newQty: input.value
            });
        });

        // Prevent invalid characters
        input.addEventListener('keypress', function (e) {
            if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
            }
        });
    });

    // Bought checkbox change event
    document.querySelectorAll('.item-bought-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const itemId = this.dataset.itemId;
            const isBought = this.checked;
            const card = this.closest('.shopping-item');

            // Toggle bought state visually
            if (isBought) {
                card.classList.add('item-bought');
            } else {
                card.classList.remove('item-bought');
            }

            // Call backend to update bought status
            processUpdateItem({
                itemId: itemId,
                isBought: isBought
            });
        });
    });

    // Change item name - click on name to edit
    document.getElementById('shoppingManangerList')?.addEventListener('click', e => {
        if (e.target.classList.contains('item-name')) {
            const h5 = e.target;
            const itemId = h5.dataset.itemId;
            const input = h5.parentElement.querySelector('.itemNameForm');

            h5.classList.add('d-none');
            input.classList.remove('d-none');
            input.focus();
            input.select();
        }
    });

    // Save item name on blur or Enter key
    document.querySelectorAll('.itemNameForm').forEach(input => {
        // Save on blur (click away)
        input.addEventListener('blur', function () {
            const itemId = this.dataset.itemId;
            const newName = this.value.trim();
            const h5 = this.parentElement.querySelector('.item-name');

            if (newName && newName !== h5.textContent.trim()) {
                h5.textContent = newName;
                updateItem({
                    itemId: itemId,
                    itemName: newName
                });
            }

            this.classList.add('d-none');
            h5.classList.remove('d-none');
        });

        // Save on Enter key
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                this.blur();
            }
        });

        // Cancel on Escape key
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                const h5 = this.parentElement.querySelector('.item-name');
                this.value = h5.textContent.trim();
                this.classList.add('d-none');
                h5.classList.remove('d-none');
            }
        });
    });

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

    // Upsert list button
    document.getElementById('upsertList')?.addEventListener('click', (e) => {
        console.log('upsertList');
        upsertList();
    });

    document.getElementById('sendList')?.addEventListener('click', (e) => {
        console.log('sendList');
        sendList();
    });
});





/**
 * Update an item in the shopping manager list
 * @param {Object} updateObj - Object containing the item to be updated with the following properties:
 *   - itemId: The item ID to update
 *   - newName: The new name of the item
 *   - newQty: The new quantity of the item
 *   - isBought: A boolean indicating whether the item is bought or not
 */
function updateItem(updateObj) {
    const { itemId, newName, newQty, isBought } = updateObj;
    axios.post('/shopping-manager/update-item', {
        itemId: itemId,
        itemName: newName,
        qty: newQty,
        isBought: isBought
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': _csrf
        }
    })
        .then(res => {
            if (res.status === 200) {
                console.log('Item name updated');
            } else {
                toastMessage('error', 'Error updating item name', res.data.message);
            }
        })
        .catch(err => {
            console.error('Error updating item name:', err);
            toastMessage('error', 'Error', 'Failed to update item name');
        });
}

// Function to delete item
function deleteItem(itemId) {
    axios.post('shopping-manager/delete-item', {
        itemId: itemId
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': _csrf
        }
    })
        .then(res => {
            if (res.status == 200) {
                // Add fade out animation before removing
                const itemElement = document.getElementById(`item_${itemId}`);
                itemElement.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    itemElement.remove();
                }, 300);
            } else {
                console.error('Failed to delete item');
                toastMessage('error', 'Error deleting item', `Error deleting item ${res.data.message}`);
            }
        })
        .catch(err => {
            console.error('Error deleting item:', err);
            toastMessage('error', 'Error', 'Failed to delete item');
        });

    console.log(`Delete item ${itemId}`);
}

// Debounced updates
const processUpdateItem = _.debounce(updateItem, 500);

// Upsert list function
const upsertList = async () => {
    await axios.get('/shopping-manager/upsert-list');
    window.location.reload();
};


const sendList = async () => {
    await axios.post('/shopping-manager/send-list', {}, {
        headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': _csrf
        }
    }).then(res => {
        if (res.status == 200) {
            toastMessage('success', 'Success', res.data.message);
        } else {
            toastMessage('error', 'Error', res.data.message);
        }
    }).catch(err => {
        console.error('Error sending shopping list to Telegram:', err);
        toastMessage('error', 'Error', 'Failed to send shopping list to Telegram');
    });
};


// Fade out animation
const style = document.createElement('style');
style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
        }
    `;
document.head.appendChild(style);