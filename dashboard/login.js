// SafePost Institutional Login Script
class SafePostLogin {
  constructor() {
    this.currentType = 'school';
    this.setupEventHandlers();
    this.updateLoginButton();
  }

  setupEventHandlers() {
    // Form submission
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Input animations
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
      });
    });
  }

  selectLoginType(type) {
    this.currentType = type;
    
    // Update button states
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    this.updateLoginButton();
    this.updateFormPlaceholders();
  }

  updateLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    
    if (this.currentType === 'school') {
      btnText.textContent = 'Login as School';
      loginBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else {
      btnText.textContent = 'Login as Company';
      loginBtn.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
    }
  }

  updateFormPlaceholders() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (this.currentType === 'school') {
      usernameInput.placeholder = 'Enter school ID (e.g., school123)';
      passwordInput.placeholder = 'Enter school password';
    } else {
      usernameInput.placeholder = 'Enter company ID (e.g., company456)';
      passwordInput.placeholder = 'Enter company password';
    }
  }

  handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    
    // Show loading state
    btnText.textContent = 'Logging in...';
    loginBtn.disabled = true;
    
    // Simulate login process
    setTimeout(() => {
      // Validate demo credentials
      const validCredentials = this.validateCredentials(username, password);
      
      if (validCredentials) {
        // Store login info
        sessionStorage.setItem('safepost_login_type', this.currentType);
        sessionStorage.setItem('safepost_institution_name', this.getInstitutionName(username));
        
        // Redirect to dashboard
        window.location.href = 'index.html';
      } else {
        // Show error
        this.showError('Invalid credentials. Please use demo credentials provided below.');
        btnText.textContent = this.currentType === 'school' ? 'Login as School' : 'Login as Company';
        loginBtn.disabled = false;
      }
    }, 1500);
  }

  validateCredentials(username, password) {
    const validCreds = {
      'school123': 'demo123',
      'company456': 'demo456',
      'greenwood-high': 'school2024',
      'tech-corp': 'company2024'
    };
    
    return validCreds[username] === password;
  }

  getInstitutionName(username) {
    const institutionNames = {
      'school123': 'Demo School',
      'company456': 'Demo Company',
      'greenwood-high': 'Greenwood High School',
      'tech-corp': 'TechCorp Industries'
    };
    
    return institutionNames[username] || 'Unknown Institution';
  }

  showError(message) {
    // Remove existing error
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Insert after form
    const form = document.getElementById('loginForm');
    form.parentNode.insertBefore(errorDiv, form.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Global functions for HTML onclick handlers
function selectLoginType(type) {
  window.safePostLogin.selectLoginType(type);
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// Initialize login when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.safePostLogin = new SafePostLogin();
});