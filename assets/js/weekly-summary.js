/* 📊 Weekly Summary Logic */
/* Display completed mission results */

class WeeklySummaryManager {
    constructor() {
        this.userSession = null;
        this.weeklyData = null;
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
        if (!this.userSession || this.userSession.type !== 'group') {
            window.location.href = 'index.html';
            return;
        }

        // Load weekly data
        this.loadWeeklyData();
        this.setupHeader();
        this.setupEventListeners();
        this.renderSummary();
    }

    loadWeeklyData() {
        try {
            const data = localStorage.getItem(Utils.APP_CONFIG.STORAGE_KEYS.WEEKLY_DATA);
            this.weeklyData = data ? JSON.parse(data) : this.createMockData();
        } catch (error) {
            console.error('Error loading weekly data:', error);
            this.weeklyData = this.createMockData();
        }
    }

    createMockData() {
        // Create mock data for demonstration
        return {
            week: Utils.getCurrentWeek(),
            date: new Date().toISOString(),
            groupCode: this.userSession.code,
            attendance: [
                { name: 'สมชาย ใจดี', status: 'present', isNew: false },
                { name: 'สมหญิง รักดี', status: 'absent', isNew: false },
                { name: 'สมศรี สุขใจ', status: 'absent', isNew: false },
                { name: 'สมพงษ์ มีความสุข', status: 'absent', isNew: true }
            ],
            announcements: [
                { name: 'อลิซ สมิท', timestamp: new Date().toISOString() }
            ],
            media: [
                { name: 'mission_photo.jpg', size: 2048000 }
            ],
            report: 'ได้แบ่งปันรากฐานความเชื่อกับ อลิซ สมิท เธอรู้สึกหนุนใจและมีความสุขมาก เราได้อธิษฐานร่วมกันและท้าทายให้เธอเติบโตในความเชื่อ'
        };
    }

    setupHeader() {
        const weekNumber = document.getElementById('weekNumber');
        const groupAvatar = document.getElementById('groupAvatar');
        const groupName = document.getElementById('groupName');
        const completionDate = document.getElementById('completionDate');

        if (weekNumber) {
            weekNumber.textContent = this.weeklyData.week;
        }

        if (this.userSession && this.userSession.data) {
            const groupData = this.userSession.data;
            
            if (groupAvatar) {
                groupAvatar.textContent = groupData.name.charAt(0);
            }
            
            if (groupName) {
                groupName.textContent = groupData.name;
            }
        }

        if (completionDate) {
            completionDate.textContent = Utils.formatThaiDate(new Date(this.weeklyData.date));
        }
    }

    setupEventListeners() {
        const backToMissionBtn = document.getElementById('backToMissionBtn');
        const startNewMissionBtn = document.getElementById('startNewMissionBtn');
        const logoutButton = document.getElementById('logoutButton');

        if (backToMissionBtn) {
            backToMissionBtn.addEventListener('click', () => {
                window.location.href = 'weekly-mission.html';
            });
        }

        if (startNewMissionBtn) {
            startNewMissionBtn.addEventListener('click', () => {
                this.startNewMission();
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    renderSummary() {
        this.renderAttendanceSummary();
        this.renderAnnouncementSummary();
        this.renderMediaSummary();
        this.renderReportSummary();
    }

    renderAttendanceSummary() {
        const presentCount = document.getElementById('presentCount');
        const absentCount = document.getElementById('absentCount');
        const newMemberCount = document.getElementById('newMemberCount');
        const presentMembers = document.getElementById('presentMembers');
        const newMembers = document.getElementById('newMembers');

        if (!this.weeklyData.attendance) return;

        const present = this.weeklyData.attendance.filter(a => a.status === 'present');
        const absent = this.weeklyData.attendance.filter(a => a.status === 'absent');
        const newMembersData = this.weeklyData.attendance.filter(a => a.isNew);

        if (presentCount) presentCount.textContent = present.length;
        if (absentCount) absentCount.textContent = absent.length;
        if (newMemberCount) newMemberCount.textContent = newMembersData.length;

        if (presentMembers) {
            const membersList = presentMembers.querySelector('.member-names');
            if (membersList) {
                membersList.innerHTML = '';
                present.forEach(member => {
                    const li = document.createElement('li');
                    li.textContent = member.name;
                    membersList.appendChild(li);
                });
            }
        }

        if (newMembers) {
            const membersList = newMembers.querySelector('.member-names');
            if (membersList) {
                membersList.innerHTML = '';
                newMembersData.forEach(member => {
                    const li = document.createElement('li');
                    li.textContent = member.name;
                    membersList.appendChild(li);
                });
            }
            
            // Hide section if no new members
            if (newMembersData.length === 0) {
                newMembers.style.display = 'none';
            }
        }
    }

    renderAnnouncementSummary() {
        const announceCount = document.getElementById('announceCount');
        const announceList = document.getElementById('announceList');

        if (!this.weeklyData.announcements) return;

        const count = this.weeklyData.announcements.length;
        
        if (announceCount) {
            announceCount.textContent = count;
        }

        if (announceList) {
            const membersList = announceList.querySelector('.member-names');
            if (membersList) {
                membersList.innerHTML = '';
                this.weeklyData.announcements.forEach(announce => {
                    const li = document.createElement('li');
                    li.textContent = announce.name;
                    membersList.appendChild(li);
                });
            }
        }

        // Update progress bar
        const progressBar = document.querySelector('.announce-stats + .announce-list + .progress-indicator .progress-bar');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar && progressText) {
            const percentage = Math.min((count / 5) * 100, 100);
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${Math.round(percentage)}% ของเป้าหมาย 5 คน`;
            
            // Update color based on progress
            progressBar.className = 'progress-bar ' + Utils.getProgressColor(percentage);
        }
    }

    renderMediaSummary() {
        const mediaStatus = document.getElementById('mediaStatus');
        const fileInfo = document.getElementById('fileInfo');

        if (!this.weeklyData.media || this.weeklyData.media.length === 0) {
            if (mediaStatus) {
                mediaStatus.className = 'media-status warning';
                mediaStatus.innerHTML = `
                    <div class="status-icon">⚠️</div>
                    <p class="status-text">ยังไม่ได้อัพโหลด</p>
                `;
            }
            if (fileInfo) {
                fileInfo.innerHTML = '<p class="text-muted">ไม่มีไฟล์</p>';
            }
            return;
        }

        if (fileInfo) {
            fileInfo.innerHTML = '';
            this.weeklyData.media.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <span class="file-icon">📸</span>
                    <span class="file-name">${file.name}</span>
                `;
                fileInfo.appendChild(fileItem);
            });
        }
    }

    renderReportSummary() {
        const reportContent = document.getElementById('reportContent');
        
        if (!this.weeklyData.report) {
            if (reportContent) {
                reportContent.innerHTML = '<p class="text-muted">ไม่มีรายงาน</p>';
            }
            return;
        }

        if (reportContent) {
            const reportText = reportContent.querySelector('.report-text');
            if (reportText) {
                reportText.textContent = `"${this.weeklyData.report}"`;
            }
        }
    }

    startNewMission() {
        Utils.showModal(
            '🚀 เริ่มพันธกิจใหม่',
            '<p>คุณต้องการเริ่มพันธกิจสัปดาห์ใหม่ใช่หรือไม่?</p><p class="text-info">ข้อมูลของสัปดาห์ปัจจุบันจะถูกเก็บไว้</p>',
            [
                {
                    text: 'ยกเลิก',
                    class: 'btn-outline',
                    onClick: () => {
                        Utils.closeModal(document.querySelector('.modal-overlay'));
                    }
                },
                {
                    text: 'เริ่มใหม่',
                    class: 'btn-success',
                    onClick: () => {
                        Utils.closeModal(document.querySelector('.modal-overlay'));
                        this.resetForNewMission();
                    }
                }
            ]
        );
    }

    resetForNewMission() {
        // Clear weekly data but keep user session
        try {
            localStorage.removeItem(Utils.APP_CONFIG.STORAGE_KEYS.WEEKLY_DATA);
        } catch (error) {
            console.error('Error clearing weekly data:', error);
        }

        Utils.showAlert('เริ่มพันธกิจใหม่เรียบร้อยแล้ว! 🚀', 'success');
        
        setTimeout(() => {
            window.location.href = 'weekly-mission.html';
        }, 1500);
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
}

// Initialize weekly summary manager
document.addEventListener('DOMContentLoaded', () => {
    new WeeklySummaryManager();
});

// Export for testing
window.WeeklySummaryManager = WeeklySummaryManager;