document.addEventListener('DOMContentLoaded', function () {

    // Image URL preview
    const imageUrlInput = document.getElementById('imageUrl');
    const imagePreview = document.getElementById('imagePreview');

    imageUrlInput?.addEventListener('input', function () {
        const url = this.value.trim();
        if (url) {
            imagePreview.src = url;
        } else {
            imagePreview.src = 'https://placehold.co/400?text=No+Image';
        }
    });

    // Calculate total value
    const qtyInput = document.getElementById('qty');
    const priceInput = document.getElementById('price');
    const totalValueDisplay = document.getElementById('totalValue');

    function updateTotalValue() {
        const qty = parseFloat(qtyInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = (qty * price).toFixed(2);
        totalValueDisplay.textContent = `€${total}`;
    }

    qtyInput?.addEventListener('input', updateTotalValue);
    priceInput?.addEventListener('input', updateTotalValue);

    // Expiration date warning
    const expirationInput = document.getElementById('expirationDate');
    expirationInput?.addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const today = new Date();
        const daysUntilExpiration = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiration < 0) {
            alert('Attenzione: Questo articolo è già scaduto!');
        } else if (daysUntilExpiration <= 7) {
            alert(`Nota: Questo articolo scade tra ${daysUntilExpiration} giorno/i`);
        }
    });

    // Delete button
    const deleteBtn = document.getElementById('deleteBtn');
    deleteBtn?.addEventListener('click', function () {
        const itemName = '<%= item.name %>';
        const itemId = '<%= item._id %>';

        if (confirm(`Sei sicuro di voler eliminare "${itemName}"? Questa azione non può essere annullata.`)) {
            // Redirect to delete endpoint or make AJAX call
            window.location.href = `/inventory/delete/${itemId}`;
        }
    });

    // Form validation
    const form = document.getElementById('editItemForm');
    form?.addEventListener('submit', function (e) {
        const name = document.getElementById('name').value.trim();
        const qty = document.getElementById('qty').value;

        if (!name) {
            e.preventDefault();
            alert('Il nome dell\'articolo è obbligatorio!');
            return false;
        }

        if (!qty || qty < 0) {
            e.preventDefault();
            alert('La quantità deve essere un numero valido!');
            return false;
        }
    });
});