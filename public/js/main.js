function changeImg(input) {
    console.log('Change image', input.value);

    document.getElementById('previewImage').src = input.value;
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    document.getElementById('loading').style.display = 'none';
});


function toastMessage(type, title, body) {

    const toastMessage = document.getElementById('toastMessage');
    const toast = bootstrap.Toast.getOrCreateInstance(toastMessage)

    const toastBody = document.getElementById('toastBody');
    const toastTitle = document.getElementById('toastTitle');

    const toastHeader = document.querySelector('.toast-header');

    switch (type) {
        case 'success':
            toastHeader.classList.remove('error');
            toastHeader.classList.remove('warning');
            toastHeader.classList.add('success');

            toastMessage.classList.remove('error');
            toastMessage.classList.remove('warning');
            toastMessage.classList.add('success');
            break;

        case 'error':
            toastHeader.classList.remove('success');
            toastHeader.classList.remove('warning');
            toastHeader.classList.add('error');

            toastMessage.classList.remove('success');
            toastMessage.classList.remove('warning');
            toastMessage.classList.add('error');
            break;

        case 'warning':
            toastHeader.classList.remove('success');
            toastHeader.classList.remove('error');
            toastHeader.classList.add('warning');

            toastMessage.classList.remove('success');
            toastMessage.classList.remove('error');
            toastMessage.classList.add('warning');
            break;

        default:
            break;
    }


    toastBody.textContent = body;
    toastTitle.textContent = title;
    toast.show();
}