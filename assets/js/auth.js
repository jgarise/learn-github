/* 🔐 Authentication Logic */
/* Magic Login functionality for Group Mission Workflow */

class AuthManager {
    constructor() {
        this.form = null;
        this.input = null;
        this.submitButton = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        this.form = document.getElementById('magicLoginForm');
        this.input = document.getElementById('accessCode');
        this.submitButton = this.form?.querySelector('button[type="submit"]');

        if (!this.form || !this.input) {
            console.error('Login form elements not found');
            return;
        }

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleLogin(e));

        // Input validation on typing
        this.input.addEventListener('input', Utils.debounce((e) => this.validateInput(e), 300));

        // Enter key support
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleLogin(e);
            }
        });

        // Auto-focus input
        this.input.focus();

        // Check for existing session
        this.checkExistingSession();
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const accessCode = this.input.value.trim();
        
        if (!accessCode) {
            this.showInputError('กรุณาใส่รหัสเข้าใช้งาน');
            return;
        }

        // Show loading
        Utils.showLoading(true, 'กำลังตรวจสอบรหัส...');
        this.setButtonLoading(true);

        try {
            // Simulate API delay for better UX
            await this.delay(1500);
            
            // Validate access code
            const userData = Utils.validateAccessCode(accessCode);
            
            if (!userData) {
                throw new Error('รหัสไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
            }

            // Save session
            Utils.saveUserSession({
                ...userData,
                loginTime: new Date().toISOString(),
                sessionId: Utils.generateId()
            });

            // Success animation
            this.showSuccessAnimation();
            
            // Redirect based on user type
            await this.delay(1000);
            this.redirectUser(userData);

        } catch (error) {
            Utils.showLoading(false);
            this.setButtonLoading(false);
            this.showInputError(error.message);
        }
    }

    validateInput(event) {
        const value = event.target.value.trim();
        
        // Clear previous error states
        this.clearInputError();
        
        if (value.length === 0) {
            return;
        }

        // Basic format validation
        if (value.length < 6) {
            this.showInputHint('รหัสต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        // Check if it matches expected patterns
        const isGroupCode = /^GROUP\d{3}$/i.test(value);
        const isAdminCode = /^ADMIN\d{3}$/i.test(value);
        
        if (!isGroupCode && !isAdminCode) {
            this.showInputHint('รูปแบบ: GROUP001 หรือ ADMIN001');
            return;
        }

        // Show valid state
        this.showInputValid();
    }

    showInputError(message) {
        this.input.classList.add('animate-error');
        this.input.style.borderColor = '#ff4757';
        Utils.showAlert(message, 'danger', 4000);
        
        // Shake animation
        setTimeout(() => {
            this.input.classList.remove('animate-error');
            this.input.style.borderColor = '';
        }, 1000);
    }

    showInputHint(message) {
        // Create or update hint element
        let hint = this.form.querySelector('.input-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.className = 'input-hint';
            hint.style.cssText = `
                font-size: 0.875rem;
                color: var(--medium-gray);
                margin-top: 0.5rem;
                font-style: italic;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            this.input.parentElement.appendChild(hint);
        }
        
        hint.textContent = message;
        hint.style.opacity = '1';
    }

    showInputValid() {
        this.input.style.borderColor = '#11998e';
        const hint = this.form.querySelector('.input-hint');
        if (hint) {
            hint.style.opacity = '0';
        }
    }

    clearInputError() {
        this.input.style.borderColor = '';
        this.input.classList.remove('animate-error');
        const hint = this.form.querySelector('.input-hint');
        if (hint) {
            hint.style.opacity = '0';
        }
    }

    setButtonLoading(loading) {
        if (!this.submitButton) return;
        
        const buttonText = this.submitButton.querySelector('.button-text');
        
        if (loading) {
            this.submitButton.disabled = true;
            this.submitButton.style.opacity = '0.7';
            if (buttonText) {
                buttonText.innerHTML = '<span class="spinner" style="margin-right: 8px;"></span>กำลังเข้าสู่ระบบ...';
            }
        } else {
            this.submitButton.disabled = false;
            this.submitButton.style.opacity = '1';
            if (buttonText) {
                buttonText.textContent = 'เข้าสู่ระบบ';
            }
        }
    }

    showSuccessAnimation() {
        // Success feedback
        this.input.style.borderColor = '#11998e';
        this.input.style.background = 'rgba(17, 153, 142, 0.1)';
        
        const buttonText = this.submitButton.querySelector('.button-text');
        if (buttonText) {
            buttonText.innerHTML = '✅ เข้าสู่ระบบสำเร็จ!';
        }
        
        this.submitButton.style.background = 'var(--success-gradient)';
        
        Utils.showAlert('เข้าสู่ระบบสำเร็จ! 🎉', 'success', 2000);
    }

    redirectUser(userData) {
        let targetPage;
        
        if (userData.type === 'admin') {
            targetPage = 'admin-dashboard.html';
        } else if (userData.type === 'group') {
            // Check if group has enough members
            if (userData.data.members >= userData.data.maxMembers) {
                targetPage = 'weekly-mission.html';
            } else {
                targetPage = 'select-group.html';
            }
        }
        
        if (targetPage) {
            Utils.showLoading(true, 'กำลังโหลดหน้าถัดไป...');
            setTimeout(() => {
                window.location.href = targetPage;
            }, 500);
        }
    }

    checkExistingSession() {
        const session = Utils.getUserSession();
        if (session) {
            // Check if session is still valid (within 24 hours)
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const hoursPassed = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursPassed < 24) {
                // Show option to continue or login again
                Utils.showModal(
                    'พบเซสชันการเข้าใช้งาน',
                    `<p>คุณเคยเข้าใช้งานด้วย <strong>${session.data.name}</strong> แล้ว</p>
                     <p>ต้องการดำเนินการต่อหรือเข้าใช้งานใหม่?</p>`,
                    [
                        {
                            text: 'เข้าใช้งานใหม่',
                            class: 'btn-outline',
                            onClick: () => {
                                Utils.clearUserSession();
                                Utils.closeModal(document.querySelector('.modal-overlay'));
                            }
                        },
                        {
                            text: 'ดำเนินการต่อ',
                            class: 'btn-primary',
                            onClick: () => {
                                Utils.closeModal(document.querySelector('.modal-overlay'));
                                this.redirectUser(session);
                            }
                        }
                    ]
                );
            } else {
                // Clear expired session
                Utils.clearUserSession();
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize authentication manager
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Export for testing
window.AuthManager = AuthManager;