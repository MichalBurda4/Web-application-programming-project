const accessKey = 'fhM2yiWuvmyuD6EBYlslJwzxmsdnmieCU3Dwkllh2zc';
const imageRow = document.getElementById('image-row');
let currentImages = [];
let currentIndex = 0;

async function searchImages() {
    const query = document.getElementById('search-input').value;
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=30&client_id=${accessKey}`);
    const data = await response.json();

    currentImages = data.results;
    currentIndex = 0;
    displayImages();
}

function displayImages() {
    imageRow.innerHTML = '';
    for (let i = currentIndex; i < currentIndex + 8 && i < currentImages.length; i++) {
        const img = document.createElement('img');
        img.src = currentImages[i].urls.thumb;
        img.alt = currentImages[i].alt_description || 'Unsplash Image';
        img.onclick = () => openLightbox(currentImages[i].urls.full);
        img.ondblclick = () => openLightbox(currentImages[i].urls.full);
        imageRow.appendChild(img);
    }
}

function scrollImages(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > currentImages.length - 8) currentIndex = currentImages.length - 8;
    displayImages();
}

function openLightbox(src) {
    document.getElementById('lightbox').style.display = 'flex';
    document.getElementById('lightbox-img').src = src;
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}



