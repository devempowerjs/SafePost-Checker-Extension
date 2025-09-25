// SafePost Checker Popup Script
class SafePostPopup {
  constructor() {
    this.currentTab = 'dashboard';
    this.settings = {};
    
    this.initializePopup();
    this.loadSettings();
    this.loadStats();
    this.setupEventHandlers();
    this.loadDailyTip();
  }

  initializePopup() {
    // Set up tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
  }

  switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    this.currentTab = tabName;
  }

  loadSettings() {
    chrome.runtime.sendMessage({ action: 'GET_SETTINGS' }, (response) => {
      this.settings = response || {};
      this.updateSettingsUI();
    });
  }

  updateSettingsUI() {
    // Update enabled status
    const enabledToggle = document.getElementById('extensionEnabled');
    if (enabledToggle) {
      enabledToggle.checked = this.settings.enabled !== false;
    }

    // Update sensitivity level
    const sensitivitySelect = document.getElementById('sensitivityLevel');
    if (sensitivitySelect) {
      sensitivitySelect.value = this.settings.sensitivityLevel || 'medium';
    }

    // Update detection types
    const detectionTypes = this.settings.detectionTypes || {};
    Object.keys(detectionTypes).forEach(type => {
      const checkbox = document.getElementById(`detect${this.capitalize(type)}`);
      if (checkbox) {
        checkbox.checked = detectionTypes[type] !== false;
      }
    });

    // Update status indicator
    const statusIndicator = document.getElementById('statusIndicator');
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('span');
    
    if (this.settings.enabled !== false) {
      statusDot.style.background = '#10b981';
      statusText.textContent = 'Active';
    } else {
      statusDot.style.background = '#ef4444';
      statusText.textContent = 'Disabled';
    }
  }

  loadStats() {
    chrome.storage.sync.get(['stats'], (result) => {
      const stats = result.stats || { alertsShown: 0, dataProtected: 0 };
      
      document.getElementById('alertsShown').textContent = stats.alertsShown;
      document.getElementById('dataProtected').textContent = stats.dataProtected;
    });
  }

  setupEventHandlers() {
    // Settings handlers
    document.getElementById('extensionEnabled')?.addEventListener('change', (e) => {
      this.updateSetting('enabled', e.target.checked);
    });

    document.getElementById('sensitivityLevel')?.addEventListener('change', (e) => {
      this.updateSetting('sensitivityLevel', e.target.value);
    });

    // Detection type handlers
    ['phone', 'email', 'address', 'financial', 'password'].forEach(type => {
      const checkbox = document.getElementById(`detect${this.capitalize(type)}`);
      checkbox?.addEventListener('change', (e) => {
        this.updateDetectionType(type, e.target.checked);
      });
    });

    // Privacy tool handlers
    document.getElementById('clearHistory')?.addEventListener('click', () => {
      this.clearBrowsingHistory();
    });

    document.getElementById('manageCookies')?.addEventListener('click', () => {
      this.manageCookies();
    });

    document.getElementById('checkActivity')?.addEventListener('click', () => {
      this.checkGoogleActivity();
    });

    document.getElementById('privacyCheckup')?.addEventListener('click', () => {
      this.runPrivacyCheckup();
    });

    document.getElementById('openDashboard')?.addEventListener('click', () => {
      this.openInstitutionalDashboard();
    });

    // About section handlers
    document.getElementById('privacyPolicy')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openPrivacyPolicy();
    });

    document.getElementById('support')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openSupport();
    });
  }

  updateSetting(key, value) {
    this.settings[key] = value;
    chrome.runtime.sendMessage({
      action: 'UPDATE_SETTINGS',
      settings: this.settings
    }, (response) => {
      if (response?.success) {
        this.showNotification('Settings updated successfully!', 'success');
      }
    });
  }

  updateDetectionType(type, enabled) {
    if (!this.settings.detectionTypes) {
      this.settings.detectionTypes = {};
    }
    
    this.settings.detectionTypes[type] = enabled;
    this.updateSetting('detectionTypes', this.settings.detectionTypes);
  }

  clearBrowsingHistory() {
    const button = document.getElementById('clearHistory');
    const originalText = button.textContent;
    
    button.textContent = 'Clearing...';
    button.disabled = true;

    chrome.runtime.sendMessage({ action: 'CLEAR_HISTORY' }, (response) => {
      if (response?.success) {
        this.showNotification(response.message, 'success');
      } else {
        this.showNotification('Failed to clear history', 'error');
      }
      
      button.textContent = originalText;
      button.disabled = false;
    });
  }

  manageCookies() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const url = new URL(currentTab.url);
      const domain = url.hostname;

      const button = document.getElementById('manageCookies');
      const originalText = button.textContent;
      
      button.textContent = 'Managing...';
      button.disabled = true;

      chrome.runtime.sendMessage({ 
        action: 'MANAGE_COOKIES', 
        domain: domain 
      }, (response) => {
        if (response?.success) {
          this.showNotification(response.message, 'success');
        } else {
          this.showNotification('Failed to manage cookies', 'error');
        }
        
        button.textContent = originalText;
        button.disabled = false;
      });
    });
  }

  checkGoogleActivity() {
    chrome.tabs.create({ 
      url: 'https://myactivity.google.com/myactivity' 
    });
  }

  runPrivacyCheckup() {
    // Create a simple privacy checkup overlay
    this.showNotification('Privacy checkup feature coming soon!', 'info');
  }

  openInstitutionalDashboard() {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('dashboard/login.html')
    });
  }

  openPrivacyPolicy() {
    chrome.tabs.create({ 
      url: 'https://example.com/privacy-policy' 
    });
  }

  openSupport() {
    chrome.tabs.create({ 
      url: 'https://example.com/support' 
    });
  }

  loadDailyTip() {
    const tips = [
      'Always review privacy settings on social media platforms regularly.',
      'Use two-factor authentication on all important accounts.',
      'Avoid sharing location data in photos and posts.',
      'Regular password updates keep your accounts secure.',
      'Be cautious about what personal information you share in online forms.',
      'Check your digital footprint by searching for yourself online.',
      'Use privacy-focused search engines like DuckDuckGo.',
      'Review app permissions regularly and remove unnecessary access.'
    ];

    const today = new Date().getDate();
    const tipIndex = today % tips.length;
    document.getElementById('dailyTip').textContent = tips[tipIndex];
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '500',
      zIndex: '10000',
      opacity: '0',
      transition: 'all 0.3s ease'
    });

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SafePostPopup();
});