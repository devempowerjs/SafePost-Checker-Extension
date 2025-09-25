// SafePost Checker Background Script
class SafePostBackground {
  constructor() {
    this.initializeExtension();
    this.setupMessageHandlers();
    this.setupTabHandlers();
  }

  initializeExtension() {
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.setDefaultSettings();
        this.showWelcomeNotification();
      }
    });
  }

  setDefaultSettings() {
    const defaultSettings = {
      enabled: true,
      sensitivityLevel: 'medium',
      alertStyle: 'educational',
      detectionTypes: {
        phone: true,
        email: true,
        address: true,
        financial: true,
        password: true,
        personal: true
      },
      whitelist: [],
      stats: {
        alertsShown: 0,
        dataProtected: 0,
        lastUpdated: Date.now()
      }
    };

    chrome.storage.sync.set(defaultSettings);
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'SENSITIVE_DATA_DETECTED':
          this.handleSensitiveDataDetection(request.data, sender.tab);
          break;
        case 'UPDATE_STATS':
          this.updateStats(request.stats);
          break;
        case 'GET_SETTINGS':
          this.getSettings(sendResponse);
          return true;
        case 'UPDATE_SETTINGS':
          this.updateSettings(request.settings, sendResponse);
          return true;
        case 'CLEAR_HISTORY':
          this.clearBrowsingHistory(sendResponse);
          return true;
        case 'MANAGE_COOKIES':
          this.manageCookies(request.domain, sendResponse);
          return true;
      }
    });
  }

  setupTabHandlers() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.analyzePageContext(tab);
      }
    });
  }

  handleSensitiveDataDetection(data, tab) {
    this.updateStats({ alertsShown: 1 });
    
    // Log for analytics (local only)
    console.log(`SafePost Alert: ${data.type} detected on ${tab.url}`);
  }

  updateStats(newStats) {
    chrome.storage.sync.get(['stats'], (result) => {
      const currentStats = result.stats || { alertsShown: 0, dataProtected: 0 };
      const updatedStats = {
        alertsShown: currentStats.alertsShown + (newStats.alertsShown || 0),
        dataProtected: currentStats.dataProtected + (newStats.dataProtected || 0),
        lastUpdated: Date.now()
      };
      
      chrome.storage.sync.set({ stats: updatedStats });
    });
  }

  getSettings(sendResponse) {
    chrome.storage.sync.get(null, (settings) => {
      sendResponse(settings);
    });
  }

  updateSettings(newSettings, sendResponse) {
    chrome.storage.sync.set(newSettings, () => {
      sendResponse({ success: true });
    });
  }

  clearBrowsingHistory(sendResponse) {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    chrome.history.deleteRange({
      startTime: oneWeekAgo,
      endTime: Date.now()
    }, () => {
      sendResponse({ success: true, message: 'Recent browsing history cleared' });
    });
  }

  manageCookies(domain, sendResponse) {
    chrome.cookies.getAll({ domain }, (cookies) => {
      const cookiePromises = cookies.map(cookie => 
        new Promise((resolve) => {
          chrome.cookies.remove({
            url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
            name: cookie.name
          }, resolve);
        })
      );

      Promise.all(cookiePromises).then(() => {
        sendResponse({ 
          success: true, 
          message: `Cleared ${cookies.length} cookies for ${domain}` 
        });
      });
    });
  }

  analyzePageContext(tab) {
    // Analyze if current page is a social media platform
    const socialMediaDomains = [
      'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
      'linkedin.com', 'tiktok.com', 'snapchat.com', 'discord.com'
    ];

    const isSocialMedia = socialMediaDomains.some(domain => 
      tab.url.includes(domain)
    );

    if (isSocialMedia) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'ENABLE_ENHANCED_MONITORING',
        context: 'social_media'
      });
    }
  }

  showWelcomeNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'SafePost Checker Installed!',
      message: 'Your digital privacy guardian is now active. Click the extension icon to customize settings.'
    });
  }
}

// Initialize background script
new SafePostBackground();