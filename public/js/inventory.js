document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM fully loaded and parsed');

    document.getElementById('itemList').addEventListener('click', (e) => {

        const target = e.target;
        const dataset = target.dataset;
        const classList = target.classList;

        // DELETE ITEM
        if (classList.contains('deleteItem')) {
            const itemId = dataset.itemId;
            const itemName = dataset.itemName;

            if (confirm(`Sei sicuro di voler eliminare "${itemName}"?`)) {
                // Show spinner
                target.querySelector('.spinner-delete').style.display = 'inline-block';
                target.querySelector('i').style.display = 'none';
                target.disabled = true;

                deleteItem(itemId);
            }
        }

        // EDIT ITEM
        if (classList.contains('editItem')) {
            const itemId = dataset.itemId;
            window.location.href = `/inventory/edit-item/${itemId}`;
        }


        // ADD ONE ITEM
        // Increase/Decrease quantity buttons
        if (classList.contains('moreQuantity') || classList.contains('lessQuantity')) {
            const itemId = dataset.itemId;
            const diff = parseInt(dataset.itemDiff);
            const qtyDisplay = document.querySelector(`#article_${itemId}_qty .qty-number`);
            const currentQty = parseInt(qtyDisplay.textContent);
            const newQty = Math.max(0, currentQty + diff);

            // Update UI immediately for better UX
            qtyDisplay.textContent = newQty;

            // Add animation
            qtyDisplay.style.transform = 'scale(1.2)';
            setTimeout(() => {
                qtyDisplay.style.transform = 'scale(1)';
            }, 200);

            // Send update to server
            processUpdateItemQuantity(itemId, newQty);
        }

        // ADD TO SHOPPING LIST
        if (classList.contains('btn-add-to-list')) {
            const itemId = dataset.itemId;
            addToShoppingList(itemId);
        }


    });
    document.getElementById('loading').style.display = 'none';
    console.log('(Inventory) DOM fully loaded and parsed');
});



// IMAGE SEARCH
document.getElementById('imageSearchIcon').addEventListener('click', () => {
    let imageUrl = document.getElementById('imageUrl').value;
    console.log('imageUrl', imageUrl);

    if (_.size(imageUrl) > 3) {
        axios.get('/api/search-images', {
            params: {
                q: imageUrl
            }
        }).then(res => {
            if (res.status == 200 && _.size(res.data.images) > 0) {
                images = res.data.images;
                _.each(images, (imageUrl, i) => {
                    console.log('imageUrl', imageUrl, 'i = ', i);
                    let img = document.getElementById(`img.preview-${i}`);
                    console.log('image', img);
                    img.src = imageUrl;
                });
            }
        }).catch(err => {
            console.error('Failed to gather images', err);
        })
    }
});



function selectThisImage(imgElement) {
    // Remove previous selection
    document.querySelectorAll(".previewImage").forEach(img => {
        img.classList.remove("selected");
    });

    // Add selection to clicked image
    imgElement.classList.add("selected");

    // Store selected image URL in hidden input
    document.getElementById("selectedImage").value = imgElement.src;

    // Optional: Visual feedback
    imgElement.style.animation = "pulse 0.3s ease";
    setTimeout(() => {
        imgElement.style.animation = "";
    }, 300);
}

// Pulse animation for selection feedback
// const style = document.getElementsByTagName("style");
// style.textContent = `
//         @keyframes pulse {
//             0%, 100% { transform: scale(1); }
//             50% { transform: scale(0.95); }
//         }
//     `;
// document.head.appendChild(style);


// Clear image selections on form reset
document.getElementById("shoppingListForm")?.addEventListener("reset", function () {
    document.querySelectorAll(".previewImage").forEach((img, index) => {
        img.src = "https://placehold.co/150?text=No+Image";
        img.classList.remove("selected");
    });
    document.getElementById("selectedImage").value = "";
});



const updateItemQuantity = (itemId, newQty) => {
    axios.post('/inventory/edit-quantity', {
        itemId: itemId,
        newQty: newQty
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status == 200) {
            console.log('Quantity updated:', res.data);
        } else {
            toastMessage('error', 'Error deleting item', `Error deleting item ${res.data.itemName}`);
            console.error('Failed to delete item');
        }
    }).catch(err => {
        console.error('Failed to delete item');
    });
}

const processUpdateItemQuantity = _.debounce(updateItemQuantity, 1000);


const deleteItem = (itemId) => {
    axios.post('/inventory/delete-item', {
        itemId: itemId
    }, {
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(response => {
        if (response.status === 200) {
            document.getElementById(`article_${itemId}`).remove();
            const totalItems = parseInt(document.getElementById('totalItems').innerHTML) - 1
            document.getElementById('totalItems').innerHTML = totalItems
            console.log('Item deleted successfully');
            toastMessage('success', 'Item deleted successfully', `Item ${itemName} deleted successfully`);
        } else {
            toastMessage('error', 'Error deleting item', `Error deleting item ${itemName}`);
            console.error('Failed to delete item');
        }
    }).catch(error => {
        console.error('Error deleting item', error);
    });
}


const addToShoppingList = (itemId) => {
    // TODO : Add to shopping list
    console.log('[TODO] Add to shopping list', itemId);
}