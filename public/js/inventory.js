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
            'Content-Type': 'application/json',
            'x-csrf-token': _csrf
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

const processUpdateItemQuantity = _.debounce(updateItemQuantity, 500);


const deleteItem = (itemId) => {
    axios.post('/inventory/delete-item', {
        itemId: itemId
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': _csrf
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
    axios.post('/shopping-manager/add-item', {
        itemId: itemId
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': _csrf
        }
    }).then(response => {
        if (response.status === 200) {
            console.log('Item added to shopping list successfully');
            toastMessage('success', 'Item added to shopping list successfully', `Item ${res.data.itemName} added to shopping list successfully`);
        } else {
            toastMessage('error', 'Error adding item to shopping list', `Error adding item ${res.data.itemName} to shopping list: ${res.data.message}`);
            console.error('Failed to add item to shopping list');
        }
    }).catch(error => {
        console.error('Error adding item to shopping list', error);
    });
}








// START BARCODE CODE

(function () {
    // ── Config ──────────────────────────────────────────────────────────────
    const API_ENDPOINT = '/api/barcode'; // your Express endpoint
    const SCAN_COOLDOWN = 2500;           // ms debounce for same barcode

    // Fields to auto-fill after a successful API response.
    // Keys = your form's input [name] attributes.
    // Values = dot-path into the API JSON response.
    // Adjust to match whatever your /api/barcode returns.
    const FIELD_MAP = {
        // 'name':               'result.name',   // uncomment & map as needed
        // 'price':              'result.price',
        // 'preferredSupplier':  'result.brand',
    };
    // ────────────────────────────────────────────────────────────────────────

    const $ = id => document.getElementById(id);
    let codeReader = null, scanning = false;
    let lastValue = null, lastTime = 0;

    // HTTPS guard (mobile)
    if (!window.isSecureContext) $('bcHttpsWarn').classList.remove('d-none');

    // ── Status helpers ───────────────────────────────────────────────────────
    function setStatus(state, text) {
        $('bcDot').className = 'bc-dot ' + state;
        $('bcStatusText').textContent = text;
    }

    // ── Start ────────────────────────────────────────────────────────────────
    $('bcStartBtn').addEventListener('click', startScanner);
    $('bcStopBtn').addEventListener('click', stopScanner);

    async function startScanner() {
        // 1. Explicit permission request (must be inside user-gesture handler)
        let tempStream;
        try {
            tempStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } }
            });
        } catch (e) {
            const msg = e.name === 'NotAllowedError'
                ? 'Permesso fotocamera negato. Controlla le impostazioni del browser.'
                : e.name === 'NotFoundError'
                    ? 'Nessuna fotocamera trovata su questo dispositivo.'
                    : `Errore fotocamera: ${e.name}`;
            setStatus('error', msg);
            return;
        }
        tempStream.getTracks().forEach(t => t.stop()); // release; ZXing opens its own

        // 2. Show viewport
        $('bcViewport').classList.remove('d-none');
        $('bcShell').classList.add('bc-active');
        $('bcStartBtn').classList.add('d-none');
        $('bcStopBtn').classList.remove('d-none');
        setStatus('scanning', 'Scansione in corso…');

        // 3. Start ZXing
        codeReader = new ZXing.BrowserMultiFormatReader();
        codeReader.timeBetweenDecodingAttempts = 150;

        try {
            await codeReader.decodeFromConstraints(
                { video: { facingMode: { ideal: 'environment' } } },
                'bcVideo',
                (result) => { if (result) onDetected(result); }
            );
            scanning = true;
        } catch (e) {
            setStatus('error', 'Impossibile avviare: ' + e.message);
            stopScanner();
        }
    }

    function stopScanner() {
        if (codeReader) { codeReader.reset(); codeReader = null; }
        scanning = false;
        $('bcViewport').classList.add('d-none');
        $('bcShell').classList.remove('bc-active');
        $('bcStartBtn').classList.remove('d-none');
        $('bcStopBtn').classList.add('d-none');
        $('bcScanline');
        setStatus('', 'In attesa…');
    }

    // ── On barcode detected ──────────────────────────────────────────────────
    function onDetected(result) {
        const value = result.getText();
        const format = result.getBarcodeFormat();
        const now = Date.now();

        if (value === lastValue && now - lastTime < SCAN_COOLDOWN) return;
        lastValue = value; lastTime = now;

        // Flash
        const flash = $('bcFlash');
        flash.classList.remove('d-none');
        setTimeout(() => flash.classList.add('d-none'), 380);

        // Format badge
        const fmtName = ZXing.BarcodeFormat[format] || 'BARCODE';
        $('bcFormatBadge').textContent = fmtName;
        $('bcFormatBadge').classList.remove('d-none');

        // Result bar
        $('bcResultValue').textContent = value;
        $('bcResultFormat').textContent = fmtName;
        $('bcResult').classList.remove('d-none');

        // Stop scanner after successful read
        stopScanner();

        // Call API
        callApi(value, fmtName);
    }

    // ── API call + field auto-fill ───────────────────────────────────────────
    async function callApi(barcode, format) {
        setStatus('busy', 'Ricerca prodotto…');
        try {
            const res = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcode, format }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);

            // Auto-fill mapped form fields
            Object.entries(FIELD_MAP).forEach(([fieldName, path]) => {
                const val = path.split('.').reduce((o, k) => o?.[k], data);
                if (val == null) return;
                const el = document.querySelector(`[name="${fieldName}"]`);
                if (el) { el.value = val; el.dispatchEvent(new Event('input')); }
            });

            setStatus('scanning', 'Completato ✓');
            setTimeout(() => setStatus('', 'In attesa…'), 3000);

        } catch (err) {
            setStatus('error', 'Errore API: ' + err.message);
        }
    }

    // Utility: deep-get by dot path
    function deepGet(obj, path) {
        return path.split('.').reduce((o, k) => o?.[k], obj);
    }
})();

// END BARCODE CODE