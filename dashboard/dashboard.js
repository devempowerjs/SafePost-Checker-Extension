// SafePost Institutional Dashboard Script
class SafePostDashboard {
  constructor() {
    this.loginType = sessionStorage.getItem('safepost_login_type') || 'school';
    this.institutionName = sessionStorage.getItem('safepost_institution_name') || 'Demo Institution';
    
    this.checkAuthentication();
    this.initializeDashboard();
    this.loadDashboardData();
    this.setupEventHandlers();
  }

  checkAuthentication() {
    if (!sessionStorage.getItem('safepost_login_type')) {
      window.location.href = 'login.html';
      return;
    }
  }

  initializeDashboard() {
    // Update welcome message
    document.getElementById('welcomeTitle').textContent = `Welcome, ${this.institutionName}`;
    document.getElementById('institutionName').textContent = this.institutionName;
    
    // Update header gradient based on type
    const header = document.querySelector('.dashboard-header');
    if (this.loginType === 'school') {
      header.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else {
      header.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
    }
  }

  loadDashboardData() {
    const statsData = this.getStatsData();
    this.renderStatsGrid(statsData);
    this.renderActivityChart();
  }

  getStatsData() {
    if (this.loginType === 'school') {
      return [
        {
          title: 'Students Trained',
          number: '247',
          description: 'Students completed privacy training this month',
          icon: '👨‍🎓',
          trend: { direction: 'up', value: '+12%' }
        },
        {
          title: 'Awareness Sessions',
          number: '8',
          description: 'Digital privacy workshops conducted',
          icon: '📚',
          trend: { direction: 'up', value: '+3' }
        },
        {
          title: 'Unsafe Attempts Blocked',
          number: '156',
          description: 'Potentially harmful posts prevented',
          icon: '🛡️',
          trend: { direction: 'down', value: '-8%' }
        },
        {
          title: 'Quiz Completion Rate',
          number: '89%',
          description: 'Students who completed privacy quizzes',
          icon: '✅',
          trend: { direction: 'up', value: '+5%' }
        }
      ];
    } else {
      return [
        {
          title: 'Employees Onboarded',
          number: '142',
          description: 'Staff members trained on digital privacy',
          icon: '👔',
          trend: { direction: 'up', value: '+18%' }
        },
        {
          title: 'Risky Posts Prevented',
          number: '73',
          description: 'Potentially damaging posts blocked',
          icon: '🚫',
          trend: { direction: 'down', value: '-15%' }
        },
        {
          title: 'Policy Compliance',
          number: '94%',
          description: 'Employees following safe posting guidelines',
          icon: '📋',
          trend: { direction: 'up', value: '+2%' }
        },
        {
          title: 'Training Modules',
          number: '12',
          description: 'Corporate awareness sessions completed',
          icon: '🎯',
          trend: { direction: 'up', value: '+4' }
        }
      ];
    }
  }

  renderStatsGrid(statsData) {
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = '';

    statsData.forEach(stat => {
      const statCard = document.createElement('div');
      statCard.className = 'stat-card';
      
      statCard.innerHTML = `
        <div class="stat-header">
          <div class="stat-title">${stat.title}</div>
          <div class="stat-icon">${stat.icon}</div>
        </div>
        <div class="stat-number">${stat.number}</div>
        <div class="stat-description">${stat.description}</div>
        <div class="stat-trend ${stat.trend.direction === 'up' ? 'trend-up' : 'trend-down'}">
          ${stat.trend.direction === 'up' ? '↗' : '↘'} ${stat.trend.value} from last month
        </div>
      `;
      
      statsGrid.appendChild(statCard);
    });
  }

  renderActivityChart() {
    const canvas = document.getElementById('activityChart');
    const ctx = canvas.getContext('2d');
    
    // Simple bar chart simulation
    const data = [45, 52, 38, 61, 42, 55, 48];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Chart settings
    const barWidth = 40;
    const barSpacing = 15;
    const maxHeight = 150;
    const maxValue = Math.max(...data);
    const startX = 50;
    const startY = canvas.height - 30;
    
    // Draw bars
    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * maxHeight;
      const x = startX + (index * (barWidth + barSpacing));
      const y = startY - barHeight;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, y, 0, startY);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#3b82f6');
      
      // Draw bar
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw label
      ctx.fillStyle = '#64748b';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + barWidth/2, startY + 20);
      
      // Draw value
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(value.toString(), x + barWidth/2, y - 8);
    });
  }

  setupEventHandlers() {
    // Refresh data every 30 seconds
    setInterval(() => {
      this.loadDashboardData();
    }, 30000);

    // Add click handlers for navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show notification for demo
        this.showNotification(`${item.querySelector('.nav-text').textContent} section coming soon!`);
      });
    });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `dashboard-notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '10000',
      opacity: '0',
      transform: 'translateX(100px)',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
    });

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Global logout function
function logout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SafePostDashboard();
});