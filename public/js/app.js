// Main application controller for the welcome flow
class AppController {
    constructor() {
        this.config = {
            apiUrl: '/.netlify/functions',
            version: '1.0.0',
            features: {
                multiplayer: true,
                analytics: false,
                soundEnabled: true
            }
        };

        this.user = null;
        this.gameState = {
            currentLevel: 1,
            score: 0,
            achievements: [],
            preferences: {}
        };

        this.init();
    }

    async init() {
        try {
            this.setupGlobalEventListeners();
            this.checkExistingUser();
            this.initializeComponents();
            this.setupErrorHandling();
            this.loadUserPreferences();
            
            console.log('🎮 Aprenda Brincando iniciado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            this.handleInitializationError(error);
        }
    }

    checkExistingUser() {
        const userData = localStorage.getItem('userData');
        const isRegistered = localStorage.getItem('userRegistered');

        if (userData && isRegistered === 'true') {
            try {
                this.user = JSON.parse(userData);
                
                // Check if we should redirect to main game
                if (window.location.pathname.includes('welcome.html')) {
                    this.showReturningUserDialog();
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                localStorage.removeItem('userData');
                localStorage.removeItem('userRegistered');
            }
        }
    }

    showReturningUserDialog() {
        if (!this.user) return;

        const dialog = this.createDialog({
            title: `Olá de novo, ${this.user.name}!`,
            content: `
                <div class="returning-user-content">
                    <img src="images/avatars/${this.user.avatar?.id || 'student1'}.svg" 
                         alt="${this.user.avatar?.name || 'Avatar'}" 
                         width="80" height="80">
                    <p>Que bom te ver novamente! Quer continuar de onde parou?</p>
                </div>
            `,
            buttons: [
                {
                    text: 'Continuar Jogando',
                    class: 'btn-primary',
                    action: () => {
                        window.location.href = 'index.html';
                    }
                },
                {
                    text: 'Novo Cadastro',
                    class: 'btn-secondary',
                    action: () => {
                        this.resetUserData();
                        dialog.close();
                    }
                }
            ]
        });

        dialog.show();
    }

    initializeComponents() {
        // Initialize sound controller if available
        if (typeof SoundController !== 'undefined') {
            this.soundController = new SoundController();
        }

        // Initialize analytics if enabled
        if (this.config.features.analytics) {
            this.initializeAnalytics();
        }

        // Setup theme controller
        this.setupThemeController();
    }

    setupGlobalEventListeners() {
        // Handle registration completion
        document.addEventListener('registrationComplete', (e) => {
            this.handleRegistrationComplete(e.detail);
        });

        // Handle avatar selection
        document.addEventListener('avatarSelected', (e) => {
            this.handleAvatarSelection(e.detail);
        });

        // Handle form validation
        document.addEventListener('formValidation', (e) => {
            this.handleFormValidation(e.detail);
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });

        // Handle visibility changes (for pausing games)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle online/offline status
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
    }

    handleRegistrationComplete(userData) {
        this.user = userData;
        this.saveUserData(userData);
        
        // Initialize user preferences
        this.gameState.preferences = userData.preferences || {};
        
        // Track registration event
        this.trackEvent('user_registered', {
            age: userData.age,
            avatar: userData.avatar?.id,
            preferences: userData.preferences?.subjects?.length || 0
        });
    }

    handleAvatarSelection(avatar) {
        // Play selection sound
        if (this.soundController) {
            this.soundController.play('select');
        }

        // Update UI feedback
        this.showSelectionFeedback(`Você escolheu ${avatar.name}!`);
    }

    handleFormValidation(validation) {
        // Update global validation state
        this.formValidationState = validation;
        
        // Enable/disable next buttons
        this.updateNavigationButtons();
    }

    handleGlobalKeyboard(e) {
        // Handle escape key for closing dialogs
        if (e.key === 'Escape') {
            const openDialog = document.querySelector('.dialog.show');
            if (openDialog) {
                this.closeDialog(openDialog);
            }
        }

        // Handle enter key for form submission
        if (e.key === 'Enter' && e.ctrlKey) {
            const submitBtn = document.querySelector('.btn-primary:not(:disabled)');
            if (submitBtn && submitBtn.offsetParent !== null) {
                submitBtn.click();
            }
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, pause any running games
            document.dispatchEvent(new CustomEvent('pauseGame'));
        } else {
            // Page is visible, resume games
            document.dispatchEvent(new CustomEvent('resumeGame'));
        }
    }

    handleConnectionChange(isOnline) {
        const statusBar = this.getOrCreateStatusBar();
        
        if (isOnline) {
            statusBar.classList.remove('offline');
            this.showNotification('Conexão restaurada!', 'success');
        } else {
            statusBar.classList.add('offline');
            this.showNotification('Você está offline. Algumas funcionalidades podem não estar disponíveis.', 'warning');
        }
    }

    setupThemeController() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(savedTheme);

        // Setup theme toggle if available
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.applyTheme(newTheme);
            });
        }
    }

    applyTheme(theme) {
        document.body.classList.toggle('dark-theme', theme === 'dark');
        localStorage.setItem('theme', theme);
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
            this.handleError(e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
            this.handleError(e.reason);
        });
    }

    handleError(error) {
        // Don't show error dialog in production for minor errors
        if (process.env.NODE_ENV === 'production' && !error.critical) {
            console.warn('Minor error suppressed in production:', error);
            return;
        }

        this.showErrorDialog({
            title: 'Ops! Algo deu errado',
            message: error.message || 'Ocorreu um erro inesperado.',
            details: error.stack,
            actions: [
                {
                    text: 'Tentar Novamente',
                    action: () => window.location.reload()
                },
                {
                    text: 'Continuar',
                    action: () => this.closeErrorDialog()
                }
            ]
        });
    }

    handleInitializationError(error) {
        document.body.innerHTML = `
            <div class="initialization-error">
                <div class="error-content">
                    <h1>😔 Ops! Não conseguimos carregar o jogo</h1>
                    <p>Algo deu errado durante a inicialização. Que tal tentar novamente?</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        Tentar Novamente
                    </button>
                </div>
            </div>
        `;
    }

    // Utility methods
    saveUserData(userData) {
        try {
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('userRegistered', 'true');
            localStorage.setItem('lastLogin', new Date().toISOString());
        } catch (error) {
            console.error('Erro ao salvar dados do usuário:', error);
        }
    }

    loadUserPreferences() {
        try {
            const preferences = localStorage.getItem('gamePreferences');
            if (preferences) {
                this.gameState.preferences = { ...this.gameState.preferences, ...JSON.parse(preferences) };
            }
        } catch (error) {
            console.error('Erro ao carregar preferências:', error);
        }
    }

    resetUserData() {
        localStorage.removeItem('userData');
        localStorage.removeItem('userRegistered');
        localStorage.removeItem('gamePreferences');
        localStorage.removeItem('gameProgress');
        
        this.user = null;
        this.gameState = {
            currentLevel: 1,
            score: 0,
            achievements: [],
            preferences: {}
        };
    }

    // UI Helper methods
    createDialog({ title, content, buttons = [] }) {
        const dialog = document.createElement('div');
        dialog.className = 'dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay"></div>
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>${title}</h3>
                    <button class="dialog-close">×</button>
                </div>
                <div class="dialog-body">
                    ${content}
                </div>
                <div class="dialog-footer">
                    ${buttons.map(btn => `
                        <button class="btn ${btn.class || 'btn-secondary'}" data-action="${btn.text}">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = dialog.querySelector('.dialog-close');
        const overlay = dialog.querySelector('.dialog-overlay');
        
        closeBtn.addEventListener('click', () => this.closeDialog(dialog));
        overlay.addEventListener('click', () => this.closeDialog(dialog));

        buttons.forEach(btn => {
            const buttonEl = dialog.querySelector(`[data-action="${btn.text}"]`);
            if (buttonEl && btn.action) {
                buttonEl.addEventListener('click', btn.action);
            }
        });

        return {
            element: dialog,
            show: () => {
                document.body.appendChild(dialog);
                setTimeout(() => dialog.classList.add('show'), 10);
            },
            close: () => this.closeDialog(dialog)
        };
    }

    closeDialog(dialog) {
        dialog.classList.remove('show');
        setTimeout(() => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
        }, 300);
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const container = this.getOrCreateNotificationContainer();
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    showSelectionFeedback(message) {
        this.showNotification(message, 'success', 2000);
    }

    getOrCreateNotificationContainer() {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }

    getOrCreateStatusBar() {
        let statusBar = document.getElementById('statusBar');
        if (!statusBar) {
            statusBar = document.createElement('div');
            statusBar.id = 'statusBar';
            statusBar.className = 'status-bar';
            document.body.appendChild(statusBar);
        }
        return statusBar;
    }

    // Analytics methods
    trackEvent(eventName, properties = {}) {
        if (!this.config.features.analytics) return;
        
        const event = {
            name: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                userId: this.user?.id,
                version: this.config.version
            }
        };
        
        console.log('📊 Event tracked:', event);
        
        // Send to analytics service (implement as needed)
        // this.sendAnalyticsEvent(event);
    }

    // Performance monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`⏱️ ${name} took ${(end - start).toFixed(2)} milliseconds`);
        
        return result;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.appController = new AppController();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppController;
}