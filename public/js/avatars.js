// Avatar selection and management
class AvatarManager {
    constructor() {
        this.avatars = SystemConfig.avatars;
        this.selectedAvatar = null;
        this.init();
    }

    init() {
        this.renderAvatarGrid();
        this.setupEventListeners();
    }

    renderAvatarGrid() {
        const avatarGrid = document.getElementById('avatarGrid');
        if (!avatarGrid) return;

        avatarGrid.innerHTML = '';

        this.avatars.forEach(avatar => {
            const avatarCard = this.createAvatarCard(avatar);
            avatarGrid.appendChild(avatarCard);
        });
    }

    createAvatarCard(avatar) {
        const card = document.createElement('div');
        card.className = 'avatar-card';
        card.dataset.avatarId = avatar.id;

        card.innerHTML = `
            <div class="avatar-image">
                <img src="${avatar.svgPath}" alt="${avatar.name}" loading="lazy">
                <div class="avatar-glow" style="background: ${avatar.color}20;"></div>
            </div>
            <div class="avatar-info">
                <h3 class="avatar-name">${avatar.name}</h3>
                <p class="avatar-personality">${avatar.personality}</p>
                <p class="avatar-description">${avatar.description}</p>
                <div class="avatar-interests">
                    ${avatar.interests.map(interest => `
                        <span class="interest-tag" style="background: ${avatar.color}20; color: ${avatar.color};">
                            ${interest}
                        </span>
                    `).join('')}
                </div>
                ${avatar.price > 0 ? `<div class="avatar-price">${SystemConfig.formatPrice(avatar.price)}</div>` : ''}
            </div>
            <div class="selection-indicator">
                <i class="fas fa-check"></i>
            </div>
        `;

        return card;
    }

    setupEventListeners() {
        const avatarGrid = document.getElementById('avatarGrid');
        if (!avatarGrid) return;

        avatarGrid.addEventListener('click', (e) => {
            const avatarCard = e.closest('.avatar-card');
            if (avatarCard) {
                this.selectAvatar(avatarCard.dataset.avatarId);
            }
        });

        // Add keyboard navigation
        avatarGrid.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const focusedCard = document.activeElement.closest('.avatar-card');
                if (focusedCard) {
                    e.preventDefault();
                    this.selectAvatar(focusedCard.dataset.avatarId);
                }
            }
        });
    }

    selectAvatar(avatarId) {
        // Remove previous selection
        const previousSelected = document.querySelector('.avatar-card.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        // Add selection to new avatar
        const avatarCard = document.querySelector(`[data-avatar-id="${avatarId}"]`);
        if (avatarCard) {
            avatarCard.classList.add('selected');
            
            // Add animation
            avatarCard.style.transform = 'scale(0.95)';
            setTimeout(() => {
                avatarCard.style.transform = '';
            }, 150);

            // Update selected avatar
            this.selectedAvatar = this.avatars.find(avatar => avatar.id === avatarId);
            
            // Dispatch custom event
            document.dispatchEvent(new CustomEvent('avatarSelected', {
                detail: this.selectedAvatar
            }));

            // Show selection feedback
            this.showSelectionFeedback(this.selectedAvatar);
        }
    }

    showSelectionFeedback(avatar) {
        const feedback = document.createElement('div');
        feedback.className = 'selection-feedback';
        feedback.innerHTML = `
            <div class="feedback-content">
                <img src="${avatar.svgPath}" alt="${avatar.name}" width="60" height="60">
                <div class="feedback-text">
                    <h4>Ótima escolha!</h4>
                    <p>Você escolheu ${avatar.name}, ${avatar.personality}!</p>
                </div>
            </div>
        `;
        
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 1rem;
            border-radius: 15px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border-left: 4px solid ${avatar.color};
        `;

        document.body.appendChild(feedback);

        // Animate in
        setTimeout(() => {
            feedback.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            feedback.style.transform = 'translateX(100%)';
            setTimeout(() => {
                feedback.remove();
            }, 300);
        }, 3000);
    }

    getSelectedAvatar() {
        return this.selectedAvatar;
    }

    // Method to filter avatars by interests (for future use)
    filterByInterests(interests) {
        return this.avatars.filter(avatar => 
            avatar.interests.some(interest => 
                interests.includes(interest.toLowerCase())
            )
        );
    }

    // Method to get random avatar suggestion
    getRandomSuggestion() {
        const randomIndex = Math.floor(Math.random() * this.avatars.length);
        return this.avatars[randomIndex];
    }

    // Method to highlight recommended avatars based on age
    highlightRecommended(age) {
        const recommendedIds = SystemConfig.getRecommendedAvatars(age);

        // Remove previous recommendations
        document.querySelectorAll('.avatar-card.recommended').forEach(card => {
            card.classList.remove('recommended');
        });

        // Add recommended class to cards
        recommendedIds.forEach(id => {
            const card = document.querySelector(`[data-avatar-id="${id}"]`);
            if (card) {
                card.classList.add('recommended');
            }
        });
    }
}

// Initialize avatar manager
document.addEventListener('DOMContentLoaded', () => {
    window.avatarManager = new AvatarManager();
});