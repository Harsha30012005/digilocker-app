// DigiLocker Application Initialization
class DigiLockerApp {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        try {
            // Show loading screen
            this.showLoadingScreen();

            // Initialize all managers in correct order
            setTimeout(() => {
                // Auth manager is already initialized in auth.js
                // Storage manager is already initialized in storage.js
                // Document manager is already initialized in documents.js
                // UI manager is already initialized in ui.js

                this.isInitialized = true;
                
                // Hide loading screen after initialization
                setTimeout(() => {
                    this.hideLoadingScreen();
                }, 1500);

                console.log('DigiLocker App initialized successfully');
            }, 1000);

        } catch (error) {
            console.error('Error initializing DigiLocker App:', error);
            this.showError('Failed to initialize application');
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    showError(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--error-color); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--error-color); margin-bottom: 16px;">Application Error</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">${message}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Reload Application
                    </button>
                </div>
            `;
        }
    }

    // Utility methods for application state
    isAppReady() {
        return this.isInitialized;
    }

    getCurrentUser() {
        return authManager ? authManager.getCurrentUser() : null;
    }

    // Data export functionality
    exportAllData() {
        try {
            const exportData = storageManager.exportData();
            if (exportData) {
                const blob = new Blob([exportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `digilocker-backup-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
                showToast('Data exported successfully', 'success');
            }
        } catch (error) {
            console.error('Export error:', error);
            showToast('Failed to export data', 'error');
        }
    }

    // Clear all application data
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            try {
                localStorage.clear();
                showToast('All data cleared successfully', 'success');
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } catch (error) {
                console.error('Clear data error:', error);
                showToast('Failed to clear data', 'error');
            }
        }
    }

    // Application statistics
    getAppStats() {
        const user = this.getCurrentUser();
        if (!user) return null;

        return {
            totalUsers: JSON.parse(localStorage.getItem('digilocker_users') || '[]').length,
            totalDocuments: user.documents ? user.documents.length : 0,
            storageUsed: storageManager ? storageManager.getCurrentStorageSize() : 0,
            lastLogin: user.lastLogin || user.createdAt,
            appVersion: '1.0.0'
        };
    }
}

// Global utility functions
function refreshApp() {
    if (window.documentManager) {
        documentManager.refreshAll();
    }
}

function exportData() {
    if (window.digiLockerApp) {
        digiLockerApp.exportAllData();
    }
}

function clearAllData() {
    if (window.digiLockerApp) {
        digiLockerApp.clearAllData();
    }
}

// Performance monitoring
function measurePerformance() {
    if (performance && performance.timing) {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`DigiLocker loaded in ${loadTime}ms`);
    }
}

// Initialize the application
const digiLockerApp = new DigiLockerApp();

// Measure performance after load
window.addEventListener('load', measurePerformance);

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.showToast) {
        showToast('An unexpected error occurred', 'error');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.showToast) {
        showToast('An error occurred while processing your request', 'error');
    }
});

// Service worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker can be added later for offline functionality
        console.log('Service Worker support detected');
    });
}

// Export for global access
window.digiLockerApp = digiLockerApp;