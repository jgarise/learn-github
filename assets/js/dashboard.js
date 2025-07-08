/* 👑 Admin Dashboard Logic */
/* Real-time monitoring and management dashboard */

class AdminDashboardManager {
    constructor() {
        this.userSession = null;
        this.refreshInterval = null;
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
        if (!this.userSession || this.userSession.type !== 'admin') {
            window.location.href = 'index.html';
            return;
        }

        this.setupHeader();
        this.setupEventListeners();
        this.renderDashboard();
        this.startAutoRefresh();
    }

    setupHeader() {
        const adminName = document.getElementById('adminName');
        const currentWeek = document.getElementById('currentWeek');

        if (this.userSession && this.userSession.data && adminName) {
            adminName.textContent = this.userSession.data.name;
        }

        if (currentWeek) {
            currentWeek.textContent = Utils.getCurrentWeek();
        }

        this.updateLastRefreshTime();
    }

    setupEventListeners() {
        const exportReportBtn = document.getElementById('exportReportBtn');
        const backButton = document.getElementById('backButton');
        const logoutButton = document.getElementById('logoutButton');

        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => this.exportReport());
        }

        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.handleLogout());
        }
    }

    renderDashboard() {
        this.renderOverviewStats();
        this.renderGroupCards();
    }

    renderOverviewStats() {
        const totalGroups = Object.keys(this.groupsData).length;
        const readyGroups = Object.values(this.groupsData).filter(g => g.members >= g.maxMembers).length;
        const overallProgress = Math.round((readyGroups / totalGroups) * 100);
        const totalAnnouncements = this.calculateTotalAnnouncements();

        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            statCards[0].querySelector('.stat-number').textContent = totalGroups;
            statCards[1].querySelector('.stat-number').textContent = readyGroups;
            statCards[2].querySelector('.stat-number').textContent = `${overallProgress}%`;
            statCards[3].querySelector('.stat-number').textContent = totalAnnouncements;
        }
    }

    renderGroupCards() {
        const dashboardGrid = document.getElementById('dashboardGrid');
        if (!dashboardGrid) return;

        dashboardGrid.innerHTML = '';

        Object.entries(this.groupsData).forEach(([code, data], index) => {
            const card = this.createGroupDashboardCard(code, data, index);
            dashboardGrid.appendChild(card);
        });
    }

    createGroupDashboardCard(code, data, index) {
        const completion = (data.members / data.maxMembers) * 100;
        const isReady = data.members >= data.maxMembers;
        const announcements = this.getGroupAnnouncements(code);
        const lastActivity = this.getLastActivity(code);
        
        // Simulate some mission progress data
        const missionProgress = isReady ? Math.floor(Math.random() * 100) : 0;
        const attendanceRate = isReady ? Math.floor(Math.random() * 40) + 60 : 0;

        const card = document.createElement('div');
        card.className = 'group-dashboard-card animate-fade-in-up';
        card.style.animationDelay = `${index * 0.1}s`;

        const gradientClasses = ['primary', 'secondary', 'success', 'warning', 'primary'];
        const gradientClass = gradientClasses[index % gradientClasses.length];

        card.innerHTML = `
            <div class="group-header">
                <div class="avatar group-avatar card-${gradientClass}">
                    ${this.getGroupIcon(index)}
                </div>
                <div class="group-info">
                    <h3 class="group-title">${data.name}</h3>
                    <p class="group-code">${code}</p>
                </div>
                <div class="group-status">
                    ${isReady ? '<span class="badge badge-success">พร้อม</span>' : '<span class="badge badge-warning">รอ</span>'}
                </div>
            </div>

            <div class="group-metrics">
                <div class="metric-row">
                    <span class="metric-label">สมาชิก</span>
                    <span class="metric-value ${isReady ? 'success' : 'warning'}">
                        ${data.members}/${data.maxMembers}
                    </span>
                </div>
                
                <div class="metric-row">
                    <span class="metric-label">การประกาศ</span>
                    <span class="metric-value ${announcements > 0 ? 'success' : 'danger'}">
                        ${announcements} คน
                    </span>
                </div>
                
                ${isReady ? `
                <div class="metric-row">
                    <span class="metric-label">ความคืบหน้าพันธกิจ</span>
                    <span class="metric-value ${missionProgress > 70 ? 'success' : missionProgress > 30 ? 'warning' : 'danger'}">
                        ${missionProgress}%
                    </span>
                </div>
                
                <div class="metric-row">
                    <span class="metric-label">อัตราเข้าร่วม</span>
                    <span class="metric-value ${attendanceRate > 70 ? 'success' : attendanceRate > 50 ? 'warning' : 'danger'}">
                        ${attendanceRate}%
                    </span>
                </div>
                ` : ''}
                
                <div class="metric-row">
                    <span class="metric-label">กิจกรรมล่าสุด</span>
                    <span class="metric-value">${lastActivity}</span>
                </div>
            </div>

            <div class="group-progress">
                <div class="progress-label">
                    <span>ความสมบูรณ์</span>
                    <span>${Math.round(completion)}%</span>
                </div>
                <div class="progress progress-lg">
                    <div class="progress-bar ${Utils.getProgressColor(completion)}" 
                         style="width: ${completion}%"></div>
                </div>
            </div>

            ${isReady ? `
            <div class="group-progress">
                <div class="progress-label">
                    <span>ความคืบหน้าพันธกิจ</span>
                    <span>${missionProgress}%</span>
                </div>
                <div class="progress progress-lg">
                    <div class="progress-bar ${Utils.getProgressColor(missionProgress)}" 
                         style="width: ${missionProgress}%"></div>
                </div>
            </div>
            ` : ''}
        `;

        return card;
    }

    getGroupIcon(index) {
        const icons = ['🌟', '💝', '💖', '🙏', '✨'];
        return icons[index % icons.length];
    }

    getGroupAnnouncements(code) {
        // Simulate announcement data
        const baseAnnouncements = {
            'GROUP001': 1,
            'GROUP002': 3,
            'GROUP003': 2,
            'GROUP004': 0,
            'GROUP005': 2
        };
        return baseAnnouncements[code] || 0;
    }

    getLastActivity(code) {
        const activities = [
            '10 นาทีที่แล้ว',
            '1 ชั่วโมงที่แล้ว', 
            '3 ชั่วโมงที่แล้ว',
            'เมื่อวาน',
            '2 วันที่แล้ว'
        ];
        return activities[Math.floor(Math.random() * activities.length)];
    }

    calculateTotalAnnouncements() {
        return Object.keys(this.groupsData).reduce((total, code) => {
            return total + this.getGroupAnnouncements(code);
        }, 0);
    }

    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.updateLastRefreshTime();
            this.renderDashboard();
        }, 30000); // Refresh every 30 seconds
    }

    updateLastRefreshTime() {
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            lastUpdate.textContent = timeString;
        }
    }

    exportReport() {
        Utils.showLoading(true, 'กำลังสร้างรายงาน...');

        setTimeout(() => {
            // Simulate report generation
            const reportData = this.generateReportData();
            this.downloadReport(reportData);
            Utils.showLoading(false);
            Utils.showAlert('ส่งออกรายงานสำเร็จ! 📄', 'success');
        }, 2000);
    }

    generateReportData() {
        const totalGroups = Object.keys(this.groupsData).length;
        const readyGroups = Object.values(this.groupsData).filter(g => g.members >= g.maxMembers).length;
        const totalAnnouncements = this.calculateTotalAnnouncements();

        return {
            title: `รายงานสรุปกลุ่มพันธกิจ - สัปดาห์ที่ ${Utils.getCurrentWeek()}`,
            date: Utils.formatThaiDate(new Date()),
            summary: {
                totalGroups,
                readyGroups,
                completionRate: Math.round((readyGroups / totalGroups) * 100),
                totalAnnouncements
            },
            groups: Object.entries(this.groupsData).map(([code, data]) => ({
                code,
                name: data.name,
                members: `${data.members}/${data.maxMembers}`,
                ready: data.members >= data.maxMembers,
                announcements: this.getGroupAnnouncements(code)
            }))
        };
    }

    downloadReport(data) {
        // Create a simple text report
        let reportText = `${data.title}\n`;
        reportText += `วันที่: ${data.date}\n\n`;
        reportText += `สรุปภาพรวม:\n`;
        reportText += `- กลุ่มทั้งหมด: ${data.summary.totalGroups} กลุ่ม\n`;
        reportText += `- กลุ่มที่พร้อม: ${data.summary.readyGroups} กลุ่ม\n`;
        reportText += `- อัตราความสำเร็จ: ${data.summary.completionRate}%\n`;
        reportText += `- การประกาศรวม: ${data.summary.totalAnnouncements} คน\n\n`;
        reportText += `รายละเอียดกลุ่ม:\n`;
        
        data.groups.forEach(group => {
            reportText += `\n${group.name} (${group.code}):\n`;
            reportText += `  - สมาชิก: ${group.members}\n`;
            reportText += `  - สถานะ: ${group.ready ? 'พร้อม' : 'ยังไม่พร้อม'}\n`;
            reportText += `  - การประกาศ: ${group.announcements} คน\n`;
        });

        // Create download link
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `group-mission-report-week-${Utils.getCurrentWeek()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
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
                        if (this.refreshInterval) {
                            clearInterval(this.refreshInterval);
                        }
                        Utils.clearUserSession();
                        window.location.href = 'index.html';
                    }
                }
            ]
        );
    }
}

// Initialize admin dashboard manager
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboardManager();
});

// Export for testing
window.AdminDashboardManager = AdminDashboardManager;