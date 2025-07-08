/* 📱 Mission Workflow Logic */
/* 4-step weekly mission process for Group Mission Workflow */

class MissionManager {
    constructor() {
        this.userSession = null;
        this.currentStep = 1;
        this.missionData = {
            attendance: [],
            announcements: [],
            media: [],
            report: ''
        };
        this.steps = {
            1: 'checkin',
            2: 'announce', 
            3: 'upload',
            4: 'report'
        };
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

        this.setupHeader();
        this.setupEventListeners();
        this.loadCurrentStep();
    }

    setupHeader() {
        const groupAvatar = document.getElementById('groupAvatar');
        const groupName = document.getElementById('groupName');
        const currentWeek = document.getElementById('currentWeek');
        const currentDate = document.getElementById('currentDate');

        if (this.userSession && this.userSession.data) {
            const groupData = this.userSession.data;
            
            if (groupAvatar) {
                groupAvatar.textContent = groupData.name.charAt(0);
            }
            
            if (groupName) {
                groupName.textContent = groupData.name;
            }
        }

        if (currentWeek) {
            currentWeek.textContent = Utils.getCurrentWeek();
        }

        if (currentDate) {
            currentDate.textContent = Utils.formatThaiDate(new Date());
        }
    }

    setupEventListeners() {
        // Navigation buttons
        const backButton = document.getElementById('backButton');
        const logoutButton = document.getElementById('logoutButton');

        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'select-group.html';
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Step navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.step[data-step]')) {
                const step = parseInt(e.target.closest('.step').dataset.step);
                if (step <= this.currentStep || step === this.currentStep + 1) {
                    this.navigateToStep(step);
                }
            }
        });
    }

    loadCurrentStep() {
        this.updateProgressSteps();
        this.renderStepContent();
    }

    updateProgressSteps() {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed', 'disabled');
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.add('disabled');
            }
        });
    }

    renderStepContent() {
        const content = document.getElementById('missionContent');
        if (!content) return;

        const stepMethod = `render${this.steps[this.currentStep].charAt(0).toUpperCase() + this.steps[this.currentStep].slice(1)}Step`;
        
        if (this[stepMethod]) {
            content.innerHTML = '';
            this[stepMethod](content);
        }
    }

    renderCheckinStep(container) {
        const stepContent = document.createElement('div');
        stepContent.className = 'step-content animate-fade-in-up';
        stepContent.innerHTML = `
            <div class="step-header">
                <h2 class="step-title">📝 เช็คชื่อสมาชิก</h2>
                <p class="step-subtitle">ระบุสมาชิกที่มาร่วมกิจกรรมในสัปดาห์นี้</p>
            </div>

            <div class="checkin-content">
                <div class="members-grid" id="membersGrid">
                    <!-- Members will be dynamically loaded -->
                </div>
                
                <div class="add-member-section">
                    <h3 class="section-title">เพิ่มสมาชิกใหม่</h3>
                    <div class="add-member-form">
                        <input type="text" id="newMemberName" class="form-input" 
                               placeholder="ชื่อ-สกุล สมาชิกใหม่" />
                        <button class="btn btn-secondary" id="addMemberBtn">เพิ่มสมาชิก</button>
                    </div>
                </div>

                <div class="attendance-summary" id="attendanceSummary">
                    <div class="summary-card">
                        <div class="summary-item">
                            <span class="count" id="presentCount">0</span>
                            <span class="label">มา</span>
                        </div>
                        <div class="summary-item">
                            <span class="count" id="absentCount">0</span>
                            <span class="label">ไม่มา</span>
                        </div>
                        <div class="summary-item">
                            <span class="count" id="newMemberCount">0</span>
                            <span class="label">ใหม่</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="step-actions">
                <button class="btn btn-primary btn-lg" id="nextStepBtn" disabled>
                    ถัดไป: ประกาศข่าวประเสริฐ →
                </button>
            </div>
        `;

        container.appendChild(stepContent);
        this.setupCheckinHandlers();
        this.loadMembers();
    }

    renderAnnounceStep(container) {
        const stepContent = document.createElement('div');
        stepContent.className = 'step-content animate-fade-in-up';
        stepContent.innerHTML = `
            <div class="step-header">
                <h2 class="step-title">📢 ประกาศข่าวประเสริฐ</h2>
                <p class="step-subtitle">บันทึกรายชื่อผู้ที่ได้รับการประกาศ</p>
            </div>

            <div class="announce-content">
                <div class="announce-form">
                    <div class="form-group">
                        <label class="form-label">ชื่อ-สกุล ผู้ที่ประกาศให้</label>
                        <div class="input-with-button">
                            <input type="text" id="announceToName" class="form-input" 
                                   placeholder="เช่น: สมชาย ใจดี" />
                            <button class="btn btn-primary" id="addAnnounceBtn">เพิ่ม</button>
                        </div>
                    </div>
                </div>

                <div class="announce-list" id="announceList">
                    <h3 class="section-title">รายชื่อที่ประกาศแล้ว</h3>
                    <div class="announce-items" id="announceItems">
                        <!-- Announced names will appear here -->
                    </div>
                </div>

                <div class="announce-progress">
                    <div class="progress-info">
                        <span class="progress-label">ความคืบหน้า</span>
                        <span class="progress-count"><span id="announceCount">0</span> คน</span>
                    </div>
                    <div class="progress progress-lg">
                        <div class="progress-bar progress-bar-success" id="announceProgressBar" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <div class="step-actions">
                <button class="btn btn-outline" id="prevStepBtn">
                    ← กลับไปเช็คชื่อ
                </button>
                <button class="btn btn-primary btn-lg" id="nextStepBtn">
                    ถัดไป: อัพโหลดรูปภาพ →
                </button>
            </div>
        `;

        container.appendChild(stepContent);
        this.setupAnnounceHandlers();
    }

    renderUploadStep(container) {
        const stepContent = document.createElement('div');
        stepContent.className = 'step-content animate-fade-in-up';
        stepContent.innerHTML = `
            <div class="step-header">
                <h2 class="step-title">📸 อัพโหลดรูปภาพ</h2>
                <p class="step-subtitle">ส่งรูปภาพกิจกรรมของสัปดาห์นี้</p>
            </div>

            <div class="upload-content">
                <div class="upload-zone" id="uploadZone">
                    <div class="upload-icon">📁</div>
                    <h3 class="upload-title">ลากไฟล์มาวางที่นี่</h3>
                    <p class="upload-subtitle">หรือคลิกเพื่อเลือกไฟล์</p>
                    <input type="file" id="fileInput" accept="image/*" multiple style="display: none;">
                    <button class="btn btn-primary" id="selectFileBtn">เลือกไฟล์</button>
                </div>

                <div class="upload-preview" id="uploadPreview" style="display: none;">
                    <h3 class="section-title">ไฟล์ที่เลือก</h3>
                    <div class="file-list" id="fileList">
                        <!-- File previews will appear here -->
                    </div>
                </div>
            </div>

            <div class="step-actions">
                <button class="btn btn-outline" id="prevStepBtn">
                    ← กลับไปประกาศ
                </button>
                <button class="btn btn-primary btn-lg" id="nextStepBtn" disabled>
                    ถัดไป: เขียนรายงาน →
                </button>
            </div>
        `;

        container.appendChild(stepContent);
        this.setupUploadHandlers();
    }

    renderReportStep(container) {
        const stepContent = document.createElement('div');
        stepContent.className = 'step-content animate-fade-in-up';
        stepContent.innerHTML = `
            <div class="step-header">
                <h2 class="step-title">📝 เขียนรายงานผล</h2>
                <p class="step-subtitle">สรุปผลการดำเนินกิจกรรมในสัปดาห์นี้</p>
            </div>

            <div class="report-content">
                <div class="form-group">
                    <label class="form-label">รายงานผลการดำเนินงาน</label>
                    <textarea id="reportText" class="form-textarea" rows="8"
                              placeholder="เช่น: ได้แบ่งปันรากฐานความเชื่อกับ 3 คน ทุกคนรู้สึกหนุนใจและมีความสุข..."></textarea>
                </div>

                <div class="report-suggestions">
                    <h3 class="section-title">💡 ข้อเสนอแนะ</h3>
                    <div class="suggestion-tags">
                        <button class="suggestion-tag" data-text="แบ่งปันรากฐานความเชื่อ">แบ่งปันรากฐานความเชื่อ</button>
                        <button class="suggestion-tag" data-text="หนุนใจเพื่อนสมาชิก">หนุนใจเพื่อนสมาชิก</button>
                        <button class="suggestion-tag" data-text="ท้าทายการเติบโต">ท้าทายการเติบโต</button>
                        <button class="suggestion-tag" data-text="อธิษฐานร่วมกัน">อธิษฐานร่วมกัน</button>
                        <button class="suggestion-tag" data-text="ศึกษาพระคัมภีร์">ศึกษาพระคัมภีร์</button>
                    </div>
                </div>
            </div>

            <div class="step-actions">
                <button class="btn btn-outline" id="prevStepBtn">
                    ← กลับไปอัพโหลด
                </button>
                <button class="btn btn-success btn-lg" id="completeBtn">
                    ✅ ส่งรายงานสำเร็จ!
                </button>
            </div>
        `;

        container.appendChild(stepContent);
        this.setupReportHandlers();
    }

    setupCheckinHandlers() {
        const addMemberBtn = document.getElementById('addMemberBtn');
        const newMemberName = document.getElementById('newMemberName');
        const nextStepBtn = document.getElementById('nextStepBtn');

        if (addMemberBtn && newMemberName) {
            addMemberBtn.addEventListener('click', () => this.addNewMember());
            newMemberName.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addNewMember();
            });
        }

        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => this.navigateToStep(2));
        }
    }

    setupAnnounceHandlers() {
        const addAnnounceBtn = document.getElementById('addAnnounceBtn');
        const announceToName = document.getElementById('announceToName');
        const prevStepBtn = document.getElementById('prevStepBtn');
        const nextStepBtn = document.getElementById('nextStepBtn');

        if (addAnnounceBtn && announceToName) {
            addAnnounceBtn.addEventListener('click', () => this.addAnnouncement());
            announceToName.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addAnnouncement();
            });
        }

        if (prevStepBtn) {
            prevStepBtn.addEventListener('click', () => this.navigateToStep(1));
        }

        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => this.navigateToStep(3));
        }
    }

    setupUploadHandlers() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const selectFileBtn = document.getElementById('selectFileBtn');
        const prevStepBtn = document.getElementById('prevStepBtn');
        const nextStepBtn = document.getElementById('nextStepBtn');

        // File selection
        if (selectFileBtn && fileInput) {
            selectFileBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
        }

        // Drag and drop
        if (uploadZone) {
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('drag-over');
            });

            uploadZone.addEventListener('dragleave', () => {
                uploadZone.classList.remove('drag-over');
            });

            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
                this.handleFileSelect(e.dataTransfer.files);
            });
        }

        if (prevStepBtn) {
            prevStepBtn.addEventListener('click', () => this.navigateToStep(2));
        }

        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => this.navigateToStep(4));
        }
    }

    setupReportHandlers() {
        const reportText = document.getElementById('reportText');
        const suggestionTags = document.querySelectorAll('.suggestion-tag');
        const prevStepBtn = document.getElementById('prevStepBtn');
        const completeBtn = document.getElementById('completeBtn');

        // Suggestion tags
        suggestionTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const text = tag.dataset.text;
                if (reportText) {
                    const currentText = reportText.value;
                    const newText = currentText ? `${currentText} ${text}` : text;
                    reportText.value = newText;
                }
            });
        });

        if (prevStepBtn) {
            prevStepBtn.addEventListener('click', () => this.navigateToStep(3));
        }

        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.completeMission());
        }
    }

    loadMembers() {
        // Load existing members and create attendance grid
        const membersGrid = document.getElementById('membersGrid');
        if (!membersGrid) return;

        const existingMembers = [
            'สมชาย ใจดี',
            'สมหญิง รักดี', 
            'สมศรี สุขใจ'
        ];

        membersGrid.innerHTML = '';
        existingMembers.forEach((member, index) => {
            const memberCard = this.createMemberCard(member, false);
            membersGrid.appendChild(memberCard);
        });

        this.updateAttendanceSummary();
    }

    createMemberCard(name, isNew = false) {
        const card = document.createElement('div');
        card.className = `member-card ${isNew ? 'new-member' : ''}`;
        card.innerHTML = `
            <div class="member-info">
                <div class="member-avatar">${name.charAt(0)}</div>
                <span class="member-name">${name}</span>
                ${isNew ? '<span class="new-badge">ใหม่</span>' : ''}
            </div>
            <div class="attendance-toggle">
                <button class="toggle-btn present" data-status="present">มา</button>
                <button class="toggle-btn absent active" data-status="absent">ไม่มา</button>
            </div>
        `;

        // Add toggle functionality
        const toggleBtns = card.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateAttendanceSummary();
                this.checkNextStepAvailable();
            });
        });

        return card;
    }

    addNewMember() {
        const newMemberName = document.getElementById('newMemberName');
        if (!newMemberName || !newMemberName.value.trim()) {
            Utils.showAlert('กรุณาใส่ชื่อสมาชิกใหม่', 'warning');
            return;
        }

        const name = newMemberName.value.trim();
        const membersGrid = document.getElementById('membersGrid');
        
        if (membersGrid) {
            const memberCard = this.createMemberCard(name, true);
            membersGrid.appendChild(memberCard);
            memberCard.classList.add('animate-bounce-in');
        }

        newMemberName.value = '';
        this.updateAttendanceSummary();
        Utils.showAlert(`เพิ่ม ${name} เรียบร้อยแล้ว! 👍`, 'success');
    }

    updateAttendanceSummary() {
        const presentCount = document.querySelectorAll('.toggle-btn.present.active').length;
        const absentCount = document.querySelectorAll('.toggle-btn.absent.active').length;
        const newMemberCount = document.querySelectorAll('.member-card.new-member').length;

        const presentCountEl = document.getElementById('presentCount');
        const absentCountEl = document.getElementById('absentCount');
        const newMemberCountEl = document.getElementById('newMemberCount');

        if (presentCountEl) presentCountEl.textContent = presentCount;
        if (absentCountEl) absentCountEl.textContent = absentCount;
        if (newMemberCountEl) newMemberCountEl.textContent = newMemberCount;
    }

    checkNextStepAvailable() {
        const nextStepBtn = document.getElementById('nextStepBtn');
        const presentCount = document.querySelectorAll('.toggle-btn.present.active').length;
        
        if (nextStepBtn) {
            nextStepBtn.disabled = presentCount === 0;
        }
    }

    addAnnouncement() {
        const announceToName = document.getElementById('announceToName');
        if (!announceToName || !announceToName.value.trim()) {
            Utils.showAlert('กรุณาใส่ชื่อผู้ที่ประกาศให้', 'warning');
            return;
        }

        const name = announceToName.value.trim();
        this.missionData.announcements.push({
            name: name,
            timestamp: new Date().toISOString()
        });

        this.updateAnnounceList();
        announceToName.value = '';
        Utils.showAlert(`บันทึกการประกาศให้ ${name} เรียบร้อยแล้ว! 📢`, 'success');
    }

    updateAnnounceList() {
        const announceItems = document.getElementById('announceItems');
        const announceCount = document.getElementById('announceCount');
        const announceProgressBar = document.getElementById('announceProgressBar');

        if (announceItems) {
            announceItems.innerHTML = '';
            this.missionData.announcements.forEach((announce, index) => {
                const item = document.createElement('div');
                item.className = 'announce-item animate-fade-in-up';
                item.innerHTML = `
                    <span class="announce-name">${announce.name}</span>
                    <button class="btn btn-sm btn-outline remove-btn" data-index="${index}">ลบ</button>
                `;
                announceItems.appendChild(item);
            });

            // Add remove functionality
            announceItems.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-btn')) {
                    const index = parseInt(e.target.dataset.index);
                    this.missionData.announcements.splice(index, 1);
                    this.updateAnnounceList();
                }
            });
        }

        if (announceCount) {
            announceCount.textContent = this.missionData.announcements.length;
        }

        if (announceProgressBar) {
            const progress = Math.min((this.missionData.announcements.length / 5) * 100, 100);
            announceProgressBar.style.width = `${progress}%`;
        }
    }

    handleFileSelect(files) {
        const uploadPreview = document.getElementById('uploadPreview');
        const fileList = document.getElementById('fileList');
        const nextStepBtn = document.getElementById('nextStepBtn');

        if (!files || files.length === 0) return;

        this.missionData.media = Array.from(files);
        
        if (fileList) {
            fileList.innerHTML = '';
            this.missionData.media.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'file-item animate-fade-in-up';
                item.innerHTML = `
                    <div class="file-info">
                        <div class="file-icon">📸</div>
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button class="btn btn-sm btn-outline remove-file-btn" data-index="${index}">ลบ</button>
                `;
                fileList.appendChild(item);
            });
        }

        if (uploadPreview) {
            uploadPreview.style.display = 'block';
        }

        if (nextStepBtn) {
            nextStepBtn.disabled = false;
        }

        Utils.showAlert(`เลือกไฟล์ ${files.length} ไฟล์เรียบร้อยแล้ว! 📁`, 'success');
    }

    async completeMission() {
        const reportText = document.getElementById('reportText');
        if (!reportText || !reportText.value.trim()) {
            Utils.showAlert('กรุณาเขียนรายงานผลก่อนส่ง', 'warning');
            return;
        }

        this.missionData.report = reportText.value.trim();

        Utils.showLoading(true, 'กำลังส่งรายงาน...');

        try {
            await this.delay(2000);
            
            // Save mission data
            this.saveMissionData();
            
            Utils.showLoading(false);
            Utils.showAlert('ส่งรายงานสำเร็จ! 🎉', 'success', 3000);
            
            // Redirect to summary
            setTimeout(() => {
                window.location.href = 'weekly-summary.html';
            }, 2000);

        } catch (error) {
            Utils.showLoading(false);
            Utils.showAlert('เกิดข้อผิดพลาด: ' + error.message, 'danger');
        }
    }

    saveMissionData() {
        const weeklyData = {
            week: Utils.getCurrentWeek(),
            date: new Date().toISOString(),
            groupCode: this.userSession.code,
            ...this.missionData
        };

        try {
            localStorage.setItem(Utils.APP_CONFIG.STORAGE_KEYS.WEEKLY_DATA, JSON.stringify(weeklyData));
        } catch (error) {
            console.error('Error saving mission data:', error);
        }
    }

    navigateToStep(step) {
        if (step < 1 || step > 4) return;
        
        this.currentStep = step;
        this.loadCurrentStep();
    }

    handleLogout() {
        Utils.showModal(
            'ออกจากระบบ',
            '<p>คุณต้องการออกจากระบบใช่หรือไม่?</p><p class="text-warning">⚠️ ข้อมูลที่ยังไม่ได้บันทึกจะสูญหาย</p>',
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

// Initialize mission manager
document.addEventListener('DOMContentLoaded', () => {
    new MissionManager();
});

// Export for testing
window.MissionManager = MissionManager;