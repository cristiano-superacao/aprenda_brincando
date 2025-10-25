// Registration form management and validation
class RegistrationManager {
    constructor() {
        this.validationRules = {
            name: {
                required: true,
                minLength: SystemConfig.gameConfig.validation.nameMinLength,
                maxLength: SystemConfig.gameConfig.validation.nameMaxLength,
                pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
                message: `Nome deve ter entre ${SystemConfig.gameConfig.validation.nameMinLength}-${SystemConfig.gameConfig.validation.nameMaxLength} caracteres e conter apenas letras`
            },
            age: {
                required: true,
                min: SystemConfig.gameConfig.validation.minAge,
                max: SystemConfig.gameConfig.validation.maxAge,
                message: `A idade deve estar entre ${SystemConfig.gameConfig.validation.minAge} e ${SystemConfig.gameConfig.validation.maxAge} anos`
            }
        };

        this.preferences = {
            subjects: SystemConfig.subjects,
            difficulties: SystemConfig.difficulties
        };

        this.selectedPreferences = {
            subjects: [],
            difficulty: null
        };

        this.init();
    }

    init() {
        this.setupValidation();
        this.setupPreferences();
        this.setupFormInteractions();
    }

    setupValidation() {
        const nameInput = document.getElementById('userName');
        const ageInput = document.getElementById('userAge');

        if (nameInput) {
            nameInput.addEventListener('input', (e) => this.validateName(e.target));
            nameInput.addEventListener('blur', (e) => this.validateName(e.target));
        }

        if (ageInput) {
            ageInput.addEventListener('change', (e) => this.validateAge(e.target));
            ageInput.addEventListener('blur', (e) => this.validateAge(e.target));
        }
    }

    setupPreferences() {
        this.renderSubjectPreferences();
        this.renderDifficultyPreferences();
    }

    renderSubjectPreferences() {
        const container = document.getElementById('subjectPreferences');
        if (!container) return;

        container.innerHTML = `
            <h4>Quais matérias você mais gosta?</h4>
            <p class="preference-subtitle">Escolha até 3 matérias que mais te interessam</p>
            <div class="preferences-grid">
                ${this.preferences.subjects.map(subject => `
                    <div class="preference-card" data-preference-id="${subject.id}" style="border-color: ${subject.color}20;">
                        <div class="preference-icon" style="color: ${subject.color};">${subject.icon}</div>
                        <div class="preference-name">${subject.name}</div>
                        <div class="preference-check">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners
        container.addEventListener('click', (e) => {
            const preferenceCard = e.closest('.preference-card');
            if (preferenceCard) {
                this.toggleSubjectPreference(preferenceCard.dataset.preferenceId);
            }
        });
    }

    renderDifficultyPreferences() {
        const container = document.getElementById('difficultyPreference');
        if (!container) return;

        container.innerHTML = `
            <h4>Qual nível de desafio você prefere?</h4>
            <p class="preference-subtitle">Não se preocupe, você pode mudar isso depois!</p>
            <div class="difficulty-options">
                ${this.preferences.difficulties.map(difficulty => `
                    <div class="difficulty-card" data-difficulty="${difficulty.id}" style="border-color: ${difficulty.color};">
                        <div class="difficulty-header">
                            <h5 style="color: ${difficulty.color};">${difficulty.name}</h5>
                            <div class="difficulty-indicator">
                                ${'⭐'.repeat(difficulty.stars)}
                            </div>
                        </div>
                        <p class="difficulty-description">${difficulty.description}</p>
                        <div class="selection-indicator">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners
        container.addEventListener('click', (e) => {
            const difficultyCard = e.closest('.difficulty-card');
            if (difficultyCard) {
                this.selectDifficulty(difficultyCard.dataset.difficulty);
            }
        });
    }

    getDifficultyIndicator(difficulty) {
        const difficultyConfig = SystemConfig.getDifficultyById(difficulty);
        return difficultyConfig ? '⭐'.repeat(difficultyConfig.stars) : '⭐';
    }

    validateName(input) {
        const value = input.value.trim();
        const rule = this.validationRules.name;
        let isValid = true;
        let message = '';

        if (rule.required && !value) {
            isValid = false;
            message = 'Nome é obrigatório';
        } else if (value && value.length < rule.minLength) {
            isValid = false;
            message = `Nome deve ter pelo menos ${rule.minLength} caracteres`;
        } else if (value && value.length > rule.maxLength) {
            isValid = false;
            message = `Nome não pode ter mais de ${rule.maxLength} caracteres`;
        } else if (value && !rule.pattern.test(value)) {
            isValid = false;
            message = 'Nome deve conter apenas letras e espaços';
        }

        this.showValidationFeedback(input, isValid, message);
        return isValid;
    }

    validateAge(input) {
        const value = parseInt(input.value);
        const rule = this.validationRules.age;
        let isValid = true;
        let message = '';

        if (rule.required && !value) {
            isValid = false;
            message = 'Idade é obrigatória';
        } else if (value && (value < rule.min || value > rule.max)) {
            isValid = false;
            message = rule.message;
        }

        this.showValidationFeedback(input, isValid, message);
        
        // Update avatar recommendations based on age
        if (isValid && window.avatarManager) {
            window.avatarManager.highlightRecommended(value);
        }

        return isValid;
    }

    showValidationFeedback(input, isValid, message) {
        const container = input.closest('.input-group');
        if (!container) return;

        // Remove existing feedback
        const existingFeedback = container.querySelector('.validation-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Update input styling
        input.classList.remove('valid', 'invalid');
        if (input.value) {
            input.classList.add(isValid ? 'valid' : 'invalid');
        }

        // Add feedback message if invalid
        if (!isValid && message) {
            const feedback = document.createElement('div');
            feedback.className = 'validation-feedback error';
            feedback.textContent = message;
            container.appendChild(feedback);
        }
    }

    toggleSubjectPreference(subjectId) {
        const card = document.querySelector(`[data-preference-id="${subjectId}"]`);
        if (!card) return;

        const isSelected = this.selectedPreferences.subjects.includes(subjectId);
        const maxSelections = 3;

        if (isSelected) {
            // Remove selection
            this.selectedPreferences.subjects = this.selectedPreferences.subjects.filter(id => id !== subjectId);
            card.classList.remove('selected');
        } else if (this.selectedPreferences.subjects.length < SystemConfig.gameConfig.validation.maxSubjectSelections) {
            // Add selection
            this.selectedPreferences.subjects.push(subjectId);
            card.classList.add('selected');
        } else {
            // Show limit message
            this.showPreferenceLimitMessage();
            return;
        }

        // Update counter
        this.updatePreferenceCounter();
    }

    selectDifficulty(difficulty) {
        // Remove previous selection
        const previousSelected = document.querySelector('.difficulty-card.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        // Add new selection
        const card = document.querySelector(`[data-difficulty="${difficulty}"]`);
        if (card) {
            card.classList.add('selected');
            this.selectedPreferences.difficulty = difficulty;
        }
    }

    showPreferenceLimitMessage() {
        const maxSelections = SystemConfig.gameConfig.validation.maxSubjectSelections;
        const message = document.createElement('div');
        message.className = 'preference-limit-message';
        message.textContent = `Você pode escolher no máximo ${maxSelections} matérias!`;
        
        const container = document.getElementById('subjectPreferences');
        container.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, SystemConfig.gameConfig.notificationDuration);
    }

    updatePreferenceCounter() {
        const counter = document.getElementById('preferenceCounter');
        if (counter) {
            const selected = this.selectedPreferences.subjects.length;
            const max = SystemConfig.gameConfig.validation.maxSubjectSelections;
            counter.textContent = `${selected}/${max} selecionadas`;
        }
    }

    setupFormInteractions() {
        // Add smooth focus transitions
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', (e) => {
                e.target.parentElement.classList.remove('focused');
            });
        });

        // Add character counter for name input
        const nameInput = document.getElementById('userName');
        if (nameInput) {
            this.addCharacterCounter(nameInput);
        }
    }

    addCharacterCounter(input) {
        const maxLength = this.validationRules.name.maxLength;
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        
        const updateCounter = () => {
            const current = input.value.length;
            counter.textContent = `${current}/${maxLength}`;
            counter.classList.toggle('warning', current > maxLength * 0.8);
        };

        input.addEventListener('input', updateCounter);
        input.parentElement.appendChild(counter);
        updateCounter();
    }

    getFormData() {
        return {
            name: document.getElementById('userName')?.value || '',
            age: parseInt(document.getElementById('userAge')?.value) || null,
            preferences: this.selectedPreferences
        };
    }

    validateAllFields() {
        const nameInput = document.getElementById('userName');
        const ageInput = document.getElementById('userAge');

        let isValid = true;

        if (nameInput) {
            isValid = this.validateName(nameInput) && isValid;
        }

        if (ageInput) {
            isValid = this.validateAge(ageInput) && isValid;
        }

        return isValid;
    }

    // Method to reset form
    resetForm() {
        const form = document.getElementById('registrationForm');
        if (form) {
            form.reset();
        }
        
        this.selectedPreferences = {
            subjects: [],
            difficulty: null
        };

        // Remove all selections
        document.querySelectorAll('.preference-card.selected, .difficulty-card.selected').forEach(card => {
            card.classList.remove('selected');
        });

        // Clear validation feedback
        document.querySelectorAll('.validation-feedback').forEach(feedback => {
            feedback.remove();
        });

        document.querySelectorAll('input.valid, input.invalid').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
    }
}

// Initialize registration manager
document.addEventListener('DOMContentLoaded', () => {
    window.registrationManager = new RegistrationManager();
});