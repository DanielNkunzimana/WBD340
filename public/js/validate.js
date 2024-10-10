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

document.addEventListener('DOMContentLoaded', function () {
    const textarea = document.getElementById('inv_description');
    
    textarea.addEventListener("input", function () {
        if (textarea.checkValidity()) {
            textarea.classList.remove("invalid");
            textarea.classList.add("valid");
        } else {
            textarea.classList.remove("valid");
            textarea.classList.add("invalid");
        }
    });
});