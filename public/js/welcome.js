// Welcome page functionality
class WelcomeManager {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 4;
        this.selectedAvatar = null;
        this.formData = {
            name: '',
            age: '',
            avatar: null,
            preferences: []
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startFloatingAnimation();
        this.showStep(1);
    }

    setupEventListeners() {
        // Start button
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.showRegistration());
        }

        // Form navigation
        const nextBtns = document.querySelectorAll('.next-btn');
        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });

        const prevBtns = document.querySelectorAll('.prev-btn');
        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });

        // Form inputs
        document.getElementById('userName').addEventListener('input', (e) => {
            this.formData.name = e.target.value;
            this.validateStep();
        });

        document.getElementById('userAge').addEventListener('change', (e) => {
            this.formData.age = e.target.value;
            this.validateStep();
        });

        // Avatar selection will be handled by AvatarManager
        document.addEventListener('avatarSelected', (e) => {
            this.formData.avatar = e.detail;
            this.selectedAvatar = e.detail;
            this.validateStep();
        });

        // Final submission
        const submitBtn = document.getElementById('submitRegistration');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitRegistration());
        }
    }

    showRegistration() {
        const hero = document.getElementById('hero');
        const registration = document.getElementById('registration');
        
        hero.style.transform = 'translateY(-100%)';
        hero.style.opacity = '0';
        
        setTimeout(() => {
            hero.style.display = 'none';
            registration.style.display = 'block';
            registration.classList.add('fade-in');
        }, 500);
    }

    showStep(stepNumber) {
        // Hide all steps
        for (let i = 1; i <= this.maxSteps; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                step.style.display = 'none';
                step.classList.remove('active');
            }
        }

        // Show current step
        const currentStepEl = document.getElementById(`step${stepNumber}`);
        if (currentStepEl) {
            currentStepEl.style.display = 'block';
            currentStepEl.classList.add('active');
        }

        // Update progress bar
        this.updateProgressBar();
        
        // Update current step
        this.currentStep = stepNumber;
        
        // Validate current step
        this.validateStep();
    }

    nextStep() {
        if (this.currentStep < this.maxSteps && this.isCurrentStepValid()) {
            this.showStep(this.currentStep + 1);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    updateProgressBar() {
        const progress = (this.currentStep / this.maxSteps) * 100;
        const progressBar = document.querySelector('.progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // Update step indicators
        const indicators = document.querySelectorAll('.step-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                indicator.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                indicator.classList.add('active');
            }
        });
    }

    isCurrentStepValid() {
        switch (this.currentStep) {
            case 1:
                return this.formData.name && this.formData.name.length >= 2;
            case 2:
                return this.formData.age && this.formData.age >= 6 && this.formData.age <= 16;
            case 3:
                return this.formData.avatar !== null;
            case 4:
                return true; // Preferences are optional
            default:
                return false;
        }
    }

    validateStep() {
        const nextBtn = document.querySelector(`#step${this.currentStep} .next-btn`);
        const submitBtn = document.getElementById('submitRegistration');
        
        if (this.currentStep === this.maxSteps) {
            if (submitBtn) {
                submitBtn.disabled = !this.isCurrentStepValid();
            }
        } else {
            if (nextBtn) {
                nextBtn.disabled = !this.isCurrentStepValid();
            }
        }
    }

    async submitRegistration() {
        const loadingScreen = document.getElementById('loadingScreen');
        const registration = document.getElementById('registration');
        
        // Show loading screen
        registration.style.display = 'none';
        loadingScreen.style.display = 'flex';
        
        try {
            // Simulate registration process
            await this.animateLoading();
            
            // Save user data
            this.saveUserData();
            
            // Redirect to main game
            this.redirectToGame();
            
        } catch (error) {
            console.error('Registration failed:', error);
            this.showError('Ops! Algo deu errado. Tente novamente.');
        }
    }

    async animateLoading() {
        const messages = [
            'Criando seu perfil...',
            'Preparando seu avatar...',
            'Configurando jogos...',
            'Quase pronto!'
        ];
        
        const loadingText = document.querySelector('.loading-text');
        
        for (let i = 0; i < messages.length; i++) {
            loadingText.textContent = messages[i];
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    saveUserData() {
        const userData = {
            ...this.formData,
            registrationDate: new Date().toISOString(),
            id: this.generateUserId()
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userRegistered', 'true');
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    redirectToGame() {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--error-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
            // Return to registration
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('registration').style.display = 'block';
        }, 3000);
    }

    startFloatingAnimation() {
        const floatingAvatars = document.querySelectorAll('.floating-avatar');
        floatingAvatars.forEach((avatar, index) => {
            // Random animation delay and duration
            const delay = Math.random() * 2;
            const duration = 3 + Math.random() * 2;
            
            avatar.style.animationDelay = `${delay}s`;
            avatar.style.animationDuration = `${duration}s`;
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WelcomeManager();
});