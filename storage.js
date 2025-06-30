// Storage Management
class StorageManager {
    constructor() {
        this.maxStorageSize = 100 * 1024 * 1024; // 100MB limit
    }

    saveDocument(documentData) {
        const user = authManager.getCurrentUser();
        if (!user) return false;

        // Check storage limit
        if (this.getCurrentStorageSize() + documentData.size > this.maxStorageSize) {
            showToast('Storage limit exceeded. Please delete some documents.', 'error');
            return false;
        }

        // Add document to user's documents
        const document = {
            id: Date.now().toString(),
            ...documentData,
            userId: user.id,
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            isShared: false,
            shareLinks: []
        };

        user.documents.push(document);
        authManager.updateUser(user);

        showToast('Document uploaded successfully!', 'success');
        return document;
    }

    getDocuments(filter = {}) {
        const user = authManager.getCurrentUser();
        if (!user) return [];

        let documents = [...user.documents];

        // Apply filters
        if (filter.category) {
            documents = documents.filter(doc => doc.category === filter.category);
        }

        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            documents = documents.filter(doc => 
                doc.name.toLowerCase().includes(searchTerm) ||
                doc.description.toLowerCase().includes(searchTerm)
            );
        }

        if (filter.sortBy) {
            documents = this.sortDocuments(documents, filter.sortBy);
        }

        return documents;
    }

    getDocument(documentId) {
        const user = authManager.getCurrentUser();
        if (!user) return null;

        const document = user.documents.find(doc => doc.id === documentId);
        if (document) {
            // Update last accessed
            document.lastAccessed = new Date().toISOString();
            authManager.updateUser(user);
        }

        return document;
    }

    deleteDocument(documentId) {
        const user = authManager.getCurrentUser();
        if (!user) return false;

        const documentIndex = user.documents.findIndex(doc => doc.id === documentId);
        if (documentIndex === -1) return false;

        user.documents.splice(documentIndex, 1);
        authManager.updateUser(user);

        showToast('Document deleted successfully', 'success');
        return true;
    }

    shareDocument(documentId, shareOptions) {
        const user = authManager.getCurrentUser();
        const document = this.getDocument(documentId);
        
        if (!document) return false;

        const shareLink = {
            id: Date.now().toString(),
            email: shareOptions.email,
            accessLevel: shareOptions.accessLevel,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            link: `${window.location.origin}/shared/${document.id}/${Date.now()}`
        };

        document.shareLinks = document.shareLinks || [];
        document.shareLinks.push(shareLink);
        document.isShared = true;

        authManager.updateUser(user);
        showToast('Document shared successfully!', 'success');
        
        return shareLink;
    }

    getSharedDocuments() {
        const user = authManager.getCurrentUser();
        if (!user) return [];

        return user.documents.filter(doc => doc.isShared);
    }

    getRecentDocuments(limit = 5) {
        const user = authManager.getCurrentUser();
        if (!user) return [];

        return user.documents
            .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
            .slice(0, limit);
    }

    sortDocuments(documents, sortBy) {
        switch (sortBy) {
            case 'name':
                return documents.sort((a, b) => a.name.localeCompare(b.name));
            case 'date':
                return documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'size':
                return documents.sort((a, b) => (b.size || 0) - (a.size || 0));
            case 'type':
                return documents.sort((a, b) => a.type.localeCompare(b.type));
            default:
                return documents;
        }
    }

    getCurrentStorageSize() {
        const user = authManager.getCurrentUser();
        if (!user) return 0;

        return user.documents.reduce((total, doc) => total + (doc.size || 0), 0);
    }

    getStorageStats() {
        const used = this.getCurrentStorageSize();
        const total = this.maxStorageSize;
        const percentage = Math.round((used / total) * 100);

        return {
            used: formatFileSize(used),
            total: formatFileSize(total),
            percentage,
            remaining: formatFileSize(total - used)
        };
    }

    exportData() {
        const user = authManager.getCurrentUser();
        if (!user) return null;

        const exportData = {
            user: {
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            },
            documents: user.documents.map(doc => ({
                ...doc,
                content: null // Remove file content for privacy
            })),
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(exportData, null, 2);
    }

    clearAllData() {
        const user = authManager.getCurrentUser();
        if (!user) return false;

        user.documents = [];
        user.sharedDocuments = [];
        authManager.updateUser(user);

        showToast('All data cleared successfully', 'success');
        return true;
    }
}

// File utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileType) {
    const iconMap = {
        'application/pdf': 'fa-file-pdf',
        'image/jpeg': 'fa-file-image',
        'image/jpg': 'fa-file-image',
        'image/png': 'fa-file-image',
        'image/gif': 'fa-file-image',
        'application/msword': 'fa-file-word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-file-word',
        'application/vnd.ms-excel': 'fa-file-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fa-file-excel',
        'text/plain': 'fa-file-alt',
        'default': 'fa-file'
    };

    return iconMap[fileType] || iconMap['default'];
}

function validateFile(file) {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB per file

    if (!allowedTypes.includes(file.type)) {
        showToast('File type not supported', 'error');
        return false;
    }

    if (file.size > maxSize) {
        showToast('File size too large. Maximum 10MB allowed.', 'error');
        return false;
    }

    return true;
}

// Initialize Storage Manager
const storageManager = new StorageManager();