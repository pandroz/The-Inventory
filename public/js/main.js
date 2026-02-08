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
            toastHeader.classList.remove('bg-danger');
            toastHeader.classList.remove('bg-warning');
            toastHeader.classList.add('bg-success');

            toastMessage.classList.remove('bg-danger');
            toastMessage.classList.remove('bg-warning');
            toastMessage.classList.add('bg-success');
            break;

        case 'error':
            toastHeader.classList.remove('bg-success');
            toastHeader.classList.remove('bg-warning');
            toastHeader.classList.add('bg-danger');

            toastMessage.classList.remove('bg-success');
            toastMessage.classList.remove('bg-warning');
            toastMessage.classList.add('bg-danger');
            break;

        case 'warning':
            toastHeader.classList.remove('bg-success');
            toastHeader.classList.remove('bg-danger');
            toastHeader.classList.add('bg-warning');

            toastMessage.classList.remove('bg-success');
            toastMessage.classList.remove('bg-danger');
            toastMessage.classList.add('bg-warning');
            break;

        default:
            break;
    }


    toastBody.textContent = body;
    toastTitle.textContent = title;
    toast.show();
}


function search(value, searchType, force = false) {
    value = _.trim(value);

    if (_.size(value) >= 3 || force) {
        let list = document.getElementById(`${searchType}List`).getElementsByTagName('article');

        _.filter(list, (item) => {
            let titleContent = _.get(_.head(item.getElementsByClassName('LIST_ITEM_TITLE')), 'textContent', '').toLowerCase();
            let descriptionContent = _.get(_.head(item.getElementsByClassName('LIST_ITEM_DESC')), 'textContent', '').toLowerCase();

            let textContent = titleContent + ' ' + descriptionContent;
            textContent.includes(value.toLowerCase()) ? item.style.display = 'block' : item.style.display = 'none';
        });
    } else {
        let list = document.getElementById(`${searchType}List`).getElementsByTagName('article');
        _.forEach(list, (item) => {
            item.style.display = 'block';
        });
    }
}

const searchBar = document.getElementById("searchBar")

if(searchBar)
    searchBar.addEventListener("keydown", event => {
        if (event.key === 'Enter') {
            const searchBar = document.getElementById("searchBar");
            const searchType = searchBar.dataset.searchType;
            const value = searchBar.value;

            search(value, searchType, true);
        }
    });