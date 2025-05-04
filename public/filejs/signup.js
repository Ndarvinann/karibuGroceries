
// Password toggle functionality
const togglePassword = (inputId, buttonId) => {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(buttonId).querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
    } else {
        input.type = 'password';
        icon.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
    }
};

document.getElementById('togglePassword').addEventListener('click', () => togglePassword('password', 'togglePassword'));
document.getElementById('toggleConfirmPassword').addEventListener('click', () => togglePassword('confirmPassword', 'toggleConfirmPassword'));

// Form validation
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.getElementById('error').textContent = '';
    
    // Validate form fields
    const validateField = (fieldId, errorId, validationFn, errorMsg) => {
        const value = document.getElementById(fieldId).value.trim();
        if (!validationFn(value)) {
            document.getElementById(errorId).textContent = errorMsg;
            return false;
        }
        return true;
    };
    
    const validations = [
        { field: 'firstName', error: 'firstNameError', fn: v => !!v, msg: 'Required' },
        { field: 'lastName', error: 'lastNameError', fn: v => !!v, msg: 'Required' },
        { field: 'email', error: 'emailError', fn: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Invalid email' },
        { field: 'phone', error: 'phoneError', fn: v => /^[0-9]{10,15}$/.test(v), msg: 'Invalid phonenumber ' },
        { field: 'role', error: 'roleError', fn: v => !!v, msg: 'Select role' },
        { field: 'password', error: 'passwordError', fn: v => v.length >= 8, msg: 'Min 8 chars' },
        { field: 'confirmPassword', error: 'confirmPasswordError', fn: v => v === document.getElementById('password').value, msg: 'Must match' }
    ];
    
    const isValid = validations.every(({field, error, fn, msg}) => 
        validateField(field, error, fn, msg)
    );
    
    if (isValid) {
        const role = document.getElementById('role').value;
        alert(`Account created as ${role.replace('_', ' ').toUpperCase()}!`);
        // Form submission would go here
    }
});