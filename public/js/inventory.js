
// deleteItem.addEventListener("click", () => {
// console.log(e);
//     console.log(this.className); // logs the className of myElement
//     console.log(e.currentTarget === this); // logs `true`
// });

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');




    document.getElementById('itemList').addEventListener('click', (e) => {


        /*
            let iconDelete = button.querySelector('.icon-delete');
            let spinnerDelete = button.querySelector('.spinner-delete');
            iconDelete.style.display = 'none';
            spinnerDelete.style.display = 'block';


            // then
            iconDelete.style.display = 'block';
            spinnerDelete.style.display = 'none';
        */


        // DELETE ITEM
        if (e.target.classList.contains('deleteItem')) {
            const button = e.target;
            const itemId = button.dataset.itemId;
            const itemName = button.dataset.itemName;
            
            const toastMessage = document.getElementById('toastMessage');
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastMessage)
            
            const toastBody = document.getElementById('toastBody');
            const toastTitle = document.getElementById('toastTitle');

            toastMessage.get
            
            fetch('/inventory/deleteItem', {
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
                    console.log('Item deleted successfully');
                    toastTitle.textContent = 'Item deleted';
                    toastBody.textContent = `Item "${itemName}" deleted successfully!`;
                    toastBootstrap.show();
                } else {
                    toastTitle.textContent = 'Error';
                    toastBody.textContent = 'Failed to delete item';
                    toastBootstrap.show();
                    console.error('Failed to delete item');
                }
            }).catch(error => {
                console.error('Error deleting item', error);
            });

        }
    });
    document.getElementById('loading').style.display = 'none';
});