// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const storedUser = localStorage.getItem('digilocker_user');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.showDashboard();
        } else {
            this.showLoginPage();
        }
    }

    showLoginPage() {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('loginPage').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'grid';
        
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.name;
            this.updateProfileInfo();
        }
    }

    register(userData) {
        // Validate passwords match
        if (userData.password !== userData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return false;
        }

        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('digilocker_users') || '[]');
        const userExists = existingUsers.some(user => 
            user.email === userData.email || user.mobile === userData.mobile
        );

        if (userExists) {
            showToast('User already exists with this email or mobile number', 'error');
            return false;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            password: userData.password, // In real app, this should be hashed
            createdAt: new Date().toISOString(),
            documents: [],
            sharedDocuments: []
        };

        // Save user
        existingUsers.push(newUser);
        localStorage.setItem('digilocker_users', JSON.stringify(existingUsers));
        
        showToast('Account created successfully! Please log in.', 'success');
        return true;
    }

    login(identifier, password) {
        const users = JSON.parse(localStorage.getItem('digilocker_users') || '[]');
        const user = users.find(u => 
            (u.email === identifier || u.mobile === identifier) && u.password === password
        );

        if (user) {
            this.currentUser = user;
            localStorage.setItem('digilocker_user', JSON.stringify(user));
            this.showDashboard();
            showToast('Welcome back!', 'success');
            return true;
        } else {
            showToast('Invalid credentials', 'error');
            return false;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('digilocker_user');
        this.showLoginPage();
        showToast('Logged out successfully', 'success');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateUser(userData) {
        if (!this.currentUser) return false;

        // Update current user
        Object.assign(this.currentUser, userData);
        localStorage.setItem('digilocker_user', JSON.stringify(this.currentUser));

        // Update in users array
        const users = JSON.parse(localStorage.getItem('digilocker_users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('digilocker_users', JSON.stringify(users));
        }

        return true;
    }

    updateProfileInfo() {
        if (!this.currentUser) return;

        document.getElementById('profileName').textContent = this.currentUser.name;
        document.getElementById('profileEmail').textContent = this.currentUser.email;
        document.getElementById('profileMobile').textContent = this.currentUser.mobile;
        document.getElementById('profileTotalDocs').textContent = this.currentUser.documents.length;
        
        const memberSince = new Date(this.currentUser.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
        document.getElementById('profileMemberSince').textContent = memberSince;

        // Calculate storage used
        const storageUsed = this.calculateStorageUsed();
        document.getElementById('profileStorageUsed').textContent = storageUsed;
    }

    calculateStorageUsed() {
        if (!this.currentUser || !this.currentUser.documents) return '0 MB';
        
        let totalSize = 0;
        this.currentUser.documents.forEach(doc => {
            if (doc.size) {
                totalSize += doc.size;
            }
        });

        return formatFileSize(totalSize);
    }
}

// Tab switching for login/register
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        tabBtns[0].classList.add('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        tabBtns[1].classList.add('active');
    }
}

// Initialize Auth Manager
const authManager = new AuthManager();

// Event Listeners
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    authManager.login(identifier, password);
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const userData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        mobile: document.getElementById('registerMobile').value,
        password: document.getElementById('registerPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    if (authManager.register(userData)) {
        switchTab('login');
        // Clear form
        document.getElementById('registerForm').reset();
    }
});