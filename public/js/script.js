const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#account_password');

    togglePassword.addEventListener('click', function (e) {
        e.preventDefault(); 
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? 'Show Password' : 'Hide Password';
    });

document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener("input", function () {
            if (input.checkValidity()) {
                input.classList.remove("invalid");
                input.classList.add("valid");
            } else {
                input.classList.remove("valid");
                input.classList.add("invalid");
            }
        });
    });
});



function validateForm() {
    const fields = ['inv_make', 'inv_model', 'inv_year', 'inv_description', 'inv_price', 'inv_miles', 'inv_color', 'classification_id'];
    for (let field of fields) {
        const value = document.getElementById(field).value.trim();
        if (!value) {
            alert(`The ${field.replace('inv_', '').replace('_', ' ')} field is required.`);
            return false;
        }
    }
    return true;
}