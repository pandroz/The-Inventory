console.log('Inventory loaded');

function changeImg(input) {
    console.log('Change image', input.value);

    document.getElementById('previewImage').src = input.value;
    return true;
}