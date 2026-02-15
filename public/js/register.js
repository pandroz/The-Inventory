document.addEventListener("DOMContentLoaded", function () {

    // Password Toggle Functionality (Password)
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    togglePassword?.addEventListener("click", function () {
        togglePasswordVisibility(passwordInput, this);
    });

    // Password Toggle Functionality (Confirm Password)
    const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    toggleConfirmPassword?.addEventListener("click", function () {
        togglePasswordVisibility(confirmPasswordInput, this);
    });

    function togglePasswordVisibility(input, button) {
        const type = input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);

        const icon = button.querySelector("i");
        if (type === "password") {
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        } else {
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        }
    }

    // Password Strength Checker
    passwordInput?.addEventListener("input", function () {
        const password = this.value;
        const strengthBar = document.getElementById("strengthBar");
        const strengthText = document.getElementById("strengthText");

        const strength = calculatePasswordStrength(password);

        // Remove all classes
        strengthBar.className = "strength-bar-fill";
        strengthText.className = "strength-text";

        if (password.length === 0) {
            strengthText.textContent = "Inserisci una password";
        } else if (strength.score === 1) {
            strengthBar.classList.add("weak");
            strengthText.classList.add("weak");
            strengthText.textContent = "Debole - " + strength.feedback;
        } else if (strength.score === 2) {
            strengthBar.classList.add("medium");
            strengthText.classList.add("medium");
            strengthText.textContent = "Media - " + strength.feedback;
        } else if (strength.score === 3) {
            strengthBar.classList.add("strong");
            strengthText.classList.add("strong");
            strengthText.textContent = "Forte - Password sicura!";
        }
    });

    function calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        // Feedback
        if (password.length < 8) feedback.push("usa almeno 8 caratteri");
        if (!/[A-Z]/.test(password)) feedback.push("aggiungi maiuscole");
        if (!/\d/.test(password)) feedback.push("aggiungi numeri");
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) feedback.push("aggiungi simboli");

        const finalScore = Math.min(3, Math.floor(score / 2));

        return {
            score: finalScore,
            feedback: feedback.slice(0, 2).join(", "),
        };
    }

    // Password Match Checker
    confirmPasswordInput?.addEventListener("input", function () {
        checkPasswordMatch();
    });

    passwordInput?.addEventListener("input", function () {
        if (confirmPasswordInput.value) {
            checkPasswordMatch();
        }
    });

    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const matchIndicator = document.getElementById("matchIndicator");

        if (confirmPassword.length === 0) {
            matchIndicator.classList.add("d-none");
            return;
        }

        matchIndicator.classList.remove("d-none");
        matchIndicator.className = "form-text match-indicator";

        if (password === confirmPassword) {
            matchIndicator.classList.add("match");
            matchIndicator.innerHTML =
                '<i class="fa-solid fa-check me-1"></i>Le password corrispondono';
        } else {
            matchIndicator.classList.add("no-match");
            matchIndicator.innerHTML =
                '<i class="fa-solid fa-xmark me-1"></i>Le password non corrispondono';
        }
    }

    // Form Validation and Submission
    const registerForm = document.getElementById("registerForm");

    registerForm?.addEventListener("submit", function (e) {
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const termsAccept = document.getElementById("termsAccept").checked;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            alert("Per favore, compila tutti i campi obbligatori.");
            return false;
        }

        // Username validation
        if (username.length < 3) {
            alert("Lo username deve essere di almeno 3 caratteri.");
            document.getElementById("username").focus();
            return false;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            alert("Lo username può contenere solo lettere, numeri e underscore.");
            document.getElementById("username").focus();
            return false;
        }

        // Email validation
        if (!isValidEmail(email)) {
            alert("Per favore, inserisci un indirizzo email valido.");
            document.getElementById("email").focus();
            return false;
        }

        // Password validation
        if (password.length < 8) {
            alert("La password deve essere di almeno 8 caratteri.");
            document.getElementById("password").focus();
            return false;
        }

        // Password match validation
        if (password !== confirmPassword) {
            alert("Le password non corrispondono.");
            document.getElementById("confirmPassword").focus();
            return false;
        }

        // Terms validation
        if (!termsAccept) {
            alert("Devi accettare i Termini e Condizioni per registrarti.");
            return false;
        }

        // Add loading state
        const submitBtn = this.querySelector(".btn-primary");
        const originalText = submitBtn.innerHTML;
        submitBtn.classList.add("loading");
        submitBtn.disabled = true;
        submitBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin me-2"></i>Creazione account...';

        this.submit();
    });

    // Email validation helper
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Social Register Button
    const googleBtn = document.querySelector(".btn-social");
    googleBtn?.addEventListener("click", function () {
        console.log("Google register clicked");
        // window.location.href = '/auth/google';
    });
});
