
document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM fully loaded and parsed');

    document.getElementById('itemList').addEventListener('click', (e) => {

        // DELETE ITEM
        if (e.target.classList.contains('deleteItem')) {
            const button = e.target;
            const itemId = button.dataset.itemId;
            const itemName = button.dataset.itemName;

            fetch('/inventory/delete-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    itemId: itemId
                }),
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

        // EDIT ITEM
        if (e.target.classList.contains('editItem')) {
            const button = e.target;
            const itemId = button.dataset.itemId;
            window.location.href = `/inventory/edit-item/${itemId}`;
        }


        // ADD ONE ITEM
        if (e.target.classList.contains('moreQuantity') || e.target.classList.contains('lessQuantity')) {
            const button = e.target;
            const itemId = button.dataset.itemId;
            const diff = parseFloat(button.dataset.itemDiff);

            axios.post('/inventory/edit-quantity', {
                itemId: itemId,
                diff: diff
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                if (res.status == 200) {
                    document.getElementById(`article_${itemId}_qty`).innerHTML = res.data.qty;
                } else {
                    toastMessage('error', 'Error deleting item', `Error deleting item ${res.data.itemName}`);
                    console.error('Failed to delete item');
                }
            }).catch(err => {
                console.error('Failed to delete item');
            });


        }



    });
    document.getElementById('loading').style.display = 'none';
    console.log('(Inventory) DOM fully loaded and parsed');
});

document.getElementById('imageSearchIcon').addEventListener('click', () => {

    let imageUrl = document.getElementById('imageUrl').value;
    console.log('imageUrl', imageUrl);

    if (_.size(imageUrl) > 3) {

        axios.get('/api/search-images', {
            params: {
                q: imageUrl
            }
        })
            .then(res => {
                if (res.status == 200) {
                    if (_.size(res.data.images) > 0) {
                        images = res.data.images;
                        _.each(images, (imageUrl, i) => {
                            console.log('imageUrl', imageUrl, 'i = ', i);
                            let img = document.getElementById(`img.preview-${i}`);
                            console.log('image', img);
                            img.src = imageUrl;
                        });
                    }
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
const style = document.createElement("style");
style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.95); }
        }
    `;
document.head.appendChild(style);

// Clear image selections on form reset
document.getElementById("shoppingListForm")?.addEventListener("reset", function () {
    document.querySelectorAll(".previewImage").forEach((img, index) => {
        img.src = "https://placehold.co/150?text=No+Image";
        img.classList.remove("selected");
    });
    document.getElementById("selectedImage").value = "";
});