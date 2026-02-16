// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltips.map(el => new bootstrap.Tooltip(el));
});

// Avatar Upload
function handleAvatarUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('avatarImg').src = e.target.result;
            console.log('Avatar updated - ready to upload to server');
            // TODO: Upload to server via AJAX
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Inline Edit Mode
let isEditMode = false;
const originalValues = {};

function toggleEditMode() {
    isEditMode = !isEditMode;
    
    if (isEditMode) {
        enterEditMode();
    } else {
        cancelEdit();
    }
}

function enterEditMode() {
    const editBtn = document.getElementById('toggleEditBtn');
    const editBtnText = document.getElementById('editBtnText');
    const editActions = document.getElementById('editActions');
    
    // Change button appearance
    editBtnText.textContent = 'Annulla';
    editBtn.classList.remove('btn-outline-primary');
    editBtn.classList.add('btn-outline-secondary');
    
    // Show action buttons
    editActions.classList.remove('d-none');
    
    // Store original values and toggle visibility
    const displays = document.querySelectorAll('.info-value');
    const inputs = document.querySelectorAll('.edit-input');
    
    displays.forEach(display => {
        originalValues[display.id] = display.textContent;
        display.classList.add('d-none');
    });
    
    inputs.forEach(input => {
        input.classList.remove('d-none');
    });
    
    // Add editing class to info-items
    document.querySelectorAll('.info-item').forEach(item => {
        item.classList.add('editing');
    });
    
    // Focus first input
    setTimeout(() => document.getElementById('nameInput')?.focus(), 100);
}

function cancelEdit() {
    isEditMode = false;
    const editBtn = document.getElementById('toggleEditBtn');
    const editBtnText = document.getElementById('editBtnText');
    const editActions = document.getElementById('editActions');
    
    // Reset button
    editBtnText.textContent = 'Modifica';
    editBtn.classList.remove('btn-outline-secondary');
    editBtn.classList.add('btn-outline-primary');
    
    // Hide action buttons
    editActions.classList.add('d-none');
    
    // Restore displays and hide inputs
    const displays = document.querySelectorAll('.info-value');
    const inputs = document.querySelectorAll('.edit-input');
    
    displays.forEach(display => {
        display.classList.remove('d-none');
    });
    
    inputs.forEach(input => {
        input.classList.add('d-none');
    });
    
    // Remove editing class
    document.querySelectorAll('.info-item').forEach(item => {
        item.classList.remove('editing');
    });
}

// Save Profile Form
document.getElementById('profileForm')?.addEventListener('submit', function(e) {
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // TODO: Send to server via AJAX
    console.log('Saving profile:', data);
    
    // Update display values
    document.getElementById('nameDisplay').textContent = data.name || 'Non fornito';
    document.getElementById('lastNameDisplay').textContent = data.lastName || 'Non fornito';
    document.getElementById('emailDisplay').textContent = data.email;
    document.getElementById('phoneDisplay').textContent = data.phoneNumber || 'Non fornito';
    document.getElementById('telegramDisplay').textContent = data.telegramId ? '@' + data.telegramId : 'Non collegato';
    document.getElementById('bioDisplay').textContent = data.userBio || 'Non fornita';
    
    // Exit edit mode
    toggleEditMode();

    this.submit();
});

// Password Toggle
function togglePasswordField(fieldId, button) {
    const field = document.getElementById(fieldId);
    const icon = button.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Change Password
function changePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmNewPassword').value;
    
    if (!current || !newPass || !confirm) {
        alert('Per favore, compila tutti i campi.');
        return;
    }
    
    if (newPass.length < 8) {
        alert('La nuova password deve essere di almeno 8 caratteri.');
        return;
    }
    
    if (newPass !== confirm) {
        alert('Le password non corrispondono.');
        return;
    }
    
    // TODO: Send to server
    console.log('Changing password...');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
    modal.hide();
    alert('Password cambiata con successo!');
    document.getElementById('changePasswordForm').reset();
}

// Preferences Form
document.getElementById('preferencesForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const prefs = Object.fromEntries(formData);
    
    // Add switches
    prefs.emailNotifications = document.getElementById('emailNotifications').checked;
    prefs.todoReminders = document.getElementById('todoReminders').checked;
    prefs.shoppingNotifications = document.getElementById('shoppingNotifications').checked;
    prefs.lowStockAlerts = document.getElementById('lowStockAlerts').checked;
    
    // TODO: Send to server
    console.log('Saving preferences:', prefs);
    
    alert('Preferenze salvate con successo!');
});

// Account Deletion
function confirmAccountDeletion() {
    if (confirm('Sei sicuro di voler eliminare il tuo account?\n\nQuesta azione è IRREVERSIBILE.')) {
        const verification = prompt('Digita "ELIMINA" per confermare:');
        if (verification === 'ELIMINA') {
            console.log('Deleting account...');
            alert('Account eliminato. Verrai reindirizzato alla homepage.');
            // window.location.href = '/';
        } else {
            alert('Eliminazione annullata.');
        }
    }
}