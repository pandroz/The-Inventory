document.addEventListener('DOMContentLoaded', function () {

    // Password Toggle Functionality
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    togglePassword?.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle icon
        const icon = this.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });

    // Form Validation and Submission
    const loginForm = document.getElementById('loginForm');

    loginForm?.addEventListener('submit', function (e) {
        const email = document.getElementById('username_or_email').value.trim();
        const password = document.getElementById('password').value;

        // Basic validation
        if (!email || !password) {
            alert('Per favore, compila tutti i campi obbligatori.');
            return false;
        }

        // Email format validation (if @ is present)
        if (email.includes('@') && !isValidEmail(email)) {
            alert('Per favore, inserisci un indirizzo email valido.');
            return false;
        }

        // Add loading state
        const submitBtn = this.querySelector('.btn-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Accesso in corso...';

        // Handle Remember Me
        const rememberMe = document.getElementById('rememberMe').checked;
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        this.submit();
    });

    // Email validation helper
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Remember Me - Load saved email if exists
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const emailInput = document.getElementById('username_or_email');

    if (localStorage.getItem('rememberedEmail')) {
        emailInput.value = localStorage.getItem('rememberedEmail');
        rememberMeCheckbox.checked = true;
    }

    // Social Login Button
    const googleBtn = document.querySelector('.btn-social');
    googleBtn?.addEventListener('click', function () {
        // Implement Google OAuth here
        console.log('Google login clicked');
        // window.location.href = '/auth/google';
    });
});