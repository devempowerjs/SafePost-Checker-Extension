// SafePost Checker Content Script
class SafePostDetector {
  constructor() {
    this.settings = null;
    this.alertQueue = [];
    this.isProcessing = false;
    this.sensitivePatterns = this.initializePatterns();
    
    this.loadSettings();
    this.initializeDetection();
    this.setupMessageHandlers();
  }

  initializePatterns() {
    return {
      phone: /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
      creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
      address: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi,
      atmPin: /\b(?:pin|atm|code).*?(\d{4,6})\b/gi,
      password: /\b(?:password|pass|pwd).*?[:\s]+([\w@#$%^&*!]+)/gi,
      personalKeywords: /\b(?:home address|phone number|social security|date of birth|dob|mother's maiden name)\b/gi
    };
  }

  loadSettings() {
    chrome.storage.sync.get(null, (settings) => {
      this.settings = settings || {};
      if (!this.settings.enabled) return;
      
      this.startMonitoring();
    });
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'ENABLE_ENHANCED_MONITORING':
          this.enhancedMode = true;
          this.socialMediaContext = request.context;
          break;
        case 'SETTINGS_UPDATED':
          this.loadSettings();
          break;
      }
    });
  }

  initializeDetection() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startMonitoring());
    } else {
      this.startMonitoring();
    }
  }

  startMonitoring() {
    // Monitor text inputs
    this.monitorTextInputs();
    
    // Monitor file uploads
    this.monitorFileUploads();
    
    // Monitor form submissions
    this.monitorFormSubmissions();
    
    // Monitor social media posts
    this.monitorSocialMediaPosts();
  }

  monitorTextInputs() {
    const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, [contenteditable="true"]');
    
    textInputs.forEach(input => {
      input.addEventListener('input', this.debounce((event) => {
        const text = event.target.value || event.target.textContent || event.target.innerText;
        this.analyzeText(text, event.target);
      }, 300));

      input.addEventListener('paste', (event) => {
        setTimeout(() => {
          const text = event.target.value || event.target.textContent || event.target.innerText;
          this.analyzeText(text, event.target);
        }, 100);
      });

      // Additional event for contenteditable elements
      if (input.contentEditable === 'true') {
        input.addEventListener('keyup', this.debounce((event) => {
          const text = event.target.textContent || event.target.innerText;
          this.analyzeText(text, event.target);
        }, 300));
      }
    });

    // Monitor dynamically added inputs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const newInputs = node.querySelectorAll ? 
              node.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, [contenteditable="true"]') : 
              [];
            
            newInputs.forEach(input => {
              input.addEventListener('input', this.debounce((event) => {
                this.analyzeText(event.target.value, event.target);
              }, 300));
            });
          }
        });
      });
    });

    // Enhanced Instagram monitoring with mutation observer
    this.setupInstagramMonitoring();
  }

  setupInstagramMonitoring() {
    // Instagram-specific monitoring for dynamic content
    const instagramObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for Instagram-specific elements
            const instagramInputs = node.querySelectorAll ? 
              node.querySelectorAll(`
                [contenteditable="true"][aria-label*="Add a comment"],
                [contenteditable="true"][aria-label*="Write a caption"],
                [contenteditable="true"][data-testid="caption-input"],
                div[contenteditable="true"][role="textbox"],
                textarea[aria-label*="Add a comment"]
              `) : [];
            
            instagramInputs.forEach(input => {
              input.addEventListener('input', this.debounce((event) => {
                const text = event.target.textContent || event.target.value || event.target.innerText;
                this.analyzeSocialMediaPost(text, event.target);
              }, 300));

              input.addEventListener('keyup', this.debounce((event) => {
                const text = event.target.textContent || event.target.value || event.target.innerText;
                this.analyzeSocialMediaPost(text, event.target);
              }, 300));
            });
          }
        });
      });
    });

    // Start observing Instagram for dynamic content
    if (window.location.hostname.includes('instagram.com')) {
      instagramObserver.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['contenteditable', 'aria-label']
      });
    }

    observer.observe(document.body, { childList: true, subtree: true });
  }

  monitorFileUploads() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
      input.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
          this.analyzeFileUpload(files, event.target);
        }
      });
    });

    // Monitor drag and drop
    document.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    document.addEventListener('drop', (event) => {
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        this.analyzeFileUpload(files, event.target);
      }
    });
  }

  monitorFormSubmissions() {
    document.addEventListener('submit', (event) => {
      const form = event.target;
      const formData = new FormData(form);
      let sensitiveDataFound = false;

      for (let [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          const detection = this.detectSensitiveData(value);
          if (detection.length > 0) {
            sensitiveDataFound = true;
            break;
          }
        }
      }

      if (sensitiveDataFound) {
        event.preventDefault();
        this.showAlert({
          type: 'form_submission',
          message: 'Hold on! This form contains sensitive information.',
          suggestion: 'Double-check that you trust this website before submitting personal data.',
          element: form
        });
      }
    });
  }

  monitorSocialMediaPosts() {
    // Common social media post selectors
    const postSelectors = [
      '[data-testid="tweetTextarea_0"]', // Twitter/X
      '[contenteditable="true"][role="textbox"]', // Facebook/Instagram
      'textarea[placeholder*="What\'s on your mind"]', // Facebook
      '[contenteditable="true"][data-text="Write a comment..."]', // Instagram comments
      '[contenteditable="true"][aria-label*="Add a comment"]', // Instagram comments
      '[contenteditable="true"][aria-label*="Write a caption"]', // Instagram posts
      '[contenteditable="true"][data-testid="caption-input"]', // Instagram stories
      '.notranslate[contenteditable="true"]', // Various platforms
      'div[contenteditable="true"][role="textbox"]', // Instagram DMs
      'textarea[aria-label*="Add a comment"]', // Instagram fallback
      'div[data-testid="media-upload-caption"]' // Instagram upload caption
    ];

    postSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.addEventListener('input', this.debounce((event) => {
          this.analyzeSocialMediaPost(event.target.textContent || event.target.value, event.target);
        }, 500));
      });
    });
  }

  analyzeText(text, element) {
    if (!text || text.length < 3) return;

    const detections = this.detectSensitiveData(text);
    
    if (detections.length > 0) {
      this.showAlert({
        type: 'sensitive_data',
        detections: detections,
        element: element,
        message: 'Think twice before sharing this information!',
        suggestion: this.getSuggestionForDetection(detections[0])
      });
    }
  }

  analyzeSocialMediaPost(text, element) {
    if (!text || text.length < 10) return;

    // Enhanced Instagram detection
    if (window.location.hostname.includes('instagram.com')) {
      console.log('SafePost: Analyzing Instagram content:', text.substring(0, 50) + '...');
    }

    const detections = this.detectSensitiveData(text);
    const oversharing = this.detectOversharing(text);

    if (detections.length > 0 || oversharing.length > 0) {
      this.showAlert({
        type: 'social_media_post',
        detections: detections,
        oversharing: oversharing,
        element: element,
        message: 'Your post might reveal too much personal information.',
        suggestion: 'Consider removing specific details and keeping your post more general.'
      });
    }
  }

  analyzeFileUpload(files, element) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        this.showAlert({
          type: 'photo_upload',
          fileName: file.name,
          fileSize: file.size,
          element: element,
          message: 'You\'re about to share a photo.',
          suggestion: 'Make sure it doesn\'t contain personal information like documents, addresses, or private spaces.'
        });
      }
    });
  }

  detectSensitiveData(text) {
    const detections = [];

    for (const [type, pattern] of Object.entries(this.sensitivePatterns)) {
      if (!this.settings?.detectionTypes?.[type]) continue;

      const matches = text.match(pattern);
      if (matches) {
        detections.push({
          type: type,
          matches: matches,
          severity: this.getSeverityLevel(type)
        });
      }
    }

    return detections;
  }

  detectOversharing(text) {
    const oversharingPatterns = [
      /\b(?:i live at|my address is|i work at|my job is)\b/gi,
      /\b(?:my phone number|call me at|text me at)\b/gi,
      /\b(?:my birthday is|born on|i was born)\b/gi,
      /\b(?:my bank|account number|routing number)\b/gi,
      /\b(?:feeling depressed|having anxiety|mental health)\b/gi,
      /\b(?:home alone|parents away|nobody home)\b/gi,
      /\b(?:going on vacation|leaving town|house empty)\b/gi,
      /\b(?:my salary|how much i make|my income)\b/gi
    ];

    const detections = [];
    
    oversharingPatterns.forEach((pattern, index) => {
      const matches = text.match(pattern);
      if (matches) {
        detections.push({
          type: 'oversharing',
          category: ['location', 'contact', 'personal', 'financial', 'health'][index],
          matches: matches
        });
      }
    });

    return detections;
  }

  getSeverityLevel(type) {
    const severityMap = {
      phone: 'high',
      email: 'medium',
      ssn: 'critical',
      creditCard: 'critical',
      address: 'high',
      atmPin: 'critical',
      password: 'critical',
      personal: 'medium'
    };

    return severityMap[type] || 'low';
  }

  getSuggestionForDetection(detection) {
    const suggestions = {
      phone: 'Consider using a business number or avoiding sharing your personal phone number online.',
      email: 'Use a separate email for public posts, or avoid sharing your primary email address.',
      ssn: 'Never share your Social Security Number online! This is extremely dangerous.',
      creditCard: 'Never share credit card numbers! If this is for a purchase, make sure you\'re on a secure, trusted website.',
      address: 'Sharing your home address can compromise your safety. Consider using general location references instead.',
      atmPin: 'Never share your ATM PIN anywhere online! Change it immediately if you\'ve already shared it.',
      password: 'Sharing passwords is extremely dangerous. Use unique, strong passwords and never share them.',
      personal: 'This looks like personal information. Consider if sharing this is necessary.'
    };

    return suggestions[detection.type] || 'Be cautious about sharing personal information online.';
  }

  showAlert(alertData) {
    if (this.isProcessing) {
      this.alertQueue.push(alertData);
      return;
    }

    this.isProcessing = true;
    this.createAlertOverlay(alertData);

    // Update statistics
    chrome.runtime.sendMessage({
      action: 'UPDATE_STATS',
      stats: { alertsShown: 1, dataProtected: alertData.detections?.length || 1 }
    });

    setTimeout(() => {
      this.isProcessing = false;
      if (this.alertQueue.length > 0) {
        this.showAlert(this.alertQueue.shift());
      }
    }, 1000);
  }

  createAlertOverlay(alertData) {
    // Remove any existing alerts
    const existingAlert = document.getElementById('safepost-alert');
    if (existingAlert) existingAlert.remove();

    // Log for debugging
    console.log('SafePost: Creating alert for:', alertData.type);

    const alertContainer = document.createElement('div');
    alertContainer.id = 'safepost-alert';
    alertContainer.className = 'safepost-alert-container';

    const severityClass = this.getSeverityClass(alertData);
    
    alertContainer.innerHTML = `
      <div class="safepost-alert ${severityClass}">
        <div class="safepost-alert-header">
          <div class="safepost-alert-icon">
            ${this.getAlertIcon(alertData.type)}
          </div>
          <div class="safepost-alert-title">
            Privacy Alert
          </div>
          <button class="safepost-alert-close" onclick="this.closest('.safepost-alert-container').remove()">
            ×
          </button>
        </div>
        <div class="safepost-alert-content">
          <p class="safepost-alert-message">${alertData.message}</p>
          <p class="safepost-alert-suggestion">${alertData.suggestion}</p>
          ${this.generateDetailedInfo(alertData)}
        </div>
        <div class="safepost-alert-actions">
          <button class="safepost-btn safepost-btn-primary" onclick="this.closest('.safepost-alert-container').remove()">
            I Understand
          </button>
          <button class="safepost-btn safepost-btn-secondary" onclick="window.open('chrome-extension://${chrome.runtime.id}/src/popup.html', '_blank')">
            Learn More
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(alertContainer);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (alertContainer.parentNode) {
        alertContainer.remove();
      }
    }, 10000);

    // Add entrance animation
    requestAnimationFrame(() => {
      alertContainer.style.opacity = '1';
      alertContainer.style.transform = 'translateY(0)';
    });
  }

  getSeverityClass(alertData) {
    if (alertData.detections) {
      const maxSeverity = Math.max(...alertData.detections.map(d => {
        switch (d.severity) {
          case 'critical': return 4;
          case 'high': return 3;
          case 'medium': return 2;
          default: return 1;
        }
      }));

      switch (maxSeverity) {
        case 4: return 'severity-critical';
        case 3: return 'severity-high';
        case 2: return 'severity-medium';
        default: return 'severity-low';
      }
    }
    
    return 'severity-medium';
  }

  getAlertIcon(type) {
    const icons = {
      sensitive_data: '🛡️',
      social_media_post: '📱',
      photo_upload: '📸',
      form_submission: '📋'
    };

    return icons[type] || '⚠️';
  }

  generateDetailedInfo(alertData) {
    if (alertData.detections && alertData.detections.length > 0) {
      const detectionList = alertData.detections.map(detection => 
        `<li><strong>${this.getDetectionLabel(detection.type)}</strong> detected</li>`
      ).join('');

      return `
        <div class="safepost-alert-details">
          <p><strong>Detected sensitive information:</strong></p>
          <ul>${detectionList}</ul>
        </div>
      `;
    }

    if (alertData.type === 'photo_upload') {
      return `
        <div class="safepost-alert-details">
          <p><strong>File:</strong> ${alertData.fileName}</p>
          <p><strong>Size:</strong> ${this.formatFileSize(alertData.fileSize)}</p>
        </div>
      `;
    }

    return '';
  }

  getDetectionLabel(type) {
    const labels = {
      phone: 'Phone Number',
      email: 'Email Address',
      ssn: 'Social Security Number',
      creditCard: 'Credit Card Number',
      address: 'Home Address',
      atmPin: 'ATM PIN',
      password: 'Password',
      personal: 'Personal Information'
    };

    return labels[type] || 'Sensitive Data';
  }

  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize detector when content script loads
new SafePostDetector();