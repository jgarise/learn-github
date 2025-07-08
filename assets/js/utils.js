/* 🛠️ Utility Functions */
/* Helper functions for the Group Mission Workflow */

// === CONSTANTS ===
const APP_CONFIG = {
    // Group codes (รหัสกลุ่ม)
    GROUP_CODES: {
        'GROUP001': { name: 'กลุ่มแสงแรก', members: 3, maxMembers: 5 },
        'GROUP002': { name: 'กลุ่มความหวัง', members: 5, maxMembers: 5 },
        'GROUP003': { name: 'กลุ่มความรัก', members: 4, maxMembers: 5 },
        'GROUP004': { name: 'กลุ่มความเชื่อ', members: 2, maxMembers: 5 },
        'GROUP005': { name: 'กลุ่มพระคุณ', members: 5, maxMembers: 5 },
    },
    
    // Admin codes (รหัสแอดมิน)
    ADMIN_CODES: {
        'ADMIN001': { name: 'ผู้ดูแลระบบหลัก', level: 'super' },
        'ADMIN002': { name: 'ผู้ช่วยดูแลระบบ', level: 'regular' }
    },
    
    // Session storage keys
    STORAGE_KEYS: {
        USER_SESSION: 'groupMissionUserSession',
        GROUP_DATA: 'groupMissionGroupData',
        WEEKLY_DATA: 'groupMissionWeeklyData'
    }
};

// === UTILITY FUNCTIONS ===

/**
 * Display loading overlay
 * @param {boolean} show - Whether to show or hide the overlay
 * @param {string} text - Loading text to display
 */
function showLoading(show = true, text = 'กำลังโหลด...') {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    
    const loadingText = overlay.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = text;
    }
    
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

/**
 * Show notification/alert message
 * @param {string} message - Message to display
 * @param {string} type - Type of alert ('success', 'warning', 'danger', 'info')
 * @param {number} duration - How long to show (milliseconds)
 */
function showAlert(message, type = 'info', duration = 3000) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-notification');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-notification animate-bounce-in`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        box-shadow: var(--shadow-heavy);
    `;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    // Auto remove after duration
    setTimeout(() => {
        alert.style.animation = 'fadeInUp 0.3s ease-out reverse';
        setTimeout(() => alert.remove(), 300);
    }, duration);
}

/**
 * Show modal popup
 * @param {string} title - Modal title
 * @param {string} content - Modal content (HTML)
 * @param {Array} buttons - Array of button objects {text, class, onClick}
 */
function showModal(title, content, buttons = []) {
    // Remove existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                ${buttons.map(btn => 
                    `<button class="btn ${btn.class || 'btn-primary'}" data-action="${btn.action || ''}">${btn.text}</button>`
                ).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    // Add event listeners
    buttons.forEach((btn, index) => {
        const buttonEl = modalOverlay.querySelectorAll('.modal-footer .btn')[index];
        if (buttonEl && btn.onClick) {
            buttonEl.addEventListener('click', btn.onClick);
        }
    });
    
    // Show modal
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
    
    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal(modalOverlay);
        }
    });
    
    return modalOverlay;
}

/**
 * Close modal
 * @param {Element} modal - Modal element to close
 */
function closeModal(modal) {
    if (!modal) return;
    
    modal.classList.remove('active');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

/**
 * Validate access code (group or admin)
 * @param {string} code - Code to validate
 * @returns {Object|null} User data if valid, null if invalid
 */
function validateAccessCode(code) {
    const upperCode = code.toUpperCase().trim();
    
    // Check group codes
    if (APP_CONFIG.GROUP_CODES[upperCode]) {
        return {
            type: 'group',
            code: upperCode,
            data: APP_CONFIG.GROUP_CODES[upperCode]
        };
    }
    
    // Check admin codes
    if (APP_CONFIG.ADMIN_CODES[upperCode]) {
        return {
            type: 'admin',
            code: upperCode,
            data: APP_CONFIG.ADMIN_CODES[upperCode]
        };
    }
    
    return null;
}

/**
 * Save user session to localStorage
 * @param {Object} userData - User data to save
 */
function saveUserSession(userData) {
    try {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_SESSION, JSON.stringify(userData));
    } catch (error) {
        console.error('Error saving user session:', error);
    }
}

/**
 * Get user session from localStorage
 * @returns {Object|null} User data or null
 */
function getUserSession() {
    try {
        const data = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_SESSION);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting user session:', error);
        return null;
    }
}

/**
 * Clear user session
 */
function clearUserSession() {
    try {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_SESSION);
    } catch (error) {
        console.error('Error clearing user session:', error);
    }
}

/**
 * Format date to Thai format
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatThaiDate(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        locale: 'th-TH'
    };
    return date.toLocaleDateString('th-TH', options);
}

/**
 * Get current week number
 * @returns {number} Current week number
 */
function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
}

/**
 * Animate progress bar
 * @param {Element} progressBar - Progress bar element
 * @param {number} percentage - Target percentage
 */
function animateProgressBar(progressBar, percentage) {
    if (!progressBar) return;
    
    progressBar.style.setProperty('--progress-width', `${percentage}%`);
    progressBar.style.width = `${percentage}%`;
    
    // Add animation class
    progressBar.classList.add('progress-fill');
}

/**
 * Get progress color based on percentage
 * @param {number} percentage - Progress percentage
 * @returns {string} CSS class for color
 */
function getProgressColor(percentage) {
    if (percentage < 30) return 'progress-bar-danger';
    if (percentage < 70) return 'progress-bar-warning';
    return 'progress-bar-success';
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate unique ID
 * @returns {string} Unique ID string
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Add ripple effect to button
 * @param {Event} event - Click event
 */
function addRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = button.querySelector('.button-ripple') || 
                   button.querySelector('.btn-ripple');
    
    if (!ripple) return;
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    ripple.classList.add('active');
    
    setTimeout(() => {
        ripple.classList.remove('active');
    }, 600);
}

/**
 * Initialize common event listeners
 */
function initializeCommonEvents() {
    // Add ripple effect to buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn, .cta-button, button')) {
            addRippleEffect(e);
        }
    });
    
    // Handle Enter key on inputs
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.matches('input[type="text"], input[type="email"]')) {
            const form = e.target.closest('form');
            if (form) {
                const submitButton = form.querySelector('button[type="submit"], .btn-submit');
                if (submitButton) {
                    submitButton.click();
                }
            }
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay.active');
            if (modal) {
                closeModal(modal);
            }
        }
    });
}

// === EXPORT FOR MODULES ===
window.Utils = {
    showLoading,
    showAlert,
    showModal,
    closeModal,
    validateAccessCode,
    saveUserSession,
    getUserSession,
    clearUserSession,
    formatThaiDate,
    getCurrentWeek,
    animateProgressBar,
    getProgressColor,
    debounce,
    generateId,
    addRippleEffect,
    APP_CONFIG
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCommonEvents);