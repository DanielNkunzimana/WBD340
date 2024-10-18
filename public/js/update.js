const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');

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

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector("#updateForm");
    const updateBtn = document.querySelector("#updateButton");
    const initialData = new FormData(form);

    const isFormChanged = () => {
        const currentData = new FormData(form);
        for (let [key, value] of initialData.entries()) {
            if (currentData.get(key) !== value) {
                return true;
            }
        }
        return false;
    };

    form.addEventListener("input", function() {
        if (isFormChanged()) {
            updateBtn.removeAttribute("disabled");
        } else {
            updateBtn.setAttribute("disabled", "true");
        }
    });
});