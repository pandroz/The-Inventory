function changeImg(input) {
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


function search(value, searchType) {
    let list = document.getElementById(`${searchType}List`).getElementsByTagName('article');
    value = _.trim(value);

    _.filter(list, (item) => {
        let titleContent = item.getElementsByClassName('LIST_ITEM_TITLE')[0].textContent.toLowerCase();
        let descriptionContent = item.getElementsByClassName('LIST_ITEM_DESC')[0].textContent.toLowerCase();

        let textContent = titleContent + ' ' + descriptionContent;
        textContent.includes(value.toLowerCase()) ? item.style.display = 'block' : item.style.display = 'none';
    });
}

document.getElementById("searchBar").addEventListener("keydown", event => {
    if (event.key === 'Enter') {
        const searchBar = document.getElementById("searchBar");
        const searchType = searchBar.dataset.searchType;
        const value = searchBar.value;

        search(value, searchType);
    }
});