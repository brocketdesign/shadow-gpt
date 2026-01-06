class AuthManager {
    constructor() {
        this.isRegistering = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
    }

    setupEventListeners() {
        // Login form
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuth(e));
        }

        // Modal close events
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) this.closeLoginModal();
            });
        }
    }

    checkAuthentication() {
        // Ensure page is always visible first
        document.body.style.display = 'block';
        document.body.style.opacity = '1';
        
        fetch('api/auth.php?action=check_auth', {
            credentials: 'same-origin' // Ensure cookies are sent
        })
            .then(response => response.json())
            .then(data => {
                console.log('Auth status:', data);
                if (data.authenticated) {
                    console.log('User authenticated:', data.user);
                    this.currentUser = data.user;
                    this.handleAuthenticatedState(data.user);
                } else {
                    console.log('User not authenticated');
                    this.handleUnauthenticatedState();
                }
            })
            .catch(error => {
                console.error('Auth check error:', error);
                // Even on error, ensure page is visible
                this.handleUnauthenticatedState();
            });
    }

    handleAuthenticatedState(user) {
        this.closeLoginModal();
        
        // Show authenticated content
        const authRequiredElements = document.querySelectorAll('[data-auth-required="true"]');
        authRequiredElements.forEach(el => {
            el.style.display = 'block';
        });
        
        // Hide non-authenticated content
        const nonAuthElements = document.querySelectorAll('[data-auth-required="false"]');
        nonAuthElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Find login buttons and hide them
        const loginButtons = document.querySelectorAll('[onclick*="showLoginModal"]');
        loginButtons.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
        
        console.log('User authenticated, page updated');
    }

    handleUnauthenticatedState() {
        // Hide authenticated content
        const authRequiredElements = document.querySelectorAll('[data-auth-required="true"]');
        authRequiredElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Show non-authenticated content
        const nonAuthElements = document.querySelectorAll('[data-auth-required="false"]');
        nonAuthElements.forEach(el => {
            el.style.display = 'block';
        });
        
        // Show login buttons
        const loginButtons = document.querySelectorAll('[onclick*="showLoginModal"]');
        loginButtons.forEach(btn => {
            if (btn) btn.style.display = 'block';
        });
        
        console.log('User not authenticated, page updated');
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            this.clearAuthForm();
        }
    }

    toggleAuthMode() {
        this.isRegistering = !this.isRegistering;
        const modalTitle = document.getElementById('modalTitle');
        const submitText = document.getElementById('submitText');
        const toggleButton = document.getElementById('toggleButton');
        const nameField = document.getElementById('nameField');
        
        if (this.isRegistering) {
            modalTitle.textContent = 'Inscription';
            submitText.textContent = 'S\'inscrire';
            toggleButton.textContent = 'Déjà un compte ? Se connecter';
            nameField.classList.remove('hidden');
        } else {
            modalTitle.textContent = 'Connexion';
            submitText.textContent = 'Se connecter';
            toggleButton.textContent = 'Pas de compte ? S\'inscrire';
            nameField.classList.add('hidden');
        }
        this.clearAuthForm();
    }

    clearAuthForm() {
        const form = document.getElementById('authForm');
        const message = document.getElementById('authMessage');
        if (form) form.reset();
        if (message) message.classList.add('hidden');
    }

    async handleAuth(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('action', this.isRegistering ? 'register' : 'login');
        formData.append('email', document.getElementById('email').value);
        formData.append('password', document.getElementById('password').value);
        
        if (this.isRegistering) {
            formData.append('name', document.getElementById('name').value);
        }
        
        try {
            const response = await fetch('api/auth.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin' // Ensure cookies are sent and received
            });
            
            const data = await response.json();
            console.log('Auth response:', data);
            
            const messageDiv = document.getElementById('authMessage');
            
            if (messageDiv) {
                messageDiv.classList.remove('hidden');
                
                if (data.success) {
                    messageDiv.className = 'mt-4 p-3 rounded-lg bg-green-100 text-green-800';
                    messageDiv.textContent = this.isRegistering ? 'Compte créé avec succès!' : 'Connexion réussie!';
                    
                    // Update user state and reload page
                    if (data.authenticated && data.user) {
                        this.currentUser = data.user;
                    }
                    
                    // Use direct navigation to avoid caching issues
                    setTimeout(() => {
                        window.location.href = window.location.pathname + '?t=' + new Date().getTime();
                    }, 1000);
                } else {
                    messageDiv.className = 'mt-4 p-3 rounded-lg bg-red-100 text-red-800';
                    messageDiv.textContent = data.message || 'Erreur lors de l\'authentification';
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            const messageDiv = document.getElementById('authMessage');
            if (messageDiv) {
                messageDiv.classList.remove('hidden');
                messageDiv.className = 'mt-4 p-3 rounded-lg bg-red-100 text-red-800';
                messageDiv.textContent = 'Erreur de connexion';
            }
        }
    }

    async logout() {
        try {
            const response = await fetch('api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=logout',
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            if (data.success) {
                this.currentUser = null;
                window.location.reload();
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Global functions for HTML onclick events
function showLoginModal() {
    window.authManager.showLoginModal();
}

function closeLoginModal() {
    window.authManager.closeLoginModal();
}

function toggleAuthMode() {
    window.authManager.toggleAuthMode();
}

function logout() {
    window.authManager.logout();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
});
