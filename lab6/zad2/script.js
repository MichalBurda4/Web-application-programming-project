const addButton = document.getElementById('add-button');
const addItemForm = document.getElementById('add-item-form');
const saveButton = document.getElementById('save-button');
const cancelButton = document.getElementById('cancel-button');
const shoppingList = document.getElementById('shopping-list');
const newItemInput = document.getElementById('new-item');
const highPriorityCheckbox = document.getElementById('high-priority');

let isEditing = false;


function addListItem(text, isHighPriority = false, isPurchased = false) {
    const li = document.createElement('li');
    li.textContent = text;


    if (isHighPriority) {
        li.classList.add('high-priority');
    }


    if (isPurchased) {
        li.classList.add('purchased');
    }

    li.addEventListener('click', () => {
        if (isEditing) {
            li.classList.toggle('purchased');
        }
    });

    shoppingList.appendChild(li);
}

addListItem('Apple'); // Zwykły element
addListItem('Banana', false, true);
addListItem('Cheese', true);

addButton.addEventListener('click', () => {
    addItemForm.style.display = 'block';
    addButton.style.display = 'none';
    newItemInput.value = '';
    highPriorityCheckbox.checked = false;
    isEditing = true;
});


saveButton.addEventListener('click', () => {
    const itemText = newItemInput.value.trim();
    const isHighPriority = highPriorityCheckbox.checked;

    if (itemText) {
        addListItem(itemText, isHighPriority);
        addItemForm.style.display = 'none';
        addButton.style.display = 'inline-block';
        isEditing = false;
    }
});


cancelButton.addEventListener('click', () => {
    addItemForm.style.display = 'none';
    addButton.style.display = 'inline-block';
    isEditing = false;
});
