// UI Management System
class UIManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupSearch();
        this.setupResponsive();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('onclick')?.match(/showSection\('(.+)'\)/)?.[1];
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            this.handleResize();
        });
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        if (!uploadArea || !fileInput) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            }, false);
        });

        // Handle dropped files
        uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            fileInput.files = files;
            this.handleFiles(files);
        }, false);

        // Handle file input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Click to select files
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query) {
                    documentManager.searchDocuments(query);
                    if (this.currentSection !== 'documents') {
                        this.showSection('documents');
                    }
                } else {
                    documentManager.loadDocuments();
                }
            }, 300);
        });
    }

    setupResponsive() {
        // Add mobile menu toggle
        if (this.isMobile) {
            this.addMobileMenuToggle();
        }
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFiles(files) {
        if (files.length > 0) {
            const fileList = Array.from(files).map(file => file.name).join(', ');
            showToast(`Selected ${files.length} file(s): ${fileList}`, 'success');
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`.nav-item[onclick*="${sectionName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Load section-specific data
        this.loadSectionData(sectionName);

        // Close mobile menu if open
        if (this.isMobile) {
            this.closeMobileMenu();
        }
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                documentManager.loadRecentDocuments();
                documentManager.updateStats();
                break;
            case 'documents':
                documentManager.loadDocuments();
                break;
            case 'categories':
                documentManager.loadCategories();
                break;
            case 'shared':
                documentManager.loadSharedDocuments();
                break;
            case 'recent':
                documentManager.loadRecentDocuments();
                break;
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    showProfile() {
        authManager.updateProfileInfo();
        this.showModal('profileModal');
        this.toggleUserMenu();
    }

    showSettings() {
        showToast('Settings feature coming soon!', 'warning');
        this.toggleUserMenu();
    }

    logout() {
        authManager.logout();
        this.toggleUserMenu();
    }

    addMobileMenuToggle() {
        const headerLeft = document.querySelector('.header-left');
        if (headerLeft && !document.getElementById('mobileMenuToggle')) {
            const menuToggle = document.createElement('button');
            menuToggle.id = 'mobileMenuToggle';
            menuToggle.className = 'mobile-menu-toggle';
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.onclick = () => this.toggleMobileMenu();
            headerLeft.insertBefore(menuToggle, headerLeft.firstChild);
        }
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('show');
        }
    }

    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('show');
        }
    }

    handleResize() {
        if (!this.isMobile && this.isMobile !== (window.innerWidth <= 768)) {
            location.reload(); // Simple approach to handle responsive changes
        }
    }
}

// Toast Notification System
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

// Global UI functions for HTML onclick handlers
function showSection(sectionName) {
    uiManager.showSection(sectionName);
}

function showModal(modalId) {
    uiManager.showModal(modalId);
}

function closeModal() {
    uiManager.closeModal();
}

function closeShareModal() {
    uiManager.closeModal();
}

function closeProfileModal() {
    uiManager.closeModal();
}

function toggleUserMenu() {
    uiManager.toggleUserMenu();
}

function showProfile() {
    uiManager.showProfile();
}

function showSettings() {
    uiManager.showSettings();
}

function logout() {
    uiManager.logout();
}

// Initialize UI Manager
const uiManager = new UIManager();

// Additional CSS for mobile menu toggle
const mobileStyles = `
.mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 18px;
    color: var(--text-primary);
    cursor: pointer;
    padding: 8px;
    margin-right: 12px;
}

@media (max-width: 768px) {
    .mobile-menu-toggle {
        display: block;
    }
    
    .sidebar {
        box-shadow: var(--shadow-lg);
    }
    
    .sidebar.show + .main-content::before {
        content: '';
        position: fixed;
        top: 70px;
        left: 0;
        width: 100%;
        height: calc(100vh - 70px);
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary);
}

.empty-state i {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.5;
}

.empty-state h3 {
    margin-bottom: 12px;
    color: var(--text-primary);
}

.empty-state p {
    margin-bottom: 24px;
}
`;

// Add mobile styles to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileStyles;
document.head.appendChild(styleSheet);