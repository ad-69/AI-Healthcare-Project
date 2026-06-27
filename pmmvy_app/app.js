/**
 * PMMVY Maternal IFA Portal Logic
 * State management, charts initialization, filtering, and forms.
 */

// Application State
let state = {
  beneficiaries: [],
  supplementationRecords: [],
  pills: [],
  reviews: [],
  states: [],
  transactions: [],
  ashaWorkers: [],
  currentUser: null,
  currentTheme: 'dark',
  currentPage: 1,
  pageSize: 10,
  charts: {} // Store chart instances to update or destroy them
};

// Initialize the Application
document.addEventListener('DOMContentLoaded', () => {
  loadInitialData();
  setupRouting();
  setupEventListeners();
  setupTheme();
  renderAll();
});

// Load data from global PMMVY_DATA variable or localStorage
function loadInitialData() {
  // Load Beneficiaries
  if (localStorage.getItem('pmmvy_beneficiaries')) {
    state.beneficiaries = JSON.parse(localStorage.getItem('pmmvy_beneficiaries'));
    if (!state.beneficiaries || state.beneficiaries.length === 0) {
      if (typeof PMMVY_DATA !== 'undefined') {
        state.beneficiaries = [...PMMVY_DATA.beneficiaries];
        saveToLocalStorage('beneficiaries');
      }
    }
  } else if (typeof PMMVY_DATA !== 'undefined') {
    state.beneficiaries = [...PMMVY_DATA.beneficiaries];
    saveToLocalStorage('beneficiaries');
  }

  // Load Supplementation Records
  if (localStorage.getItem('pmmvy_supplementationRecords')) {
    state.supplementationRecords = JSON.parse(localStorage.getItem('pmmvy_supplementationRecords'));
    if (!state.supplementationRecords || state.supplementationRecords.length === 0) {
      if (typeof PMMVY_DATA !== 'undefined') {
        state.supplementationRecords = [...PMMVY_DATA.supplementationRecords];
        saveToLocalStorage('supplementationRecords');
      }
    }
  } else if (typeof PMMVY_DATA !== 'undefined') {
    state.supplementationRecords = [...PMMVY_DATA.supplementationRecords];
    saveToLocalStorage('supplementationRecords');
  }

  // Load Reviews
  if (localStorage.getItem('pmmvy_reviews')) {
    state.reviews = JSON.parse(localStorage.getItem('pmmvy_reviews'));
    if (!state.reviews || state.reviews.length === 0) {
      if (typeof PMMVY_DATA !== 'undefined') {
        state.reviews = [...PMMVY_DATA.reviews];
        saveToLocalStorage('reviews');
      }
    }
  } else if (typeof PMMVY_DATA !== 'undefined') {
    state.reviews = [...PMMVY_DATA.reviews];
    saveToLocalStorage('reviews');
  }

  // Load Transactions
  if (localStorage.getItem('pmmvy_transactions')) {
    state.transactions = JSON.parse(localStorage.getItem('pmmvy_transactions'));
    if (!state.transactions || state.transactions.length === 0) {
      if (typeof PMMVY_DATA !== 'undefined') {
        state.transactions = [...PMMVY_DATA.transactions];
        saveToLocalStorage('transactions');
      }
    }
  } else if (typeof PMMVY_DATA !== 'undefined') {
    state.transactions = [...PMMVY_DATA.transactions];
    saveToLocalStorage('transactions');
  }

  // Load static pills and states
  if (typeof PMMVY_DATA !== 'undefined') {
    state.pills = [...PMMVY_DATA.pills];
    state.states = [...PMMVY_DATA.states];
  }

  // Load ASHA workers
  if (localStorage.getItem('pmmvy_ashaWorkers')) {
    state.ashaWorkers = JSON.parse(localStorage.getItem('pmmvy_ashaWorkers'));
    if (!state.ashaWorkers || state.ashaWorkers.length === 0) {
      state.ashaWorkers = [
        {
          name: "Anita Sharma",
          code: "ASHA-ANITA",
          mobile: "9988776655",
          district: "Hardoi",
          state: "Uttar Pradesh",
          password: "password",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60"
        }
      ];
      saveToLocalStorage('ashaWorkers');
    }
  } else {
    state.ashaWorkers = [
      {
        name: "Anita Sharma",
        code: "ASHA-ANITA",
        mobile: "9988776655",
        district: "Hardoi",
        state: "Uttar Pradesh",
        password: "password",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60"
      }
    ];
    saveToLocalStorage('ashaWorkers');
  }

  // Load logged in session
  if (localStorage.getItem('pmmvy_currentUser')) {
    state.currentUser = JSON.parse(localStorage.getItem('pmmvy_currentUser'));
  }
}

function saveToLocalStorage(key) {
  if (key === 'all') {
    localStorage.setItem('pmmvy_beneficiaries', JSON.stringify(state.beneficiaries));
    localStorage.setItem('pmmvy_supplementationRecords', JSON.stringify(state.supplementationRecords));
    localStorage.setItem('pmmvy_reviews', JSON.stringify(state.reviews));
    localStorage.setItem('pmmvy_transactions', JSON.stringify(state.transactions));
    localStorage.setItem('pmmvy_ashaWorkers', JSON.stringify(state.ashaWorkers));
    if (state.currentUser) {
      localStorage.setItem('pmmvy_currentUser', JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem('pmmvy_currentUser');
    }
  } else {
    localStorage.setItem(`pmmvy_${key}`, JSON.stringify(state[key]));
  }
}

// Simple Hash-based Router
function setupRouting() {
  const ashaScreens = ['dashboard', 'beneficiaries', 'asha', 'payments', 'reviews', 'medicines'];
  const benScreens = ['ben-dashboard', 'ben-payments', 'ben-feedback', 'ben-medicines', 'ben-anemia', 'ben-pill-scan'];
  const allScreens = [...ashaScreens, ...benScreens];
  
  const handleRoute = () => {
    if (!state.currentUser) {
      document.body.className = 'not-logged-in';
      window.location.hash = ''; // Clear hash for security
      return;
    }
    
    document.body.className = `logged-in role-${state.currentUser.role}`;
    
    // Update logged user profile in sidebar
    document.getElementById('logged-user-name').textContent = state.currentUser.name || state.currentUser.beneficiary_name;
    document.getElementById('logged-user-role').textContent = state.currentUser.role === 'asha' ? 'ASHA Worker' : 'Beneficiary Mother';
    if (state.currentUser.avatar) {
      document.getElementById('logged-user-avatar').src = state.currentUser.avatar;
    } else {
      document.getElementById('logged-user-avatar').src = state.currentUser.role === 'asha' 
        ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60"
        : "https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=100&auto=format&fit=crop&q=60";
    }

    let defaultHash = state.currentUser.role === 'asha' ? 'dashboard' : 'ben-dashboard';
    let hash = window.location.hash.replace('#', '') || defaultHash;
    
    // Validate role permissions
    if (state.currentUser.role === 'asha' && benScreens.includes(hash)) {
      hash = 'dashboard';
      window.location.hash = '#dashboard';
    } else if (state.currentUser.role === 'beneficiary' && ashaScreens.includes(hash)) {
      hash = 'ben-dashboard';
      window.location.hash = '#ben-dashboard';
    }
    
    // Update sidebar menu active state
    allScreens.forEach(s => {
      const navBtn = document.getElementById(`nav-${s}`);
      const screenEl = document.getElementById(`screen-${s}`);
      
      if (s === hash) {
        if (navBtn) navBtn.classList.add('active');
        if (screenEl) screenEl.classList.remove('hidden');
      } else {
        if (navBtn) navBtn.classList.remove('active');
        if (screenEl) screenEl.classList.add('hidden');
      }
    });

    // Re-render specific screen content or charts if active
    if (hash === 'dashboard') {
      initDashboardCharts();
      renderDashboardActivities();
    } else if (hash === 'beneficiaries') {
      renderBeneficiariesTable();
    } else if (hash === 'asha') {
      renderAshaWorkbench();
    } else if (hash === 'payments') {
      renderPaymentsScreen();
    } else if (hash === 'reviews') {
      renderReviewsScreen();
    } else if (hash === 'medicines') {
      renderMedicinesScreen();
    } else if (hash === 'ben-dashboard') {
      renderBeneficiaryDashboard();
    } else if (hash === 'ben-payments') {
      renderBeneficiaryPayments();
    } else if (hash === 'ben-feedback') {
      renderBeneficiaryFeedback();
    } else if (hash === 'ben-medicines') {
      renderBeneficiaryMedicines();
    }
  };

  window.addEventListener('hashchange', handleRoute);
  // Initial route trigger
  handleRoute();
}

// Setup global event listeners
function setupEventListeners() {
  // Global search input
  const globalSearch = document.getElementById('global-search');
  globalSearch.addEventListener('input', () => {
    if (window.location.hash !== '#beneficiaries') {
      window.location.hash = '#beneficiaries';
    }
    state.currentPage = 1;
    renderBeneficiariesTable();
  });

  // Filter dropdowns
  document.getElementById('filter-state').addEventListener('change', () => {
    state.currentPage = 1;
    renderBeneficiariesTable();
  });
  document.getElementById('filter-status').addEventListener('change', () => {
    state.currentPage = 1;
    renderBeneficiariesTable();
  });
  document.getElementById('filter-anemia').addEventListener('change', () => {
    state.currentPage = 1;
    renderBeneficiariesTable();
  });

  // Reset filters button
  document.getElementById('btn-reset-filters').addEventListener('click', () => {
    document.getElementById('filter-state').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-anemia').value = '';
    globalSearch.value = '';
    state.currentPage = 1;
    renderBeneficiariesTable();
  });

  // Theme toggle button
  document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

  // Beneficiary Modals close
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('beneficiary-modal').classList.add('hidden');
  });

  // Add Beneficiary Modal trigger and close
  const addModal = document.getElementById('add-beneficiary-modal');
  document.getElementById('btn-add-beneficiary').addEventListener('click', () => {
    addModal.classList.remove('hidden');
  });
  document.getElementById('btn-close-add-modal').addEventListener('click', () => {
    addModal.classList.add('hidden');
  });

  // Handle Form Submission: Register Beneficiary
  document.getElementById('form-add-beneficiary').addEventListener('submit', (e) => {
    e.preventDefault();
    handleRegisterBeneficiary();
  });

  // Handle Form Submission: Log ASHA Checkup Visit
  document.getElementById('form-log-visit').addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogCheckupVisit();
  });

  // Handle Form Submission: Submit Review
  document.getElementById('form-submit-review').addEventListener('submit', (e) => {
    e.preventDefault();
    handleReviewSubmit();
  });

  // Medicine Dosage Guide calculation
  document.getElementById('btn-calculate-dosage').addEventListener('click', calculateDosageAdvisory);

  // ================= NEW PORTAL HANDLERS =================
  // ASHA Auth Form Actions
  document.getElementById('form-asha-login').addEventListener('submit', (e) => {
    e.preventDefault();
    handleAshaLogin();
  });
  document.getElementById('form-asha-signup').addEventListener('submit', (e) => {
    e.preventDefault();
    handleAshaSignup();
  });

  // Beneficiary Auth Form Actions
  document.getElementById('form-beneficiary-login').addEventListener('submit', (e) => {
    e.preventDefault();
    handleBeneficiaryLogin();
  });
  document.getElementById('form-beneficiary-signup').addEventListener('submit', (e) => {
    e.preventDefault();
    handleBeneficiarySignup();
  });

  // Log Out buttons
  document.getElementById('btn-logout').addEventListener('click', handleLogout);
  document.getElementById('header-logout-btn').addEventListener('click', handleLogout);

  // Beneficiary dashboard events
  document.getElementById('btn-log-compliance-today').addEventListener('click', handleBeneficiaryDailyCompliance);
  
  // Beneficiary review form
  document.getElementById('form-ben-submit-review').addEventListener('submit', (e) => {
    e.preventDefault();
    handleBeneficiaryReviewSubmit();
  });

  // Beneficiary dosage calculator
  document.getElementById('btn-ben-calculate-dosage').addEventListener('click', handleBeneficiaryDosageCalculate);

  // New Scanners
  const formAnemia = document.getElementById('form-anemia-quiz');
  if (formAnemia) formAnemia.addEventListener('submit', submitAnemiaQuiz);
  
  const btnPill = document.getElementById('btn-start-pill-scan');
  if (btnPill) btnPill.addEventListener('click', startPillScan);
}

// Light / Dark Theme setup
function setupTheme() {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  state.currentTheme = currentTheme;
  document.documentElement.setAttribute('data-theme', currentTheme);
}

function toggleTheme() {
  const newTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
  state.currentTheme = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Reload dashboard charts if we are on dashboard tab to apply new grid/text colors
  if (window.location.hash === '#dashboard' || !window.location.hash) {
    initDashboardCharts();
  }
}

// Render dynamic parts of screens
function renderAll() {
  updateKPICards();
  populateDropdownFilters();
  populateBeneficiarySelectors();
}

// Calculate and update KPIs
function updateKPICards() {
  // 1. Total Registered Beneficiaries
  const totalBens = state.beneficiaries.length;
  document.getElementById('kpi-total-beneficiaries').textContent = totalBens.toLocaleString('en-IN');
  
  const pregnantCount = state.beneficiaries.filter(b => b.status === 'Pregnant').length;
  const lactatingCount = state.beneficiaries.filter(b => b.status === 'Lactating').length;
  document.getElementById('kpi-pregnant-lactating-ratio').textContent = `${pregnantCount} Pregnant / ${lactatingCount} Lactating`;

  // 2. IFA Compliance Rate (Pills Consumed / Pills Distributed)
  let totalDistributed = 0;
  let totalConsumed = 0;
  state.supplementationRecords.forEach(r => {
    totalDistributed += parseInt(r.pills_distributed || 0);
    totalConsumed += parseInt(r.pills_consumed || 0);
  });
  const complianceRate = totalDistributed > 0 ? Math.round((totalConsumed / totalDistributed) * 100) : 0;
  document.getElementById('kpi-ifa-compliance').textContent = `${complianceRate}%`;
  document.getElementById('kpi-pills-consumed-stat').textContent = `${totalConsumed.toLocaleString('en-IN')} / ${totalDistributed.toLocaleString('en-IN')} pills`;

  // 3. Total Benefit Disbursements (PMMVY Installments)
  let totalCash = 0;
  let successTransCount = 0;
  state.transactions.forEach(t => {
    if (t.status === 'Success') {
      totalCash += parseInt(t.amount || 0);
      successTransCount++;
    }
  });
  document.getElementById('kpi-total-disbursed').textContent = `₹${totalCash.toLocaleString('en-IN')}`;
  document.getElementById('kpi-successful-trans').textContent = `${successTransCount} Paid Installments`;

  // 4. Severe Anemia Cases count (hb level < 7)
  const severeCases = state.beneficiaries.filter(b => parseFloat(b.iron_level) < 7.0 || b.anemia_level.toLowerCase() === 'severe').length;
  document.getElementById('kpi-severe-anemia').textContent = severeCases;
}

// Populate dropdown filters based on loaded data
function populateDropdownFilters() {
  const stateFilter = document.getElementById('filter-state');
  
  // Get unique states
  const uniqueStates = [...new Set(state.beneficiaries.map(b => b.state))].sort();
  
  // Clear options except "All States"
  stateFilter.innerHTML = '<option value="">All States</option>';
  uniqueStates.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    stateFilter.appendChild(opt);
  });
}

// Populate Beneficiary select items for forms
function populateBeneficiarySelectors() {
  const visitSelector = document.getElementById('visit-beneficiary-id');
  const reviewSelector = document.getElementById('review-beneficiary-id');
  
  const optionsHTML = ['<option value="">-- Choose Beneficiary --</option>'];
  state.beneficiaries.forEach(b => {
    optionsHTML.push(`<option value="${b.beneficiary_id}">${b.beneficiary_name} (ID: ${b.beneficiary_id})</option>`);
  });
  
  const htmlString = optionsHTML.join('');
  visitSelector.innerHTML = htmlString;
  reviewSelector.innerHTML = htmlString;
}

// Initialize and render Dashboard Charts
function initDashboardCharts() {
  const isDark = state.currentTheme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)';

  // Destroy existing charts to reload clean instances
  Object.keys(state.charts).forEach(key => {
    if (state.charts[key]) {
      state.charts[key].destroy();
    }
  });

  // CHART 1: Anemia Severity Distribution (Doughnut)
  const anemiaCounts = { normal: 0, low: 0, medium: 0, severe: 0 };
  state.beneficiaries.forEach(b => {
    const level = (b.anemia_level || '').toLowerCase();
    if (level === 'normal' || parseFloat(b.iron_level) >= 11) anemiaCounts.normal++;
    else if (level === 'low' || (parseFloat(b.iron_level) >= 10 && parseFloat(b.iron_level) < 11)) anemiaCounts.low++;
    else if (level === 'medium' || (parseFloat(b.iron_level) >= 7 && parseFloat(b.iron_level) < 10)) anemiaCounts.medium++;
    else if (level === 'severe' || parseFloat(b.iron_level) < 7) anemiaCounts.severe++;
  });

  const ctxAnemia = document.getElementById('chart-anemia-severity').getContext('2d');
  state.charts.anemia = new Chart(ctxAnemia, {
    type: 'doughnut',
    data: {
      labels: ['Normal (>=11 g/dL)', 'Mild (10-10.9 g/dL)', 'Moderate (7-9.9 g/dL)', 'Severe (<7 g/dL)'],
      datasets: [{
        data: [anemiaCounts.normal, anemiaCounts.low, anemiaCounts.medium, anemiaCounts.severe],
        backgroundColor: ['#10b981', '#f59e0b', '#f43f5e', '#be123c'],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#1e293b' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor, font: { family: 'Outfit', size: 12 } }
        }
      }
    }
  });

  // CHART 2: IFA Consumption Rates by Trimester (Bar)
  const trimesterStats = {
    'Trimester 1': { dist: 0, cons: 0 },
    'Trimester 2': { dist: 0, cons: 0 },
    'Trimester 3': { dist: 0, cons: 0 },
    'Postnatal': { dist: 0, cons: 0 }
  };
  state.supplementationRecords.forEach(r => {
    const period = r.period;
    if (trimesterStats[period]) {
      trimesterStats[period].dist += parseInt(r.pills_distributed || 0);
      trimesterStats[period].cons += parseInt(r.pills_consumed || 0);
    }
  });

  const ctxIFA = document.getElementById('chart-ifa-consumption').getContext('2d');
  state.charts.ifa = new Chart(ctxIFA, {
    type: 'bar',
    data: {
      labels: Object.keys(trimesterStats),
      datasets: [
        {
          label: 'Distributed Pills',
          data: Object.values(trimesterStats).map(v => v.dist),
          backgroundColor: '#3b82f6',
          borderRadius: 6
        },
        {
          label: 'Consumed Pills',
          data: Object.values(trimesterStats).map(v => v.cons),
          backgroundColor: '#10b981',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor, font: { family: 'Outfit' } } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  // CHART 3: State-wise Village Coverage (Bar)
  const stateLabels = state.states.map(s => s.state_name);
  const registeredVillages = state.states.map(s => parseInt(s.registered_villages || 0));
  const unregisteredVillages = state.states.map(s => parseInt(s.unregistered_villages || 0));

  const ctxState = document.getElementById('chart-state-coverage').getContext('2d');
  state.charts.stateCoverage = new Chart(ctxState, {
    type: 'bar',
    data: {
      labels: stateLabels,
      datasets: [
        {
          label: 'Registered Villages',
          data: registeredVillages,
          backgroundColor: '#6366f1',
          borderRadius: 6
        },
        {
          label: 'Unregistered Villages',
          data: unregisteredVillages,
          backgroundColor: '#e2e8f0',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor, font: { family: 'Outfit' } } }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: textColor } },
        y: { stacked: true, grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });
}

// Render Dashboard activity list and testimonials
function renderDashboardActivities() {
  // Activity List: 5 latest visits
  const sortedRecords = [...state.supplementationRecords]
    .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date))
    .slice(0, 5);

  const container = document.getElementById('recent-activities');
  
  if (sortedRecords.length === 0) {
    container.innerHTML = '<p class="text-muted">No visits logged yet.</p>';
    return;
  }

  container.innerHTML = sortedRecords.map(r => {
    const ben = state.beneficiaries.find(b => b.beneficiary_id === r.beneficiary_id);
    const name = ben ? ben.beneficiary_name : `Mother #${r.beneficiary_id}`;
    const statusClass = r.verification_status === 'Consumed' ? 'verified' : (r.verification_status === 'Pending' ? 'pending' : 'failed');
    const statusIcon = r.verification_status === 'Consumed' ? 'fa-check' : (r.verification_status === 'Pending' ? 'fa-hourglass-half' : 'fa-circle-xmark');
    
    return `
      <div class="activity-item">
        <div class="activity-badge ${statusClass}">
          <i class="fa-solid ${statusIcon}"></i>
        </div>
        <div class="activity-desc">
          <h4>${name} - Visit Logged</h4>
          <p>${r.period}: Hb Level ${r.hemoglobin_level} g/dL, ${r.pills_consumed}/${r.pills_distributed} pills verified. </p>
          <span>Visit Date: ${formatDate(r.visit_date)}</span>
        </div>
      </div>
    `;
  }).join('');

  // Top Testimonials List
  const testimonials = state.reviews
    .filter(r => parseInt(r.rating) >= 4)
    .sort((a, b) => new Date(b.review_date) - new Date(a.review_date))
    .slice(0, 3);

  const testContainer = document.getElementById('top-feedback-list');
  if (testimonials.length === 0) {
    testContainer.innerHTML = '<p class="text-muted">No testimonials yet.</p>';
    return;
  }

  testContainer.innerHTML = testimonials.map(t => {
    const starsHTML = Array(parseInt(t.rating)).fill('<i class="fa-solid fa-star"></i>').join('');
    return `
      <div class="feedback-slide">
        <div class="feedback-slide-header">
          <h4>${t.reviewer_name}</h4>
          <div class="feedback-rating">${starsHTML}</div>
        </div>
        <p>"${t.review_text.length > 180 ? t.review_text.substring(0, 180) + '...' : t.review_text}"</p>
        <span>Submitted: ${formatDate(t.review_date)}</span>
      </div>
    `;
  }).join('');
}

// Render Beneficiary Directory table
function renderBeneficiariesTable() {
  const stateVal = document.getElementById('filter-state').value;
  const statusVal = document.getElementById('filter-status').value;
  const anemiaVal = document.getElementById('filter-anemia').value;
  const searchVal = document.getElementById('global-search').value.toLowerCase().trim();

  // Filter logic
  let filtered = state.beneficiaries.filter(b => {
    // 1. State filter
    if (stateVal && b.state !== stateVal) return false;
    // 2. Status filter
    if (statusVal && b.status !== statusVal) return false;
    
    // 3. Anemia level filter
    if (anemiaVal) {
      const hb = parseFloat(b.iron_level);
      if (anemiaVal === 'Normal' && hb < 11.0) return false;
      if (anemiaVal === 'Low' && (hb < 10.0 || hb >= 11.0)) return false;
      if (anemiaVal === 'Medium' && (hb < 7.0 || hb >= 10.0)) return false;
      if (anemiaVal === 'Severe' && hb >= 7.0) return false;
    }
    
    // 4. Search bar query
    if (searchVal) {
      const nameMatch = b.beneficiary_name.toLowerCase().includes(searchVal);
      const idMatch = b.beneficiary_id.includes(searchVal);
      const aadhaarMatch = b.aadhaar_id.replace(/\s/g, '').includes(searchVal.replace(/\s/g, ''));
      const mobileMatch = b.mobile.includes(searchVal);
      return nameMatch || idMatch || aadhaarMatch || mobileMatch;
    }
    
    return true;
  });

  // Pagination bounds
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / state.pageSize);
  const startIdx = (state.currentPage - 1) * state.pageSize;
  const endIdx = Math.min(startIdx + state.pageSize, totalCount);
  
  const pageItems = filtered.slice(startIdx, endIdx);
  const tbody = document.getElementById('beneficiaries-table-body');
  
  if (pageItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">No beneficiaries matching filters.</td></tr>';
    document.getElementById('beneficiaries-pagination').innerHTML = '';
    return;
  }

  tbody.innerHTML = pageItems.map(b => {
    const hb = parseFloat(b.iron_level);
    let anemiaClass = 'badge-green';
    let anemiaText = 'Normal';
    
    if (hb < 7.0) { anemiaClass = 'badge-red'; anemiaText = 'Severe Anemia'; }
    else if (hb < 10.0) { anemiaClass = 'badge-orange'; anemiaText = 'Moderate Anemia'; }
    else if (hb < 11.0) { anemiaClass = 'badge-purple'; anemiaText = 'Mild Anemia'; }

    return `
      <tr>
        <td>#${b.beneficiary_id}</td>
        <td class="name-column">${b.beneficiary_name}</td>
        <td>${b.village}, ${b.state}</td>
        <td>${b.age} yrs</td>
        <td><span class="badge ${b.status === 'Pregnant' ? 'badge-blue' : 'badge-purple'}">${b.status}</span></td>
        <td><strong>${b.iron_level} g/dL</strong></td>
        <td><span class="badge ${anemiaClass}">${anemiaText}</span></td>
        <td>${b.ifa_pill_dosage} pills</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="showBeneficiaryDetails('${b.beneficiary_id}')">
            <i class="fa-solid fa-folder-open"></i> Profile
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Render pagination bar
  const pag = document.getElementById('beneficiaries-pagination');
  pag.innerHTML = `
    <div class="pagination-info">
      Showing <strong>${startIdx + 1}-${endIdx}</strong> of <strong>${totalCount}</strong> entries
    </div>
    <div class="pagination-controls">
      <button class="btn btn-secondary btn-sm" id="btn-prev-page" ${state.currentPage === 1 ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-left"></i> Previous
      </button>
      <button class="btn btn-secondary btn-sm" id="btn-next-page" ${state.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>
        Next <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;

  // Attach pagination control listeners
  document.getElementById('btn-prev-page')?.addEventListener('click', () => {
    state.currentPage--;
    renderBeneficiariesTable();
  });
  document.getElementById('btn-next-page')?.addEventListener('click', () => {
    state.currentPage++;
    renderBeneficiariesTable();
  });
}

// Show specific beneficiary detail modal
window.showBeneficiaryDetails = function(benId) {
  const ben = state.beneficiaries.find(b => b.beneficiary_id === benId);
  if (!ben) return;

  // Set text fields in modal
  document.getElementById('modal-name').textContent = ben.beneficiary_name;
  document.getElementById('modal-id').textContent = `#${ben.beneficiary_id}`;
  document.getElementById('modal-status').textContent = ben.status;
  
  // Set badge class
  const badgeEl = document.getElementById('modal-status');
  badgeEl.className = `badge ${ben.status === 'Pregnant' ? 'badge-blue' : 'badge-purple'}`;

  document.getElementById('modal-aadhaar').textContent = ben.aadhaar_id;
  document.getElementById('modal-mobile').textContent = ben.mobile;
  document.getElementById('modal-age').textContent = `${ben.age} years`;
  document.getElementById('modal-state-village').textContent = `${ben.village}, ${ben.state}`;
  document.getElementById('modal-address').textContent = ben.address;

  // Populate Supplementation History log
  const records = state.supplementationRecords.filter(r => r.beneficiary_id === benId);
  const recordsBody = document.getElementById('modal-supp-records');
  if (records.length === 0) {
    recordsBody.innerHTML = '<tr><td colspan="8" class="text-center">No checks logged for this beneficiary.</td></tr>';
  } else {
    recordsBody.innerHTML = records.map(r => {
      const statClass = r.verification_status === 'Consumed' ? 'badge-green' : (r.verification_status === 'Pending' ? 'badge-orange' : 'badge-red');
      
      const hb = parseFloat(r.hemoglobin_level);
      let anemiaClass = 'badge-green';
      let anemiaText = 'Normal';
      if (hb < 7.0) { anemiaClass = 'badge-red'; anemiaText = 'Severe'; }
      else if (hb < 10.0) { anemiaClass = 'badge-orange'; anemiaText = 'Moderate'; }
      else if (hb < 11.0) { anemiaClass = 'badge-purple'; anemiaText = 'Mild'; }

      return `
        <tr>
          <td><strong>${r.period}</strong></td>
          <td>${formatDate(r.visit_date)}</td>
          <td>${r.hemoglobin_level} g/dL</td>
          <td><span class="badge ${anemiaClass}">${anemiaText}</span></td>
          <td>${r.pills_distributed} pills</td>
          <td>${r.pills_consumed} pills</td>
          <td><span class="badge ${statClass}">${r.verification_status}</span></td>
          <td>${r.notes || '-'}</td>
        </tr>
      `;
    }).join('');
  }

  // Populate Payments Installments logs
  const trans = state.transactions.filter(t => t.beneficiary_id === benId);
  const transBody = document.getElementById('modal-transactions');
  if (trans.length === 0) {
    transBody.innerHTML = '<tr><td colspan="6" class="text-center">No cash benefit transfers logged.</td></tr>';
  } else {
    transBody.innerHTML = trans.map(t => {
      const statClass = t.status === 'Success' ? 'badge-green' : (t.status === 'Pending' ? 'badge-orange' : 'badge-red');
      return `
        <tr>
          <td><strong>Installment ${t.installment_number}</strong></td>
          <td>₹${parseInt(t.amount).toLocaleString('en-IN')}</td>
          <td>${formatDate(t.payment_date)}</td>
          <td><code>${t.reference_no}</code></td>
          <td>${t.payment_mode}</td>
          <td><span class="badge ${statClass}">${t.status}</span></td>
        </tr>
      `;
    }).join('');
  }

  // Open the modal overlay
  document.getElementById('beneficiary-modal').classList.remove('hidden');
};

// Handle Form Submission: Add/Register Beneficiary
function handleRegisterBeneficiary() {
  const name = document.getElementById('new-name').value;
  const stateVal = document.getElementById('new-state').value;
  const village = document.getElementById('new-village').value;
  const age = document.getElementById('new-age').value;
  const status = document.getElementById('new-status').value;
  const mobile = document.getElementById('new-mobile').value;
  const aadhaar = document.getElementById('new-aadhaar').value;
  const hb = document.getElementById('new-hb').value;
  const dosage = document.getElementById('new-dosage').value;
  const address = document.getElementById('new-address').value;

  // Generate new sequential ID
  const latestId = Math.max(...state.beneficiaries.map(b => parseInt(b.beneficiary_id)));
  const newId = (latestId + 1).toString();

  // Anemia Level evaluation
  const hbVal = parseFloat(hb);
  let anemia = 'Normal';
  if (hbVal < 7.0) anemia = 'Severe';
  else if (hbVal < 10.0) anemia = 'Medium';
  else if (hbVal < 11.0) anemia = 'Low';

  const newBen = {
    beneficiary_id: newId,
    beneficiary_name: name,
    state: stateVal,
    village: village,
    age: age,
    status: status,
    iron_level: hb,
    ifa_pill_dosage: dosage,
    mobile: mobile,
    address: address,
    aadhaar_id: aadhaar,
    anemia_level: anemia
  };

  // Add to State
  state.beneficiaries.unshift(newBen);

  // Automatically create the first installment transaction as pending for registration checkup
  const latestTransId = Math.max(...state.transactions.map(t => parseInt(t.transaction_id)));
  const newTrans = {
    transaction_id: (latestTransId + 1).toString(),
    beneficiary_id: newId,
    installment_number: "1",
    amount: "1000",
    payment_date: getTodayDateString(),
    payment_mode: "Bank Transfer",
    status: "Pending",
    reference_no: `PMMVY0000${latestTransId + 1}`
  };
  state.transactions.unshift(newTrans);

  // Success notify & reload views
  alert(`Beneficiary ${name} successfully registered under ID: ${newId}. First Installment (₹1,000) generated.`);
  document.getElementById('form-add-beneficiary').reset();
  document.getElementById('add-beneficiary-modal').classList.add('hidden');
  
  // Reload states
  updateKPICards();
  populateBeneficiarySelectors();
  renderBeneficiariesTable();
}

// Render ASHA Workbench screen
function renderAshaWorkbench() {
  const pendingRecords = state.supplementationRecords
    .filter(r => r.verification_status === 'Pending')
    .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

  const listContainer = document.getElementById('pending-verifications');

  if (pendingRecords.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center py-4 text-muted">
        <i class="fa-solid fa-circle-check" style="font-size: 32px; color: var(--accent-green); margin-bottom: 12px; display: block;"></i>
        All distributed IFA supplementations verified! No pending records.
      </div>
    `;
    return;
  }

  listContainer.innerHTML = pendingRecords.map(r => {
    const ben = state.beneficiaries.find(b => b.beneficiary_id === r.beneficiary_id);
    const name = ben ? ben.beneficiary_name : `Mother #${r.beneficiary_id}`;
    const stateName = ben ? `${ben.village}, ${ben.state}` : '';
    
    return `
      <div class="verification-card">
        <div class="verification-card-header">
          <h4>${name} (ID: ${r.beneficiary_id})</h4>
          <span class="badge badge-orange">${r.period}</span>
        </div>
        <div class="verification-meta">
          <span><i class="fa-solid fa-calendar-days"></i> Visit: ${formatDate(r.visit_date)}</span>
          <span><i class="fa-solid fa-pills"></i> Distributed: ${r.pills_distributed} pills</span>
          <span><i class="fa-solid fa-stethoscope"></i> Hb Level: ${r.hemoglobin_level} g/dL</span>
        </div>
        ${r.notes ? `<p class="verification-notes">${r.notes}</p>` : ''}
        <div class="verification-actions">
          <button class="btn btn-danger btn-sm" onclick="verifyPillConsumption('${r.record_id}', 'Not Consumed')">
            <i class="fa-solid fa-xmark"></i> Not Consumed
          </button>
          <button class="btn btn-primary btn-sm" onclick="verifyPillConsumption('${r.record_id}', 'Consumed')">
            <i class="fa-solid fa-check"></i> Consumed
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Verify pill consumption from workbench
window.verifyPillConsumption = function(recordId, status) {
  const record = state.supplementationRecords.find(r => r.record_id === recordId);
  if (!record) return;

  record.verification_status = status;
  if (status === 'Consumed') {
    // ASHA verifies consumption - let's set consumed count equal to distributed for calculation
    record.pills_consumed = record.pills_distributed;
    
    // Also trigger the next installment if they consumed Trimester 2/3 pills successfully!
    const benId = record.beneficiary_id;
    const existingTrans = state.transactions.filter(t => t.beneficiary_id === benId);
    
    // Trigger Installment 2 (₹2,000) if not generated already and verified Consumed during Trimester 2/3
    if (record.period.includes('Trimester 2') && !existingTrans.some(t => t.installment_number === '2')) {
      const latestTransId = Math.max(...state.transactions.map(t => parseInt(t.transaction_id)));
      state.transactions.unshift({
        transaction_id: (latestTransId + 1).toString(),
        beneficiary_id: benId,
        installment_number: "2",
        amount: "2000",
        payment_date: getTodayDateString(),
        payment_mode: "Bank Transfer",
        status: "Success",
        reference_no: `PMMVY0000${latestTransId + 1}`
      });
      alert("Congratulations! Trimester 2 IFA compliance verified. PMMVY Installment 2 (₹2,000) has been disbursed successfully.");
    }
  } else {
    record.pills_consumed = "0";
  }

  // Update views
  updateKPICards();
  renderAshaWorkbench();
};

// Handle Form Submission: Log Checkup Visit
function handleLogCheckupVisit() {
  const benId = document.getElementById('visit-beneficiary-id').value;
  const date = document.getElementById('visit-date').value;
  const period = document.getElementById('visit-period').value;
  const pillId = document.getElementById('visit-pill-id').value;
  const dist = document.getElementById('visit-pills-distributed').value;
  const cons = document.getElementById('visit-pills-consumed').value;
  const hb = document.getElementById('visit-hb-level').value;
  const ver = document.getElementById('visit-verification').value;
  const notes = document.getElementById('visit-notes').value;

  if (!benId || !date) {
    alert("Please fill in all required fields.");
    return;
  }

  const latestId = Math.max(...state.supplementationRecords.map(r => parseInt(r.record_id)));
  
  // Evaluate anemia status
  let anemia = 'Normal';
  if (hb) {
    const hbVal = parseFloat(hb);
    if (hbVal < 7.0) anemia = 'Severe';
    else if (hbVal < 10.0) anemia = 'Medium';
    else if (hbVal < 11.0) anemia = 'Low';
  }

  const newRecord = {
    record_id: (latestId + 1).toString(),
    beneficiary_id: benId,
    period: period,
    visit_date: date,
    pills_distributed: dist,
    pills_consumed: cons,
    verification_status: ver,
    hemoglobin_level: hb || "11.0",
    notes: notes,
    anemia_level: anemia,
    pill_id: pillId
  };

  // Add to State
  state.supplementationRecords.unshift(newRecord);

  // Update beneficiary Hb level and anemia level as well
  const ben = state.beneficiaries.find(b => b.beneficiary_id === benId);
  if (ben && hb) {
    ben.iron_level = hb;
    ben.anemia_level = anemia;
  }

  // If visit logged is postnatal and status is Consumed, disburse Installment 3
  if (period === 'Postnatal' && ver === 'Consumed') {
    const existingTrans = state.transactions.filter(t => t.beneficiary_id === benId);
    if (!existingTrans.some(t => t.installment_number === '3')) {
      const latestTransId = Math.max(...state.transactions.map(t => parseInt(t.transaction_id)));
      state.transactions.unshift({
        transaction_id: (latestTransId + 1).toString(),
        beneficiary_id: benId,
        installment_number: "3",
        amount: "2000",
        payment_date: getTodayDateString(),
        payment_mode: "Bank Transfer",
        status: "Success",
        reference_no: `PMMVY0000${latestTransId + 1}`
      });
      alert("Postnatal follow-up registered successfully. Childbirth & immunization compliance met. Installment 3 (₹2,000) disbursed.");
    }
  }

  alert("Visit checkup record successfully saved!");
  document.getElementById('form-log-visit').reset();
  updateKPICards();
  renderAshaWorkbench();
}

// Render Payments and DBT Screen
function renderPaymentsScreen() {
  const isDark = state.currentTheme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)';

  // Calculate installment progress
  let i1Total = 0, i2Total = 0, i3Total = 0;
  state.transactions.forEach(t => {
    if (t.status === 'Success') {
      const amt = parseInt(t.amount || 0);
      if (t.installment_number === '1') i1Total += amt;
      else if (t.installment_number === '2') i2Total += amt;
      else if (t.installment_number === '3') i3Total += amt;
    }
  });

  const sumTotal = i1Total + i2Total + i3Total;
  const i1Percent = sumTotal > 0 ? Math.round((i1Total / sumTotal) * 100) : 0;
  const i2Percent = sumTotal > 0 ? Math.round((i2Total / sumTotal) * 100) : 0;
  const i3Percent = sumTotal > 0 ? Math.round((i3Total / sumTotal) * 100) : 0;

  // Set Progress bar
  document.getElementById('payment-i1-progress').style.width = `${i1Percent}%`;
  document.getElementById('payment-i2-progress').style.width = `${i2Percent}%`;
  document.getElementById('payment-i3-progress').style.width = `${i3Percent}%`;

  document.getElementById('payment-i1-disbursed').textContent = `₹${i1Total.toLocaleString('en-IN')} Disbursed (${i1Percent}%)`;
  document.getElementById('payment-i2-disbursed').textContent = `₹${i2Total.toLocaleString('en-IN')} Disbursed (${i2Percent}%)`;
  document.getElementById('payment-i3-disbursed').textContent = `₹${i3Total.toLocaleString('en-IN')} Disbursed (${i3Percent}%)`;

  // Render recent transactions table
  const sortedTrans = [...state.transactions]
    .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
    .slice(0, 10);

  const tbody = document.getElementById('transactions-table-body');
  tbody.innerHTML = sortedTrans.map(t => {
    const ben = state.beneficiaries.find(b => b.beneficiary_id === t.beneficiary_id);
    const name = ben ? ben.beneficiary_name : `Mother #${t.beneficiary_id}`;
    const statusClass = t.status === 'Success' ? 'badge-green' : (t.status === 'Pending' ? 'badge-orange' : 'badge-red');
    
    return `
      <tr>
        <td>#${t.transaction_id}</td>
        <td><strong>${name}</strong><br><span style="font-size: 11px; color: var(--text-muted);">ID: ${t.beneficiary_id}</span></td>
        <td>Installment ${t.installment_number}</td>
        <td><strong>₹${parseInt(t.amount).toLocaleString('en-IN')}</strong></td>
        <td>${formatDate(t.payment_date)}</td>
        <td>${t.payment_mode}</td>
        <td><span class="badge ${statusClass}">${t.status}</span></td>
        <td><code>${t.reference_no}</code></td>
      </tr>
    `;
  }).join('');

  // Render payments by state chart
  const statePayments = {};
  state.transactions.forEach(t => {
    if (t.status === 'Success') {
      const ben = state.beneficiaries.find(b => b.beneficiary_id === t.beneficiary_id);
      if (ben) {
        statePayments[ben.state] = (statePayments[ben.state] || 0) + parseInt(t.amount || 0);
      }
    }
  });

  const ctxPayments = document.getElementById('chart-state-payments').getContext('2d');
  if (state.charts.payments) {
    state.charts.payments.destroy();
  }
  state.charts.payments = new Chart(ctxPayments, {
    type: 'pie',
    data: {
      labels: Object.keys(statePayments),
      datasets: [{
        data: Object.values(statePayments),
        backgroundColor: ['#6366f1', '#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#a855f7'],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#121826' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor, font: { family: 'Outfit', size: 12 } }
        }
      }
    }
  });
}

// Render Reviews and Feedback screen
function renderReviewsScreen() {
  const sortedReviews = [...state.reviews].sort((a, b) => new Date(b.review_date) - new Date(a.review_date));
  
  // Calculate average rating
  const total = sortedReviews.length;
  const sum = sortedReviews.reduce((acc, r) => acc + parseInt(r.rating || 0), 0);
  const avg = total > 0 ? (sum / total).toFixed(1) : '0.0';

  document.getElementById('reviews-avg-rating').textContent = avg;
  document.getElementById('reviews-count').textContent = `(${total})`;

  const listContainer = document.getElementById('reviews-list-container');
  if (sortedReviews.length === 0) {
    listContainer.innerHTML = '<p class="text-muted text-center py-4">No reviews submitted yet.</p>';
    return;
  }

  listContainer.innerHTML = sortedReviews.map(r => {
    const initials = r.reviewer_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const starsHTML = Array(parseInt(r.rating)).fill('<i class="fa-solid fa-star"></i>').join('');
    const emptyStarsHTML = Array(5 - parseInt(r.rating)).fill('<i class="fa-regular fa-star"></i>').join('');
    
    return `
      <div class="review-card">
        <div class="review-card-header">
          <div class="reviewer-profile">
            <div class="reviewer-icon">${initials}</div>
            <div class="reviewer-name">
              <h4>${r.reviewer_name}</h4>
              <span>Beneficiary ID: #${r.beneficiary_id}</span>
            </div>
          </div>
          <div class="review-rating-stars">
            ${starsHTML}${emptyStarsHTML}
          </div>
        </div>
        <div class="review-body">
          <p>"${r.review_text}"</p>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); text-align: right;">
          Submitted: ${formatDate(r.review_date)}
        </div>
      </div>
    `;
  }).join('');
}

// Handle Form Submission: Submit Review
function handleReviewSubmit() {
  const benId = document.getElementById('review-beneficiary-id').value;
  const ratingEl = document.querySelector('input[name="review-rating"]:checked');
  const reviewText = document.getElementById('review-text').value;

  if (!benId || !ratingEl || !reviewText) {
    alert("Please fill in all fields and select a rating.");
    return;
  }

  const ben = state.beneficiaries.find(b => b.beneficiary_id === benId);
  if (!ben) return;

  const latestId = Math.max(...state.reviews.map(r => parseInt(r.review_id)));
  
  const newReview = {
    review_id: (latestId + 1).toString(),
    beneficiary_id: benId,
    reviewer_name: ben.beneficiary_name,
    rating: ratingEl.value,
    review_text: reviewText,
    review_date: getTodayDateString()
  };

  // Add to state
  state.reviews.unshift(newReview);

  alert("Feedback successfully submitted!");
  document.getElementById('form-submit-review').reset();
  renderReviewsScreen();
}

// Render Medicines Screen
function renderMedicinesScreen() {
  const container = document.getElementById('medicines-list');
  container.innerHTML = state.pills.map(p => {
    const isTherapeutic = p.category.toLowerCase() === 'therapeutic';
    const classTag = isTherapeutic ? 'therapeutic' : 'prophylactic';
    const tagText = isTherapeutic ? 'Therapeutic' : 'Prophylactic';

    return `
      <div class="card medicine-card ${classTag}">
        <div class="medicine-pill-illustration">
          <i class="fa-solid fa-capsules"></i>
        </div>
        <div class="medicine-details">
          <div class="medicine-header">
            <h3>${p.medicine_name}</h3>
            <span class="badge ${isTherapeutic ? 'badge-red' : 'badge-blue'}">${tagText}</span>
          </div>
          <p class="medicine-composition"><strong>Composition:</strong> ${p.composition}</p>
          <div class="medicine-meta">
            <span>Iron Content: <strong>${p.iron_content_mg} mg</strong></span>
            <span>Folic Acid Content: <strong>${p.folic_acid_content_mcg} mcg</strong></span>
            <span>Manufacturer: <strong>${p.manufacturer}</strong></span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Calculate Dosage Advisory Guide
function calculateDosageAdvisory() {
  const status = document.getElementById('calc-status').value;
  const hb = parseFloat(document.getElementById('calc-hb').value);

  if (isNaN(hb)) {
    alert("Please enter a valid Hemoglobin level.");
    return;
  }

  const resultContainer = document.getElementById('calc-result');
  const anemiaEl = document.getElementById('calc-result-anemia-status');
  const pillEl = document.getElementById('calc-result-pill-type');
  const dosageEl = document.getElementById('calc-result-dosage');
  const ingEl = document.getElementById('calc-result-ingredients');
  const advisoryEl = document.getElementById('calc-result-advisory');

  let anemia = 'Normal';
  let pill = 'N/A';
  let dosage = 'No treatment required. Maintain healthy diet.';
  let composition = 'N/A';
  let advisory = 'Maintain standard iron-rich diet containing green leafy vegetables, dates, and jaggery.';

  if (hb < 7.0) {
    anemia = 'Severe';
    pill = 'IFA Red Tablet (Therapeutic)';
    dosage = '2 Tablets daily for 180 days (with clinical monitoring)';
    composition = 'Ferrous Sulphate 100mg elemental iron + Folic Acid 500mcg';
    advisory = '<strong>WARNING:</strong> Severe anemia requires immediate referral to a Medical Officer or Gynecologist at the nearest CHC/District Hospital. Consider blood transfusion if Hb < 5 g/dL.';
  } else if (hb < 10.0) {
    anemia = 'Medium';
    pill = 'IFA Red Tablet (Therapeutic)';
    dosage = '2 Tablets daily for 180 days';
    composition = 'Ferrous Sulphate 100mg elemental iron + Folic Acid 500mcg';
    advisory = 'Advise beneficiary to take tablets with lemon water (vitamin C) to enhance absorption. Monitor Hb level monthly. Ensure registration in the PMMVY scheme for nutrition benefits.';
  } else if (hb < 11.0) {
    anemia = 'Low';
    pill = 'IFA Red Tablet (Prophylactic)';
    dosage = '1 Tablet daily for 180 days';
    composition = 'Ferrous Sulphate 100mg elemental iron + Folic Acid 500mcg';
    advisory = 'Advise beneficiary to take tablets after meals to reduce gastrointestinal side-effects like nausea or black stools. Avoid tea or milk within an hour of pill consumption.';
  } else {
    // Normal level but pregnant women still need prophylactic dose
    if (status === 'Pregnant') {
      anemia = 'Normal';
      pill = 'IFA Blue/Red Tablet (Prophylactic)';
      dosage = '1 Tablet daily for 180 days starting from 4th month of pregnancy';
      composition = 'Ferrous Sulphate 100mg elemental iron + Folic Acid 500mcg';
      advisory = 'Standard preventative supplementation under national guidelines. Remind beneficiary that regular intake protects both maternal and fetal health.';
    } else {
      anemia = 'Normal';
      pill = 'None';
      dosage = 'No routine IFA supplementation needed if Hb remains normal postnatal. Maintain normal diet.';
      composition = 'None';
      advisory = 'Postnatal mothers should focus on rich diet for lactation. Check hemoglobin again if signs of weakness manifest.';
    }
  }

  // Set visual results
  anemiaEl.textContent = `${anemia} Anemia`;
  anemiaEl.className = `result-badge ${anemia}`;
  
  pillEl.textContent = pill;
  dosageEl.textContent = dosage;
  ingEl.textContent = composition;
  advisoryEl.innerHTML = `<strong>ASHA Counselling Note:</strong> ${advisory}`;

  resultContainer.classList.remove('hidden');
}

// Utility Helper functions
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getTodayDateString() {
  const d = new Date();
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();

  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

// ================= PORTAL LOGIC & FORM HANDLERS =================

window.switchAuthPortal = function(portal) {
  const tabs = document.querySelectorAll('.auth-tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  
  const sections = document.querySelectorAll('.auth-section');
  sections.forEach(s => s.classList.add('hidden'));
  
  if (portal === 'asha') {
    document.getElementById('tab-btn-asha').classList.add('active');
    document.getElementById('auth-section-asha').classList.remove('hidden');
  } else {
    document.getElementById('tab-btn-beneficiary').classList.add('active');
    document.getElementById('auth-section-beneficiary').classList.remove('hidden');
  }
};

window.toggleAuthMode = function(portal, mode) {
  const loginView = document.getElementById(`${portal}-login-view`);
  const signupView = document.getElementById(`${portal}-signup-view`);
  
  if (mode === 'signup') {
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
  } else {
    loginView.classList.remove('hidden');
    signupView.classList.add('hidden');
  }
};

function handleAshaLogin() {
  const loginId = document.getElementById('asha-login-id').value.trim().replace(/\s/g, '');
  const password = document.getElementById('asha-login-password').value;

  const worker = state.ashaWorkers.find(w => w.code === loginId || w.mobile === loginId);
  if (worker && worker.password === password) {
    state.currentUser = {
      role: 'asha',
      name: worker.name,
      code: worker.code,
      mobile: worker.mobile,
      district: worker.district,
      state: worker.state,
      avatar: worker.avatar
    };
    saveToLocalStorage('all');
    
    alert(`Welcome back, ASHA Worker ${worker.name}! Access granted to workbench.`);
    document.getElementById('form-asha-login').reset();
    
    // Trigger router re-evaluation
    window.location.hash = '#dashboard';
    setupRouting();
  } else {
    // Fallback: check if it's a beneficiary
    const ben = state.beneficiaries.find(b => {
      const bMobile = b.mobile ? String(b.mobile).replace(/\s/g, '') : '';
      const bAadhaar = b.aadhaar_id ? String(b.aadhaar_id).replace(/\s/g, '') : '';
      const bId = b.beneficiary_id ? String(b.beneficiary_id).replace(/\s/g, '') : '';
      return bMobile === loginId || bAadhaar === loginId || bId === loginId;
    });

    if (ben) {
      const savedPassword = ben.password || "password";
      if (savedPassword === password) {
        state.currentUser = {
          role: 'beneficiary',
          beneficiary_id: ben.beneficiary_id,
          beneficiary_name: ben.beneficiary_name,
          state: ben.state,
          village: ben.village,
          age: ben.age,
          status: ben.status,
          iron_level: ben.iron_level,
          mobile: ben.mobile,
          address: ben.address,
          aadhaar_id: ben.aadhaar_id,
          avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=100&auto=format&fit=crop&q=60"
        };
        saveToLocalStorage('all');
        alert(`Welcome, ${ben.beneficiary_name}! Redirecting to your personal health portal.`);
        document.getElementById('form-asha-login').reset();
        window.location.hash = '#ben-dashboard';
        setupRouting();
      } else {
        alert("Incorrect password. Please try again.");
      }
    } else {
      alert("Invalid credentials. Please check Employee Code/Mobile/Aadhaar and Password.");
    }
  }
}

function handleAshaSignup() {
  const name = document.getElementById('asha-signup-name').value.trim();
  const code = document.getElementById('asha-signup-code').value.trim();
  const mobile = document.getElementById('asha-signup-mobile').value.trim();
  const stateVal = document.getElementById('asha-signup-state').value;
  const district = document.getElementById('asha-signup-district').value.trim();
  const password = document.getElementById('asha-signup-password').value;

  // Validate duplicate
  if (state.ashaWorkers.some(w => w.code === code || w.mobile === mobile)) {
    alert("An ASHA worker with this code or mobile number is already registered.");
    return;
  }

  const newWorker = {
    name,
    code,
    mobile,
    state: stateVal,
    district,
    password,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60"
  };

  state.ashaWorkers.push(newWorker);
  saveToLocalStorage('ashaWorkers');

  alert(`ASHA Worker registration successful for ${name}! Please Sign In.`);
  document.getElementById('form-asha-signup').reset();
  toggleAuthMode('asha', 'login');
}

function handleBeneficiaryLogin() {
  const loginId = document.getElementById('ben-login-id').value.trim().replace(/\s/g, '');
  const password = document.getElementById('ben-login-password').value;

  // Search beneficiaries safely checking if fields are present and converting to string
  const ben = state.beneficiaries.find(b => {
    const bMobile = b.mobile ? String(b.mobile).replace(/\s/g, '') : '';
    const bAadhaar = b.aadhaar_id ? String(b.aadhaar_id).replace(/\s/g, '') : '';
    const bId = b.beneficiary_id ? String(b.beneficiary_id).replace(/\s/g, '') : '';
    
    return bMobile === loginId || bAadhaar === loginId || bId === loginId;
  });

  if (ben) {
    // Existing data from CSV doesn't have passwords - we default to "password"
    const savedPassword = ben.password || "password";
    if (savedPassword === password) {
      state.currentUser = {
        role: 'beneficiary',
        beneficiary_id: ben.beneficiary_id,
        beneficiary_name: ben.beneficiary_name,
        state: ben.state,
        village: ben.village,
        age: ben.age,
        status: ben.status,
        iron_level: ben.iron_level,
        mobile: ben.mobile,
        address: ben.address,
        aadhaar_id: ben.aadhaar_id,
        avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=100&auto=format&fit=crop&q=60"
      };
      saveToLocalStorage('all');
      
      alert(`Welcome, ${ben.beneficiary_name}! Redirecting to your personal health portal.`);
      document.getElementById('form-beneficiary-login').reset();
      
      window.location.hash = '#ben-dashboard';
      setupRouting();
    } else {
      alert("Incorrect password. Please try again.");
    }
  } else {
    // Fallback: check if it's an ASHA worker
    const worker = state.ashaWorkers.find(w => w.code === loginId || w.mobile === loginId);
    if (worker) {
      if (worker.password === password) {
        state.currentUser = {
          role: 'asha',
          name: worker.name,
          code: worker.code,
          mobile: worker.mobile,
          district: worker.district,
          state: worker.state,
          avatar: worker.avatar
        };
        saveToLocalStorage('all');
        alert(`Welcome back, ASHA Worker ${worker.name}! Access granted to workbench.`);
        document.getElementById('form-beneficiary-login').reset();
        window.location.hash = '#dashboard';
        setupRouting();
      } else {
        alert("Incorrect password. Please try again.");
      }
    } else {
      alert("Invalid credentials. Please check Employee Code/Mobile/Aadhaar and Password.");
    }
  }
}

function handleBeneficiarySignup() {
  const name = document.getElementById('ben-signup-name').value.trim();
  const aadhaar = document.getElementById('ben-signup-aadhaar').value.trim();
  const mobile = document.getElementById('ben-signup-mobile').value.trim();
  const age = document.getElementById('ben-signup-age').value.trim();
  const status = document.getElementById('ben-signup-status').value;
  const hb = document.getElementById('ben-signup-hb').value.trim();
  const stateVal = document.getElementById('ben-signup-state').value;
  const village = document.getElementById('ben-signup-village').value.trim();
  const address = document.getElementById('ben-signup-address').value.trim();
  const password = document.getElementById('ben-signup-password').value;

  // Validate duplicate
  if (state.beneficiaries.some(b => b.mobile === mobile || b.aadhaar_id === aadhaar)) {
    alert("A beneficiary with this Mobile Number or Aadhaar ID is already registered.");
    return;
  }

  // Generate sequential ID
  const latestId = Math.max(...state.beneficiaries.map(b => parseInt(b.beneficiary_id)));
  const newId = (latestId + 1).toString();

  // Evaluate anemia
  const hbVal = parseFloat(hb);
  let anemia = 'Normal';
  if (hbVal < 7.0) anemia = 'Severe';
  else if (hbVal < 10.0) anemia = 'Medium';
  else if (hbVal < 11.0) anemia = 'Low';

  const newBen = {
    beneficiary_id: newId,
    beneficiary_name: name,
    state: stateVal,
    village,
    age,
    status,
    iron_level: hb,
    ifa_pill_dosage: "180", // standard initial dose
    mobile,
    address,
    aadhaar_id: aadhaar,
    anemia_level: anemia,
    password
  };

  state.beneficiaries.unshift(newBen);

  // Installment 1 automatic success for early registration
  const latestTransId = Math.max(...state.transactions.map(t => parseInt(t.transaction_id)));
  state.transactions.unshift({
    transaction_id: (latestTransId + 1).toString(),
    beneficiary_id: newId,
    installment_number: "1",
    amount: "1000",
    payment_date: getTodayDateString(),
    payment_mode: "Bank Transfer",
    status: "Success",
    reference_no: `PMMVY0000${latestTransId + 1}`
  });

  // Supplementation record for daily logging
  const latestRecordId = Math.max(...state.supplementationRecords.map(r => parseInt(r.record_id)));
  state.supplementationRecords.unshift({
    record_id: (latestRecordId + 1).toString(),
    beneficiary_id: newId,
    period: status === 'Pregnant' ? 'Trimester 1' : 'Postnatal',
    visit_date: getTodayDateString(),
    pills_distributed: "30", // initial batch
    pills_consumed: "0",
    verification_status: "Pending",
    hemoglobin_level: hb,
    anemia_level: anemia,
    pill_id: "1",
    notes: "ASHA distribution logged upon online sign-up."
  });

  saveToLocalStorage('all');

  alert(`Congratulations ${name}! You are registered under Beneficiary ID: ${newId}. PMMVY Installment 1 (₹1,000) has been successfully generated. Please sign in.`);
  document.getElementById('form-beneficiary-signup').reset();
  toggleAuthMode('beneficiary', 'login');
}

function handleLogout() {
  state.currentUser = null;
  localStorage.removeItem('pmmvy_currentUser');
  
  alert("You have been successfully logged out.");
  window.location.hash = '';
  setupRouting();
}

// ================= BENEFICIARY PORTAL RENDERERS =================

function renderBeneficiaryDashboard() {
  const benId = state.currentUser.beneficiary_id;
  // Get latest live beneficiary details
  const ben = state.beneficiaries.find(b => b.beneficiary_id === benId) || state.currentUser;
  
  // Title greeting
  document.getElementById('ben-welcome-title').textContent = `Welcome, ${ben.beneficiary_name}!`;

  // Update KPIs
  const hbVal = parseFloat(ben.iron_level);
  document.getElementById('ben-kpi-hb').textContent = `${hbVal.toFixed(1)} g/dL`;
  
  // Anemia Level badge & Severe warning
  const dosageDetails = calculateDosageInternal(ben.status, hbVal);
  const anemiaBadge = document.getElementById('ben-kpi-anemia-status');
  anemiaBadge.textContent = `${dosageDetails.anemia} Anemia`;
  
  // Set badge classes
  anemiaBadge.className = 'kpi-subtext badge';
  if (dosageDetails.anemia === 'Normal') anemiaBadge.classList.add('badge-green');
  else if (dosageDetails.anemia === 'Low') anemiaBadge.classList.add('badge-purple');
  else if (dosageDetails.anemia === 'Medium') anemiaBadge.classList.add('badge-orange');
  else if (dosageDetails.anemia === 'Severe') anemiaBadge.classList.add('badge-red');

  // Severe Anemia Alert Warning Referral
  const alertBox = document.getElementById('ben-severe-anemia-alert');
  if (dosageDetails.needsReferral) {
    alertBox.classList.remove('hidden');
  } else {
    alertBox.classList.add('hidden');
  }

  // Pre-filled dosage guideline
  document.getElementById('ben-dose-scheme').textContent = `${ben.status} Mother Clinical Guideline`;
  const dosageBadge = document.getElementById('ben-dose-anemia-badge');
  dosageBadge.textContent = `${dosageDetails.anemia} Anemia Status`;
  dosageBadge.className = `result-badge ${dosageDetails.anemia}`;

  document.getElementById('ben-dose-pill-type').textContent = dosageDetails.pill;
  document.getElementById('ben-dose-dosage').textContent = dosageDetails.dosage;
  document.getElementById('ben-dose-composition').textContent = dosageDetails.composition;
  document.getElementById('ben-dose-advisory').innerHTML = `<strong>Medical Note:</strong> ${dosageDetails.advisory}`;

  // Pill Compliance KPIs
  const records = state.supplementationRecords.filter(r => r.beneficiary_id === benId);
  let totalDist = 0;
  let totalCons = 0;
  records.forEach(r => {
    totalDist += parseInt(r.pills_distributed || 0);
    totalCons += parseInt(r.pills_consumed || 0);
  });
  
  const compliancePercent = totalDist > 0 ? Math.round((totalCons / totalDist) * 100) : 0;
  document.getElementById('ben-kpi-compliance').textContent = `${compliancePercent}%`;
  document.getElementById('ben-kpi-pill-ratio').textContent = `${totalCons} Taken / ${totalDist} Distributed`;

  // Set compliance degrees for CSS conic gradient ring
  const deg = (compliancePercent / 100) * 360;
  document.querySelector('.compliance-ring-container').style.setProperty('--compliance-deg', `${deg}deg`);
  
  // Compliance Logger text update inside
  const ringContent = document.querySelector('.compliance-ring');
  ringContent.innerHTML = `
    <i class="fa-solid fa-pills" style="font-size: 42px; display: block; margin-bottom: 6px; color: var(--accent-purple);"></i>
    <span style="font-size: 20px; font-weight: 700;">${compliancePercent}%</span>
    <span style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Compliance</span>
  `;

  // DBT cash progress KPI
  const trans = state.transactions.filter(t => t.beneficiary_id === benId && t.status === 'Success');
  let receivedAmount = 0;
  trans.forEach(t => receivedAmount += parseInt(t.amount || 0));
  
  document.getElementById('ben-kpi-payments').textContent = `₹${receivedAmount.toLocaleString('en-IN')}`;
  document.getElementById('ben-kpi-installments-text').textContent = `${trans.length} / 3 Installments Paid`;
}

function handleBeneficiaryDailyCompliance() {
  const benId = state.currentUser.beneficiary_id;
  const records = state.supplementationRecords.filter(r => r.beneficiary_id === benId);

  if (records.length === 0) {
    alert("No active supplementation logs found. Please visit your ASHA worker Anita Sharma to distribute pills.");
    return;
  }

  // Find the first record with pending pills to consume
  const activeRecord = records.find(r => parseInt(r.pills_consumed) < parseInt(r.pills_distributed));

  if (!activeRecord) {
    alert("You have completed all pills in your current distributed batch! Please visit your ASHA worker Anita Sharma to verify and request the next batch of IFA supplements.");
    return;
  }

  // Check if they already logged pill today (simple check by alert session, but let's just increment)
  const consumed = parseInt(activeRecord.pills_consumed) + 1;
  activeRecord.pills_consumed = consumed.toString();
  
  // If consumed equal to distributed, change status to Verified Consumed automatically
  if (consumed === parseInt(activeRecord.pills_distributed)) {
    activeRecord.verification_status = "Consumed";
    
    // Automatically trigger next PMMVY DBT Installment!
    // Trimester 2 compliance verified -> Installment 2
    // Postnatal compliance verified -> Installment 3
    const existingTrans = state.transactions.filter(t => t.beneficiary_id === benId);
    
    if (activeRecord.period.includes('Trimester 2') && !existingTrans.some(t => t.installment_number === '2')) {
      const latestTransId = Math.max(...state.transactions.map(t => parseInt(t.transaction_id)));
      state.transactions.unshift({
        transaction_id: (latestTransId + 1).toString(),
        beneficiary_id: benId,
        installment_number: "2",
        amount: "2000",
        payment_date: getTodayDateString(),
        payment_mode: "Bank Transfer",
        status: "Success",
        reference_no: `PMMVY0000${latestTransId + 1}`
      });
      alert("Congratulations! You completed Trimester 2 IFA compliance. PMMVY Installment 2 (₹2,000) has been disbursed successfully.");
    } else if (activeRecord.period.includes('Postnatal') && !existingTrans.some(t => t.installment_number === '3')) {
      const latestTransId = Math.max(...state.transactions.map(t => parseInt(t.transaction_id)));
      state.transactions.unshift({
        transaction_id: (latestTransId + 1).toString(),
        beneficiary_id: benId,
        installment_number: "3",
        amount: "2000",
        payment_date: getTodayDateString(),
        payment_mode: "Bank Transfer",
        status: "Success",
        reference_no: `PMMVY0000${latestTransId + 1}`
      });
      alert("Congratulations! Postnatal follow-up immunizations & IFA compliance met. Installment 3 (₹2,000) disbursed.");
    }
  }

  saveToLocalStorage('all');
  alert(`Great job! You logged taking your daily IFA pill. Total taken in this batch: ${consumed}/${activeRecord.pills_distributed}.`);
  renderBeneficiaryDashboard();
}

function renderBeneficiaryPayments() {
  const benId = state.currentUser.beneficiary_id;
  const trans = state.transactions.filter(t => t.beneficiary_id === benId);

  // Set card statuses
  const installments = { '1': 'Locked', '2': 'Locked', '3': 'Locked' };
  const payments = { '1': 0, '2': 0, '3': 0 };

  trans.forEach(t => {
    installments[t.installment_number] = t.status;
    if (t.status === 'Success') payments[t.installment_number] = 100;
  });

  // Installment 1 Card
  document.getElementById('ben-inst-1-progress').style.width = `${payments['1']}%`;
  document.getElementById('ben-inst-1-status').textContent = `Status: ${installments['1']}`;
  updateInstallmentCardBorder('ben-inst-1-card', installments['1']);

  // Installment 2 Card
  document.getElementById('ben-inst-2-progress').style.width = `${payments['2']}%`;
  document.getElementById('ben-inst-2-status').textContent = `Status: ${installments['2']}`;
  updateInstallmentCardBorder('ben-inst-2-card', installments['2']);

  // Installment 3 Card
  document.getElementById('ben-inst-3-progress').style.width = `${payments['3']}%`;
  document.getElementById('ben-inst-3-status').textContent = `Status: ${installments['3']}`;
  updateInstallmentCardBorder('ben-inst-3-card', installments['3']);

  // Populate transaction table
  const tbody = document.getElementById('ben-transactions-table-body');
  if (trans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No DBT Transactions logged.</td></tr>';
    return;
  }

  tbody.innerHTML = trans.map(t => {
    const statusClass = t.status === 'Success' ? 'badge-green' : (t.status === 'Pending' ? 'badge-orange' : 'badge-red');
    return `
      <tr>
        <td>#${t.transaction_id}</td>
        <td><strong>Installment ${t.installment_number}</strong></td>
        <td>₹${parseInt(t.amount).toLocaleString('en-IN')}</td>
        <td>${formatDate(t.payment_date)}</td>
        <td>${t.payment_mode}</td>
        <td><span class="badge ${statusClass}">${t.status}</span></td>
        <td><code>${t.reference_no}</code></td>
      </tr>
    `;
  }).join('');
}

function updateInstallmentCardBorder(cardId, status) {
  const card = document.getElementById(cardId);
  card.style.borderLeft = '4px solid';
  if (status === 'Success') {
    card.style.borderLeftColor = 'var(--accent-green)';
  } else if (status === 'Pending') {
    card.style.borderLeftColor = '#f59e0b';
  } else {
    card.style.borderLeftColor = 'var(--border-color)';
  }
}

function renderBeneficiaryFeedback() {
  const benId = state.currentUser.beneficiary_id;
  const benReviews = state.reviews.filter(r => r.beneficiary_id === benId);

  const container = document.getElementById('ben-reviews-list-container');
  if (benReviews.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">No reviews submitted by you yet.</p>';
    return;
  }

  container.innerHTML = benReviews.map(r => {
    const starsHTML = Array(parseInt(r.rating)).fill('<i class="fa-solid fa-star"></i>').join('');
    const emptyStarsHTML = Array(5 - parseInt(r.rating)).fill('<i class="fa-regular fa-star"></i>').join('');
    return `
      <div class="review-card" style="background-color: var(--bg-secondary);">
        <div class="review-card-header">
          <h4 style="font-size: 14px; font-weight:600;">My Review</h4>
          <div class="review-rating-stars">${starsHTML}${emptyStarsHTML}</div>
        </div>
        <p class="review-body" style="font-style: italic;">"${r.review_text}"</p>
        <span style="font-size: 11px; color: var(--text-muted); align-self: flex-end;">Submitted: ${formatDate(r.review_date)}</span>
      </div>
    `;
  }).join('');
}

function handleBeneficiaryReviewSubmit() {
  const benId = state.currentUser.beneficiary_id;
  const ratingEl = document.querySelector('input[name="ben-review-rating"]:checked');
  const reviewText = document.getElementById('ben-review-text').value;

  if (!ratingEl || !reviewText) {
    alert("Please choose a rating and fill in comments.");
    return;
  }

  const latestId = Math.max(...state.reviews.map(r => parseInt(r.review_id)));
  const newReview = {
    review_id: (latestId + 1).toString(),
    beneficiary_id: benId,
    reviewer_name: state.currentUser.beneficiary_name,
    rating: ratingEl.value,
    review_text: reviewText,
    review_date: getTodayDateString()
  };

  state.reviews.unshift(newReview);
  saveToLocalStorage('reviews');

  alert("Feedback successfully submitted to district database.");
  document.getElementById('form-ben-submit-review').reset();
  renderBeneficiaryFeedback();
}

function renderBeneficiaryMedicines() {
  // Dosage Reference Calculator result hidden initially
  document.getElementById('ben-calc-result').classList.add('hidden');
}

function handleBeneficiaryDosageCalculate() {
  const status = document.getElementById('ben-calc-status').value;
  const hb = parseFloat(document.getElementById('ben-calc-hb').value);

  if (isNaN(hb)) {
    alert("Please enter a valid Hemoglobin level.");
    return;
  }

  const dosageDetails = calculateDosageInternal(status, hb);

  const resultContainer = document.getElementById('ben-calc-result');
  const anemiaEl = document.getElementById('ben-calc-result-anemia-status');
  const pillEl = document.getElementById('ben-calc-result-pill-type');
  const dosageEl = document.getElementById('ben-calc-result-dosage');
  const ingEl = document.getElementById('ben-calc-result-ingredients');
  const advisoryEl = document.getElementById('ben-calc-result-advisory');

  // Set visual elements
  anemiaEl.textContent = `${dosageDetails.anemia} Anemia`;
  anemiaEl.className = `result-badge ${dosageDetails.anemia}`;
  
  pillEl.textContent = dosageDetails.pill;
  dosageEl.textContent = dosageDetails.dosage;
  ingEl.textContent = dosageDetails.composition;
  
  // Highlight advisory in red if severe refer to doctor
  if (dosageDetails.needsReferral) {
    advisoryEl.innerHTML = `<strong style="color: var(--accent-red);"><i class="fa-solid fa-triangle-exclamation"></i> DOCTOR REFERRAL CRITICAL:</strong> ${dosageDetails.advisory}`;
  } else {
    advisoryEl.innerHTML = `<strong>ASHA Counselling Advice:</strong> ${dosageDetails.advisory}`;
  }

  resultContainer.classList.remove('hidden');
}

function calculateDosageInternal(status, hb) {
  let anemia = 'Normal';
  let pill = 'N/A';
  let dosage = 'No treatment required. Maintain healthy diet.';
  let composition = 'N/A';
  let advisory = 'Maintain standard iron-rich diet containing green leafy vegetables, dates, and jaggery.';
  let needsReferral = false;

  if (hb < 7.0) {
    anemia = 'Severe';
    pill = 'IFA Red Tablet (Therapeutic)';
    dosage = '2 Tablets daily for 180 days (with clinical monitoring)';
    composition = 'Ferrous Sulphate 100mg elemental iron + Folic Acid 500mcg';
    advisory = 'Severe anemia requires immediate referral to a Medical Officer or Gynecologist at the nearest CHC/District Hospital. Consider blood transfusion if Hb < 5 g/dL.';
    needsReferral = true;
  } else if (hb < 10.0) {
    anemia = 'Medium';
    pill = 'IFA Red Tablet (Therapeutic)';
    dosage = '2 Tablets daily for 180 days';
    composition = 'Ferrous Sulphate 100mg elemental iron + Folic Acid 500mcg';
    advisory = 'Advise beneficiary to take tablets with lemon water (vitamin C) to enhance absorption. Monitor Hb level monthly. Ensure registration in the PMMVY scheme for nutrition benefits.';
  } else if (hb < 11.0) {
    anemia = 'Low';
    pill = 'IFA Red Tablet (Prophylactic)';
    dosage = '1 Tablet daily for 180 days';
    composition = 'Ferrous Sulphate 100mg elemental iron + Folic Acid 500mcg';
    advisory = 'Advise beneficiary to take tablets after meals to reduce gastrointestinal side-effects like nausea or black stools. Avoid tea or milk within an hour of pill consumption.';
  } else {
    if (status === 'Pregnant') {
      anemia = 'Normal';
      pill = 'IFA Blue/Red Tablet (Prophylactic)';
      dosage = '1 Tablet daily for 180 days starting from 4th month of pregnancy';
      composition = 'Ferrous Sulphate 100mg elemental iron + Folic Acid 500mcg';
      advisory = 'Standard preventative supplementation under national guidelines. Remind beneficiary that regular intake protects both maternal and fetal health.';
    } else {
      anemia = 'Normal';
      pill = 'None';
      dosage = 'No routine IFA supplementation needed if Hb remains normal postnatal. Maintain normal diet.';
      composition = 'None';
      advisory = 'Postnatal mothers should focus on rich diet for lactation. Check hemoglobin again if signs of weakness manifest.';
    }
  }
  return { anemia, pill, dosage, composition, advisory, needsReferral };
}

// ================= NEW SSO AND SCANNER LOGIC =================
window.simulateSSOLogin = function(role) {
  if (role === 'asha') {
    state.currentUser = { ...state.ashaWorkers[0], role: 'asha' };
  } else {
    state.currentUser = { ...state.beneficiaries[0], role: 'beneficiary' };
  }
  saveToLocalStorage('all');
  window.location.hash = role === 'asha' ? '#dashboard' : '#ben-dashboard';
};

function submitAnemiaQuiz(e) {
  e.preventDefault();
  const q1 = document.getElementById('quiz-q1').value;
  const q2 = document.getElementById('quiz-q2').value;
  const q3 = document.getElementById('quiz-q3').value;

  let score = 0;
  [q1, q2, q3].forEach(ans => {
    if (ans === 'high') score += 2;
    else if (ans === 'medium') score += 1;
  });

  const resultDiv = document.getElementById('anemia-quiz-result');
  const badge = document.getElementById('anemia-quiz-badge');
  const pillEl = document.getElementById('anemia-quiz-pill');
  const dosageEl = document.getElementById('anemia-quiz-dosage');
  const advisoryEl = document.getElementById('anemia-quiz-advisory');

  let hbEstimate = 12.0; // Normal
  
  if (score >= 5) {
    hbEstimate = 6.5; // Severe
    badge.className = 'result-badge Severe';
    badge.style.backgroundColor = 'rgba(244, 63, 94, 0.12)';
    badge.style.color = 'var(--accent-red)';
    badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> High Risk (Severe Anemia)';
  } else if (score >= 2) {
    hbEstimate = 9.0; // Medium
    badge.className = 'result-badge Low'; // styling using Low class (orange)
    badge.style.backgroundColor = 'rgba(245, 158, 11, 0.12)';
    badge.style.color = '#f59e0b';
    badge.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Moderate Risk';
  } else {
    hbEstimate = 11.5; // Normal
    badge.className = 'result-badge Normal';
    badge.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
    badge.style.color = 'var(--accent-green)';
    badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Low Risk (Normal)';
  }

  // Reuse calculateDosageInternal
  const dosageDetails = calculateDosageInternal(state.currentUser ? state.currentUser.status : 'Pregnant', hbEstimate);

  pillEl.textContent = dosageDetails.pill;
  dosageEl.textContent = dosageDetails.dosage;
  
  if (dosageDetails.needsReferral) {
    advisoryEl.innerHTML = `<strong style="color: var(--accent-red);"><i class="fa-solid fa-triangle-exclamation"></i> DOCTOR REFERRAL CRITICAL:</strong> ${dosageDetails.advisory}`;
  } else {
    advisoryEl.innerHTML = `<strong>Advice:</strong> ${dosageDetails.advisory}`;
  }

  resultDiv.classList.remove('hidden');
}

function startPillScan() {
  const laser = document.getElementById('pill-scan-laser');
  const resultDiv = document.getElementById('pill-scan-result');
  const btn = document.getElementById('btn-start-pill-scan');
  
  laser.classList.remove('hidden');
  resultDiv.classList.add('hidden');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
  
  setTimeout(() => {
    laser.classList.add('hidden');
    resultDiv.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-barcode"></i> Scan Another Pack';
  }, 2000);
}
