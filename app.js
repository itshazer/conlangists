import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    let contentText = {};
    let currentLanguage = new URLSearchParams(window.location.search).get('lang') || localStorage.getItem('language') || 'en';

    async function loadLanguage(lang) {
        const response = await fetch(`./lang/${lang}.json`);
        contentText = await response.json();
        loadPageContent();
    }

    function loadPageContent() {
        const sidebarContent = document.querySelector('.sidebar-content ul');
        sidebarContent.innerHTML = '';

        if (auth.currentUser) {
            sidebarContent.innerHTML = `
                <li><a id="sidebar-home" href="#">${contentText.sidebar.home}</a></li>
                <li><a id="sidebar-explore" href="#">${contentText.sidebar.explore}</a></li>
                <li><a id="sidebar-notifications" href="#">${contentText.sidebar.notifications}</a></li>
                <li><a id="sidebar-messages" href="#">${contentText.sidebar.messages}</a></li>
                <li><a id="sidebar-profile" href="#">${contentText.sidebar.profile}</a></li>
                <li><a id="sidebar-settings" href="#">${contentText.sidebar.settings}</a></li>
            `;
        } else {
            sidebarContent.innerHTML = `
                <li><a id="sidebar-login" href="#">${contentText.sidebar.login}</a></li>
                <li><a id="sidebar-signup" href="#">${contentText.sidebar.signup}</a></li>
            `;

            document.getElementById('sidebar-login').addEventListener('click', showLoginForm);
            document.getElementById('sidebar-signup').addEventListener('click', showSignupForm);
        }

        document.getElementById('main-title').textContent = contentText.main.title;
        document.getElementById('main-homepage-text').textContent = contentText.main.homepageText;
        document.getElementById('main-updates-text').textContent = contentText.main.updatesText;
    }

    function toggleAuthSection(visible) {
        document.getElementById('middle-section').style.display = visible ? 'none' : 'block';
        document.getElementById('auth-section').style.display = visible ? 'block' : 'none';
    }

    function showLoginForm() {
        const authContainer = document.getElementById('auth-section');
        authContainer.innerHTML = `
            <input type="email" id="login-email" placeholder="${contentText.main.loginForm.email}">
            <small id="login-email-error" class="error-text-small"></small>
            <input type="password" id="login-password" placeholder="${contentText.main.loginForm.password}">
            <small id="login-error" class="error-text-small"></small>
            <button id="login-button">${contentText.main.loginForm.loginBtn}</button>
        `;

        toggleAuthSection(true);

        document.getElementById('login-button').addEventListener('click', () => {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const errorText = document.getElementById('login-error');
            const emailError = document.getElementById('login-email-error');

            emailError.textContent = '';

            if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                emailError.textContent = contentText.signupForm.invalidEmail;
                return;
            }

            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    toggleAuthSection(false);
                    loadPageContent();
                })
                .catch(() => {
                    errorText.textContent = contentText.main.loginForm.invalidCredentials;
                });
        });
    }

    function showSignupForm() {
        const authContainer = document.getElementById('auth-section');
        authContainer.innerHTML = `
            <input type="text" id="signup-name" placeholder="${contentText.main.signupForm.name}">
            <small id="signup-name-error" class="error-text-small"></small>
            <input type="email" id="signup-email" placeholder="${contentText.main.signupForm.email}">
            <small id="signup-email-error" class="error-text-small"></small>
            <input type="password" id="signup-password" placeholder="${contentText.main.signupForm.password}">
            <small id="signup-password-error" class="error-text-small"></small>
            <input type="password" id="signup-confirm-password" placeholder="${contentText.main.signupForm.confirmPassword}">
            <small id="signup-confirm-password-error" class="error-text-small"></small>
            <button id="signup-btn">${contentText.main.signupForm.signupBtn}</button>
        `;

        toggleAuthSection(true);

        const passwordInput = document.getElementById('signup-password');
        const confirmPasswordInput = document.getElementById('signup-confirm-password');
        const passwordError = document.getElementById('signup-password-error');
        const confirmPasswordError = document.getElementById('signup-confirm-password-error');

        passwordInput.addEventListener('input', () => {
            passwordError.textContent = passwordInput.value.length < 8 
                ? contentText.signupForm.passwordTooShort 
                : '';
        });

        confirmPasswordInput.addEventListener('input', () => {
            confirmPasswordError.textContent = passwordInput.value !== confirmPasswordInput.value
                ? contentText.signupForm.passwordMismatch
                : '';
        });

        document.getElementById('signup-btn').addEventListener('click', async () => {
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            const nameError = document.getElementById('signup-name-error');
            const emailError = document.getElementById('signup-email-error');

            nameError.textContent = '';
            emailError.textContent = '';

            if (!name) {
                nameError.textContent = contentText.signupForm.nameRequired;
                return;
            }

            if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                emailError.textContent = contentText.signupForm.invalidEmail;
                return;
            }

            if (password !== confirmPassword) {
                confirmPasswordError.textContent = contentText.signupForm.passwordMismatch;
                return;
            }

            try {
                const usernameCheck = await fetch(`https://example.com/check-username?name=${encodeURIComponent(name)}`);
                const usernameData = await usernameCheck.json();
                if (usernameData.exists) {
                    nameError.textContent = contentText.signupForm.usernameTaken;
                    return;
                }

                await createUserWithEmailAndPassword(auth, email, password);
                const user = auth.currentUser;
                await updateProfile(user, { displayName: name });

                toggleAuthSection(false);
                loadPageContent();
            } catch (err) {
                emailError.textContent = err.message;
            }
        });
    }

    loadLanguage(currentLanguage);

    window.changeLanguage = (lang) => {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        loadLanguage(lang);
    };

    auth.onAuthStateChanged(() => loadPageContent());
});
