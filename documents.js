// Document Management System
class DocumentManager {
    constructor() {
        this.currentDocument = null;
        this.categories = {
            aadhaar: { name: 'Aadhaar Card', icon: 'fa-id-card', count: 0 },
            pan: { name: 'PAN Card', icon: 'fa-credit-card', count: 0 },
            driving: { name: 'Driving License', icon: 'fa-car', count: 0 },
            passport: { name: 'Passport', icon: 'fa-passport', count: 0 },
            voter: { name: 'Voter ID', icon: 'fa-vote-yea', count: 0 },
            education: { name: 'Education Certificates', icon: 'fa-graduation-cap', count: 0 },
            medical: { name: 'Medical Records', icon: 'fa-heartbeat', count: 0 },
            other: { name: 'Other Documents', icon: 'fa-file', count: 0 }
        };
        this.init();
    }

    init() {
        this.loadDocuments();
        this.updateStats();
        this.loadCategories();
        this.loadRecentDocuments();
    }

    async uploadDocument() {
        const fileInput = document.getElementById('fileInput');
        const category = document.getElementById('documentCategory').value;
        const name = document.getElementById('documentName').value;
        const description = document.getElementById('documentDescription').value;

        if (!fileInput.files || fileInput.files.length === 0) {
            showToast('Please select files to upload', 'error');
            return;
        }

        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        uploadProgress.style.display = 'block';

        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            
            if (!validateFile(file)) {
                continue;
            }

            try {
                const documentData = await this.processFile(file, category, name, description);
                const savedDocument = storageManager.saveDocument(documentData);
                
                if (savedDocument) {
                    const progress = ((i + 1) / fileInput.files.length) * 100;
                    progressFill.style.width = progress + '%';
                    progressText.textContent = `Uploaded ${i + 1} of ${fileInput.files.length} files`;
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                showToast(`Error uploading ${file.name}`, 'error');
            }
        }

        // Hide progress and reset form
        setTimeout(() => {
            uploadProgress.style.display = 'none';
            this.resetUploadForm();
            this.refreshAll();
        }, 1000);
    }

    async processFile(file, category, customName, description) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const documentData = {
                    name: customName || file.name,
                    originalName: file.name,
                    type: file.type,
                    size: file.size,
                    category: category,
                    description: description || '',
                    content: e.target.result,
                    preview: null
                };

                // Generate preview for images
                if (file.type.startsWith('image/')) {
                    documentData.preview = e.target.result;
                }

                resolve(documentData);
            };

            reader.onerror = function() {
                reject(new Error('Failed to read file'));
            };

            reader.readAsDataURL(file);
        });
    }

    loadDocuments() {
        const documents = storageManager.getDocuments();
        this.renderDocumentsGrid(documents);
        this.updateCategoryCounts(documents);
    }

    renderDocumentsGrid(documents) {
        const container = document.getElementById('allDocumentsList');
        
        if (!documents || documents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No documents found</h3>
                    <p>Upload your first document to get started</p>
                    <button class="btn-primary" onclick="showSection('upload')">
                        <i class="fas fa-upload"></i> Upload Document
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = documents.map(doc => this.createDocumentCard(doc)).join('');
    }

    createDocumentCard(document) {
        const icon = getFileIcon(document.type);
        const formattedDate = new Date(document.createdAt).toLocaleDateString();
        const formattedSize = formatFileSize(document.size);
        
        return `
            <div class="document-card" onclick="viewDocument('${document.id}')">
                <div class="document-preview">
                    ${document.preview ? 
                        `<img src="${document.preview}" alt="${document.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                        `<i class="fas ${icon}"></i>`
                    }
                </div>
                <div class="document-info">
                    <h4 title="${document.name}">${document.name}</h4>
                    <div class="document-meta">
                        <span>${formattedDate}</span>
                        <span>${formattedSize}</span>
                    </div>
                    <div class="document-category">${this.categories[document.category]?.name || 'Other'}</div>
                    <div class="document-actions" onclick="event.stopPropagation()">
                        <button class="btn-icon" onclick="downloadDocument('${document.id}')" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn-icon" onclick="shareDocument('${document.id}')" title="Share">
                            <i class="fas fa-share-alt"></i>
                        </button>
                        <button class="btn-icon" onclick="deleteDocument('${document.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    loadCategories() {
        const container = document.getElementById('categoriesGrid');
        const documents = storageManager.getDocuments();
        
        // Update category counts
        this.updateCategoryCounts(documents);
        
        container.innerHTML = Object.entries(this.categories).map(([key, category]) => `
            <div class="category-card" onclick="filterByCategory('${key}')">
                <div class="category-icon">
                    <i class="fas ${category.icon}"></i>
                </div>
                <h3>${category.name}</h3>
                <p>Manage your ${category.name.toLowerCase()}</p>
                <div class="category-count">${category.count} documents</div>
            </div>
        `).join('');
    }

    updateCategoryCounts(documents) {
        // Reset counts
        Object.keys(this.categories).forEach(key => {
            this.categories[key].count = 0;
        });
        
        // Count documents in each category
        documents.forEach(doc => {
            if (this.categories[doc.category]) {
                this.categories[doc.category].count++;
            }
        });
    }

    loadRecentDocuments() {
        const recentDocs = storageManager.getRecentDocuments(5);
        const container = document.getElementById('recentDocsList');
        const dashboardContainer = document.getElementById('recentDocsGrid');
        
        if (recentDocs.length === 0) {
            const emptyMessage = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>No recent documents</p>
                </div>
            `;
            container.innerHTML = emptyMessage;
            if (dashboardContainer) dashboardContainer.innerHTML = emptyMessage;
            return;
        }

        const recentDocsHTML = recentDocs.map(doc => this.createDocumentCard(doc)).join('');
        container.innerHTML = recentDocsHTML;
        if (dashboardContainer) {
            dashboardContainer.innerHTML = recentDocsHTML;
        }
    }

    searchDocuments(query) {
        const documents = storageManager.getDocuments({ search: query });
        this.renderDocumentsGrid(documents);
    }

    sortDocuments() {
        const sortBy = document.getElementById('sortSelect').value;
        const documents = storageManager.getDocuments({ sortBy });
        this.renderDocumentsGrid(documents);
    }

    filterByCategory(category) {
        const documents = storageManager.getDocuments({ category });
        this.renderDocumentsGrid(documents);
        showSection('documents');
    }

    viewDocument(documentId) {
        const document = storageManager.getDocument(documentId);
        if (!document) {
            showToast('Document not found', 'error');
            return;
        }

        this.currentDocument = document;
        document.getElementById('modalDocTitle').textContent = document.name;
        
        const viewer = document.getElementById('documentViewer');
        
        if (document.type.startsWith('image/')) {
            viewer.innerHTML = `<img src="${document.content}" alt="${document.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        } else if (document.type === 'application/pdf') {
            viewer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-file-pdf" style="font-size: 64px; color: #dc2626; margin-bottom: 16px;"></i>
                    <h3>${document.name}</h3>
                    <p>PDF files cannot be previewed in browser</p>
                    <button class="btn-primary" onclick="downloadDocument('${document.id}')">
                        <i class="fas fa-download"></i> Download to View
                    </button>
                </div>
            `;
        } else {
            viewer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas ${getFileIcon(document.type)}" style="font-size: 64px; color: #64748b; margin-bottom: 16px;"></i>
                    <h3>${document.name}</h3>
                    <p>Preview not available for this file type</p>
                    <button class="btn-primary" onclick="downloadDocument('${document.id}')">
                        <i class="fas fa-download"></i> Download File
                    </button>
                </div>
            `;
        }

        showModal('documentModal');
    }

    downloadDocument(documentId) {
        const document = storageManager.getDocument(documentId);
        if (!document) {
            showToast('Document not found', 'error');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = document.content;
            link.download = document.name;
            link.click();
            showToast('Download started', 'success');
        } catch (error) {
            showToast('Error downloading document', 'error');
        }
    }

    deleteDocument(documentId) {
        if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            if (storageManager.deleteDocument(documentId)) {
                this.refreshAll();
                closeModal();
            }
        }
    }

    shareDocument(documentId) {
        const document = storageManager.getDocument(documentId);
        if (!document) {
            showToast('Document not found', 'error');
            return;
        }

        this.currentDocument = document;
        const shareLink = `${window.location.origin}/shared/${documentId}/${Date.now()}`;
        document.getElementById('shareLink').value = shareLink;
        showModal('shareModal');
    }

    sendShareInvite() {
        const email = document.getElementById('shareEmail').value;
        const accessLevel = document.getElementById('accessLevel').value;

        if (!email) {
            showToast('Please enter an email address', 'error');
            return;
        }

        if (!this.currentDocument) {
            showToast('No document selected', 'error');
            return;
        }

        const shareOptions = { email, accessLevel };
        const shareLink = storageManager.shareDocument(this.currentDocument.id, shareOptions);
        
        if (shareLink) {
            closeModal();
            this.refreshAll();
        }
    }

    copyShareLink() {
        const shareLink = document.getElementById('shareLink');
        shareLink.select();
        shareLink.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            showToast('Share link copied to clipboard', 'success');
        } catch (error) {
            showToast('Failed to copy link', 'error');
        }
    }

    loadSharedDocuments() {
        const sharedDocs = storageManager.getSharedDocuments();
        const container = document.getElementById('sharedDocsList');
        
        if (sharedDocs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-share-alt"></i>
                    <h3>No shared documents</h3>
                    <p>Documents you share will appear here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sharedDocs.map(doc => this.createDocumentCard(doc)).join('');
    }

    updateStats() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        const totalDocs = user.documents ? user.documents.length : 0;
        const sharedDocs = user.documents ? user.documents.filter(doc => doc.isShared).length : 0;
        const storageStats = storageManager.getStorageStats();

        document.getElementById('totalDocs').textContent = totalDocs;
        document.getElementById('sharedDocs').textContent = sharedDocs;
        document.getElementById('storageUsed').textContent = storageStats.used;
    }

    resetUploadForm() {
        document.getElementById('fileInput').value = '';
        document.getElementById('documentName').value = '';
        document.getElementById('documentDescription').value = '';
        document.getElementById('documentCategory').value = 'other';
    }

    refreshAll() {
        this.loadDocuments();
        this.loadCategories();
        this.loadRecentDocuments();
        this.loadSharedDocuments();
        this.updateStats();
        authManager.updateProfileInfo();
    }
}

// Global functions for HTML onclick handlers
function uploadDocument() {
    documentManager.uploadDocument();
}

function viewDocument(documentId) {
    documentManager.viewDocument(documentId);
}

function downloadDocument(documentId) {
    documentManager.downloadDocument(documentId);
}

function deleteDocument(documentId) {
    documentManager.deleteDocument(documentId);
}

function shareDocument(documentId) {
    if (documentId) {
        documentManager.shareDocument(documentId);
    } else {
        showToast('Please select a document to share', 'error');
    }
}

function sendShareInvite() {
    documentManager.sendShareInvite();
}

function copyShareLink() {
    documentManager.copyShareLink();
}

function sortDocuments() {
    documentManager.sortDocuments();
}

function filterByCategory(category) {
    documentManager.filterByCategory(category);
}

// Initialize Document Manager
const documentManager = new DocumentManager();