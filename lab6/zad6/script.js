const newPasswordInput = document.getElementById('new-password');
const repeatPasswordInput = document.getElementById('repeat-password');
const requirements = {
    minLength: document.getElementById('min-length'),
    specialChar: document.getElementById('special-char'),
    uppercase: document.getElementById('uppercase'),
    digit: document.getElementById('digit')
};
const matchError = document.getElementById('match-error');

function updateRequirements() {
    const value = newPasswordInput.value;
    requirements.minLength.classList.toggle('valid', value.length >= 8);
    requirements.specialChar.classList.toggle('valid', /[!@#$%^&*(),.?":{}|<>]/.test(value));
    requirements.uppercase.classList.toggle('valid', /[A-Z]/.test(value));
    requirements.digit.classList.toggle('valid', /\d/.test(value));
}

function checkMatch(event) {
    if (event.key === 'Enter') {
        if (newPasswordInput.value !== repeatPasswordInput.value) {
            matchError.style.display = 'block';
        } else {
            matchError.style.display = 'none';
            alert('Hasło zostało pomyślnie zmienione');
        }
    }
}

function togglePasswordVisibility(input, toggle) {
    toggle.addEventListener('click', () => {
        const type = input.type === 'password' ? 'text' : 'password';
        const eyeEmote = '👁️';
        const personEmote = '👤';
        input.type = type;
        toggle.textContent = type === 'password' ? eyeEmote : personEmote;
    });
}

newPasswordInput.addEventListener('input', updateRequirements);
repeatPasswordInput.addEventListener('keydown', checkMatch);
togglePasswordVisibility(newPasswordInput, document.getElementById('toggle-new-password'));
togglePasswordVisibility(repeatPasswordInput, document.getElementById('toggle-repeat-password'));
