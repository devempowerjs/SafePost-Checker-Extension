// SafePost Alert Modal Script
class SafePostAlert {
  constructor() {
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Close button handler
    document.querySelector('.alert-close')?.addEventListener('click', () => {
      this.closeAlert();
    });

    // Overlay click handler
    document.querySelector('.alert-overlay')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('alert-overlay')) {
        this.closeAlert();
      }
    });

    // Action button handlers
    document.querySelector('.btn-primary')?.addEventListener('click', () => {
      this.editPost();
    });

    document.querySelector('.btn-secondary')?.addEventListener('click', () => {
      this.continueAnyway();
    });

    // ESC key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAlert();
      }
    });
  }

  closeAlert() {
    const overlay = document.querySelector('.alert-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        overlay.remove();
      }, 300);
    }
  }

  editPost() {
    this.closeAlert();
    // Focus back on the element that triggered the alert
    window.postMessage({ 
      type: 'SAFEPOST_EDIT_REQUEST',
      action: 'focus_element'
    }, '*');
  }

  continueAnyway() {
    this.closeAlert();
    // Allow the user to continue with their action
    window.postMessage({ 
      type: 'SAFEPOST_CONTINUE',
      action: 'allow_submission'
    }, '*');
  }
}

// Initialize alert when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SafePostAlert();
});