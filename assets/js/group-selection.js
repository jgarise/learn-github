/* 🎯 Group Selection Logic */
/* 3D Card selection with validation for Group Mission Workflow */

class GroupSelectionManager {
    constructor() {
        this.userSession = null;
        this.groupsData = Utils.APP_CONFIG.GROUP_CODES;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupPage());
        } else {
            this.setupPage();
        }
    }

    setupPage() {
        // Check authentication
        this.userSession = Utils.getUserSession();
        if (!this.userSession) {
            window.location.href = 'index.html';
            return;
        }

        this.setupUserInfo();
        this.renderGroupCards();
        this.setupEventListeners();
    }

    setupUserInfo() {
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        
        if (userAvatar && userName && this.userSession) {
            // Set avatar with first letter of group name or admin symbol
            if (this.userSession.type === 'group') {
                const groupName = this.userSession.data.name;
                userAvatar.textContent = groupName.charAt(0);
                userName.textContent = groupName;
            } else {
                userAvatar.textContent = '👑';
                userName.textContent = this.userSession.data.name;
            }
        }
    }

    renderGroupCards() {
        const grid = document.getElementById('groupsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        Object.entries(this.groupsData).forEach(([code, data], index) => {
            const card = this.createGroupCard(code, data, index);
            grid.appendChild(card);
        });
    }

    createGroupCard(code, data, index) {
        const progress = (data.members / data.maxMembers) * 100;
        const isComplete = data.members >= data.maxMembers;
        const isUserGroup = this.userSession.code === code;
        
        const card = document.createElement('div');
        card.className = `group-card card-3d card-interactive ${isUserGroup ? 'user-group' : ''} ${isComplete ? 'complete' : 'incomplete'}`;
        card.dataset.groupCode = code;
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Determine gradient class based on index
        const gradientClasses = ['card-primary', 'card-secondary', 'card-success', 'card-warning', 'card-gradient-special'];
        const gradientClass = gradientClasses[index % gradientClasses.length];
        
        card.innerHTML = `
            <div class="card-inner ${gradientClass}">
                <div class="card-header">
                    <div class="group-icon">${this.getGroupIcon(index)}</div>
                    <h3 class="group-name">${data.name}</h3>
                    <div class="group-code">${code}</div>
                </div>
                
                <div class="card-body">
                    <div class="member-info">
                        <div class="member-count">
                            <span class="current">${data.members}</span>
                            <span class="separator">/</span>
                            <span class="max">${data.maxMembers}</span>
                            <span class="label">คน</span>
                        </div>
                        
                        <div class="progress progress-lg">
                            <div class="progress-bar ${this.getProgressColor(progress)}" 
                                 style="width: ${progress}%"></div>
                        </div>
                        
                        <div class="status-text">
                            ${isComplete ? 
                                '<span class="status-complete">✅ พร้อมเริ่มพันธกิจ</span>' : 
                                `<span class="status-incomplete">⏳ ต้องการอีก ${data.maxMembers - data.members} คน</span>`
                            }
                        </div>
                    </div>
                </div>
                
                <div class="card-footer">
                    <button class="btn btn-card ${isComplete ? 'btn-success' : 'btn-warning'}" 
                            data-action="select-group" data-code="${code}">
                        ${isComplete ? 'เริ่มพันธกิจ' : 'ดูรายละเอียด'}
                    </button>
                </div>
                
                ${isUserGroup ? '<div class="user-badge">กลุ่มของคุณ</div>' : ''}
            </div>
        `;
        
        return card;
    }

    getGroupIcon(index) {
        const icons = ['🌟', '💝', '💖', '🙏', '✨'];
        return icons[index % icons.length];
    }

    getProgressColor(percentage) {
        if (percentage < 40) return 'progress-bar-danger';
        if (percentage < 80) return 'progress-bar-warning';
        return 'progress-bar-success';
    }

    setupEventListeners() {
        // Group card clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="select-group"]')) {
                const code = e.target.dataset.code;
                this.handleGroupSelection(code);
            }
        });

        // Navigation buttons
        const backButton = document.getElementById('backButton');
        const logoutButton = document.getElementById('logoutButton');
        
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Card hover effects
        document.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.group-card')) {
                e.target.closest('.group-card').style.transform = 'translateY(-8px) scale(1.02) rotateY(5deg)';
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.closest('.group-card')) {
                e.target.closest('.group-card').style.transform = '';
            }
        }, true);
    }

    async handleGroupSelection(code) {
        const groupData = this.groupsData[code];
        if (!groupData) return;

        Utils.showLoading(true, 'กำลังตรวจสอบกลุ่ม...');

        try {
            await this.delay(1000);

            if (groupData.members < groupData.maxMembers) {
                // Show warning modal
                Utils.showModal(
                    '⚠️ กลุ่มยังไม่พร้อม',
                    `
                    <div class="text-center">
                        <h4 class="mb-md">${groupData.name}</h4>
                        <p class="mb-lg">ต้องประกาศข่าวประเสริฐให้ครบ 5 คนก่อนเช็คชื่อ</p>
                        <div class="member-status">
                            <div class="member-count-display">
                                <span class="count">${groupData.members}</span>
                                <span class="separator">/</span>
                                <span class="total">${groupData.maxMembers}</span>
                                <span class="label">คน</span>
                            </div>
                            <p class="text-muted">ต้องการอีก <strong>${groupData.maxMembers - groupData.members}</strong> คน</p>
                        </div>
                    </div>
                    `,
                    [
                        {
                            text: 'เข้าใจแล้ว',
                            class: 'btn-primary',
                            onClick: () => {
                                Utils.closeModal(document.querySelector('.modal-overlay'));
                            }
                        }
                    ]
                );
            } else {
                // Group is ready, proceed to mission
                Utils.showAlert('กลุ่มพร้อมแล้ว! กำลังเข้าสู่พันธกิจ 🎉', 'success');
                
                // Update user session with selected group
                this.userSession.selectedGroup = code;
                Utils.saveUserSession(this.userSession);
                
                // Redirect to weekly mission
                setTimeout(() => {
                    window.location.href = 'weekly-mission.html';
                }, 1500);
            }

        } catch (error) {
            Utils.showAlert('เกิดข้อผิดพลาด: ' + error.message, 'danger');
        } finally {
            Utils.showLoading(false);
        }
    }

    handleLogout() {
        Utils.showModal(
            'ออกจากระบบ',
            '<p>คุณต้องการออกจากระบบใช่หรือไม่?</p>',
            [
                {
                    text: 'ยกเลิก',
                    class: 'btn-outline',
                    onClick: () => {
                        Utils.closeModal(document.querySelector('.modal-overlay'));
                    }
                },
                {
                    text: 'ออกจากระบบ',
                    class: 'btn-secondary',
                    onClick: () => {
                        Utils.clearUserSession();
                        window.location.href = 'index.html';
                    }
                }
            ]
        );
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize group selection manager
document.addEventListener('DOMContentLoaded', () => {
    new GroupSelectionManager();
});

// Export for testing
window.GroupSelectionManager = GroupSelectionManager;