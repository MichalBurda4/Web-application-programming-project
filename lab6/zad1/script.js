
let totalValue = 0;
let propagationEnabled = true;
let eventOrder = ['blue', 'red', 'yellow'];
const maxValues = { yellow: 50, red: 30 };

const eventHandlers = {
    blue: blueClick,
    red: redClick,
    yellow: yellowClick,
};

const valueDiv = document.getElementById('value');
const output = document.getElementById('output');
const togglePropagationBtn = document.getElementById('togglePropagation');
const resetBtn = document.getElementById('reset');
const changeOrderRadios = document.querySelectorAll('input[name="order"]');
const alertBox = document.getElementById('alertLog');
const clearLogsButton = document.getElementById('clearLogs');

const divElements = {
    blue: document.getElementById('blue'),
    red: document.getElementById('red'),
    yellow: document.getElementById('yellow')
};

// Functions for handling clicks
function blueClick(event) {
    handleEvent(event, "Nacisnąłeś niebieski o wartości 1", 1, 'blue');
}

function redClick(event) {
    handleEvent(event, "Nacisnąłeś czerwony o wartości 2", 2, 'red');
}

function yellowClick(event) {
    handleEvent(event, "Nacisnąłeś żółty o wartości 5", 5, 'yellow');
}


function handleEvent(event, message, value, color) {
    if (!propagationEnabled) event.stopPropagation();
    updateOutput(message);
    logAlert(`+${value}`);
    incrementValue(value, color);
}

function updateOutput(message) {
    output.textContent = message;
}


function incrementValue(value, color) {
    totalValue += value;
    updateScore();


    if (totalValue > maxValues.yellow && color === 'yellow') {
        divElements.yellow.removeEventListener('click', yellowClick);
        logAlert("Zółty wyłączony");
    }
    if (totalValue > maxValues.red && color === 'red') {
        divElements.red.removeEventListener('click', redClick);
        logAlert("Czerwony wyłączony");
    }
}


function updateScore() {
    valueDiv.textContent = totalValue;
}


function logAlert(message) {
    alertBox.innerHTML += `<br/><span>${message}</span>`;
}


function clearLogs() {
    alertBox.innerHTML = '<span>Alerts:</span>';
}

function resetApp() {
    totalValue = 0;
    valueDiv.textContent = totalValue;
    togglePropagationBtn.textContent = 'Stop Propagation';
    propagationEnabled = true;
    output.textContent = "Kliknij na Kwadrat, aby wyświetlić komunikat";

    // Enable all divs and reattach event listeners
    for (let color in divElements) {
        divElements[color].style.pointerEvents = 'auto';
        divElements[color].addEventListener('click', eventHandlers[color]);
    }

    clearLogs();
}

function togglePropagation() {
    propagationEnabled = !propagationEnabled;
    togglePropagationBtn.textContent = propagationEnabled ? 'Stop Propagation' : 'Start Propagation';
}

function setPropagationOrder(order) {
    switch (order) {
        case '[1, 2, 3]':
            eventOrder = ['blue', 'red', 'yellow'];
            break;
        case '[3, 2, 1]':
            eventOrder = ['yellow', 'red', 'blue'];
            break;
        case '[2, 3, 1]':
            eventOrder = ['red', 'yellow', 'blue'];
            break;
        case '[1, 3, 2]':
            eventOrder = ['blue', 'yellow', 'red'];
            break;
    }
    addEventListenersInOrder();
    logAlert(`Propagation order set to ${order.replace(/\[|\]/g, '').replace(/,/g, '-')}`);
}

function addEventListenersInOrder() {
    // Remove existing event listeners
    for (let color in divElements) {
        divElements[color].removeEventListener('click', eventHandlers[color]);
    }
    // Attach event listeners in new order
    eventOrder.forEach(color => {
        divElements[color].addEventListener('click', eventHandlers[color]);
    });
}


addEventListenersInOrder();

togglePropagationBtn.addEventListener('click', togglePropagation);
resetBtn.addEventListener('click', resetApp);
clearLogsButton.addEventListener('click', clearLogs);

changeOrderRadios.forEach((radio) => {
    radio.addEventListener('change', (event) => {
        setPropagationOrder(event.target.value);
    });
});
