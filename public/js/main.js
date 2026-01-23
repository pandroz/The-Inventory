function changeImg(input) {
    console.log('Change image', input.value);

    document.getElementById('previewImage').src = input.value;
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    // document.getElementById('loading').style.display = 'none';
    
});
