// Transfer Management System - Main Application
// Full-Stack Integration with API

// Global state
let currentUser = null;
let machines = [];
let currentLang = 'nl';
let currentView = 'dashboard';

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const token = getAuthToken();

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Verify token
    const isValid = await AuthAPI.verify();
    if (!isValid) {
        window.location.href = 'login.html';
        return;
    }

    // Load user data
    try {
        currentUser = await AuthAPI.getMe();
        updateUserDisplay();
    } catch (error) {
        console.error('Error loading user:', error);
        window.location.href = 'login.html';
        return;
    }

    // Load initial data
    await loadMachines();
    await loadStatistics();

    // Set up event listeners
    setupEventListeners();

    // Initialize language
    switchLanguage('nl');

    console.log('Application initialized successfully');
});

// Load machines from API
async function loadMachines(filters = {}) {
    try {
        showLoading(true);
        machines = await MachinesAPI.getAll(filters);
        renderMachinesTable();
        renderGanttChart();
        showLoading(false);
    } catch (error) {
        console.error('Error loading machines:', error);
        showNotification('Fout bij laden van machines', 'error');
        showLoading(false);
    }
}

// Load statistics from API
async function loadStatistics() {
    try {
        const stats = await MachinesAPI.getStatistics();
        renderStatistics(stats);
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Update user display
function updateUserDisplay() {
    if (currentUser) {
        const userNameElement = document.getElementById('current-user');
        const userRoleElement = document.getElementById('user-role');

        if (userNameElement) {
            userNameElement.textContent = currentUser.username;
        }
        if (userRoleElement) {
            userRoleElement.textContent = currentUser.role === 'admin' ? 'Administrator' :
                                         currentUser.role === 'technician' ? 'Technicus' : 'Kijker';
        }
    }
}

// Render statistics
function renderStatistics(stats) {
    if (!stats) return;

    // Total machines
    const totalElement = document.getElementById('stat-total');
    if (totalElement) {
        totalElement.textContent = stats.total || 0;
    }

    // By destination
    if (stats.byDestination) {
        const czCount = stats.byDestination.find(d => d.destination && d.destination.includes('CZ'))?.count || 0;
        const mexCount = stats.byDestination.find(d => d.destination && d.destination.includes('Mex'))?.count || 0;
        const scrapCount = stats.byDestination.find(d => d.destination && d.destination.includes('Verschrot'))?.count || 0;

        const czElement = document.getElementById('stat-cz');
        const mexElement = document.getElementById('stat-mex');
        const scrapElement = document.getElementById('stat-scrap');

        if (czElement) czElement.textContent = czCount;
        if (mexElement) mexElement.textContent = mexCount;
        if (scrapElement) scrapElement.textContent = scrapCount;
    }

    // By status
    if (stats.byStatus) {
        const doneCount = stats.byStatus.find(s => s.status && s.status.includes('Done'))?.count || 0;
        const waitingCount = stats.byStatus.find(s => s.status && s.status.includes('Wacht'))?.count || 0;

        const doneElement = document.getElementById('stat-done');
        const waitingElement = document.getElementById('stat-waiting');

        if (doneElement) doneElement.textContent = doneCount;
        if (waitingElement) waitingElement.textContent = waitingCount;
    }
}

// Render machines table
function renderMachinesTable() {
    const tbody = document.getElementById('machines-tbody');
    if (!tbody) return;

    if (machines.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #999;">Geen machines gevonden. Klik op "Machine toevoegen" om te beginnen.</td></tr>';
        return;
    }

    tbody.innerHTML = machines.map(machine => `
        <tr>
            <td class="machine-id">${escapeHtml(machine.type || 'N/A')}</td>
            <td>${escapeHtml(machine.number || '-')}</td>
            <td><span class="status-badge ${getStatusClass(machine.status)}">${escapeHtml(machine.status || 'N/A')}</span></td>
            <td><span class="location-badge ${getLocationClass(machine.destination)}">${escapeHtml(machine.destination || 'N/A')}</span></td>
            <td>${escapeHtml(machine.line || '-')}</td>
            <td>${escapeHtml(machine.responsible || 'N/A')}</td>
            <td>${escapeHtml(machine.notes || '-')}</td>
            <td class="action-buttons">
                <button class="btn-icon" onclick="editMachine(${machine.id})" title="Bewerken">✏️</button>
                <button class="btn-icon" onclick="viewDetails(${machine.id})" title="Details">👁️</button>
                <button class="btn-icon" onclick="viewHistory(${machine.id})" title="Historie">📜</button>
            </td>
        </tr>
    `).join('');
}

// Render Gantt chart (simplified version)
function renderGanttChart() {
    const ganttBars = document.getElementById('gantt-bars');
    const ganttRows = document.getElementById('gantt-rows');

    if (!ganttBars || !ganttRows) return;

    // Clear existing
    ganttBars.innerHTML = '';
    ganttRows.innerHTML = '';

    machines.forEach(machine => {
        // Add row
        const row = document.createElement('div');
        row.className = 'gantt-row';
        row.innerHTML = `
            <div class="gantt-col" style="flex: 2">${escapeHtml(machine.type || 'N/A')} ${escapeHtml(machine.number || '')}</div>
            <div class="gantt-col"><span class="status-badge ${getStatusClass(machine.status)}">${escapeHtml(machine.status || 'N/A')}</span></div>
            <div class="gantt-col">${escapeHtml(machine.responsible || 'N/A')}</div>
        `;
        ganttRows.appendChild(row);

        // Add bar (simplified - just visual representation)
        const barRow = document.createElement('div');
        barRow.className = 'gantt-bar-row';

        // Simple timeline based on status
        let barHtml = '';
        if (machine.dismantling_date || machine.transport_date) {
            barHtml = '<div class="gantt-bar demontage" style="left: 10%; width: 20%">Demontage</div>';
        }
        if (machine.transport_date) {
            barHtml += '<div class="gantt-bar transport" style="left: 35%; width: 15%">Transport</div>';
        }
        if (machine.installation_date) {
            barHtml += '<div class="gantt-bar installation" style="left: 55%; width: 20%">Installatie</div>';
        }

        barRow.innerHTML = barHtml;
        ganttBars.appendChild(barRow);
    });
}

// Get status CSS class
function getStatusClass(status) {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('productie')) return 'status-production';
    if (s.includes('gereed')) return 'status-ready';
    if (s.includes('demontage')) return 'status-dismantling';
    if (s.includes('wacht')) return 'status-waiting';
    if (s.includes('verschrot')) return 'status-scrap';
    if (s.includes('done')) return 'status-done';
    if (s.includes('ppap')) return 'status-ppap';
    return '';
}

// Get location CSS class
function getLocationClass(destination) {
    if (!destination) return '';
    const d = destination.toLowerCase();
    if (d.includes('cz')) return 'location-cz';
    if (d.includes('mex')) return 'location-mex';
    if (d.includes('verschrot')) return 'location-scrap';
    if (d.includes('daremon')) return 'location-daremon';
    if (d.includes('hans')) return 'location-hans';
    return '';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Switch tabs
function switchTab(tabName) {
    currentView = tabName;

    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });

    const view = document.getElementById(tabName);
    if (view) {
        view.style.display = 'block';
    }
}

// Open modal for adding/editing machine
function openModal(type, machineId = null) {
    const modal = document.getElementById('machineModal');
    if (!modal) return;

    // Reset form
    document.getElementById('machineForm').reset();
    document.getElementById('machine-id').value = machineId || '';

    // If editing, load machine data
    if (machineId) {
        loadMachineToForm(machineId);
    }

    modal.classList.add('active');
}

// Load machine data to form
async function loadMachineToForm(machineId) {
    try {
        const machine = await MachinesAPI.getById(machineId);

        // Populate form fields
        document.getElementById('machine-type').value = machine.type || '';
        document.getElementById('machine-number').value = machine.number || '';
        document.getElementById('machine-status').value = machine.status || '';
        document.getElementById('machine-destination').value = machine.destination || '';
        document.getElementById('machine-line').value = machine.line || '';
        document.getElementById('machine-responsible').value = machine.responsible || '';
        document.getElementById('machine-notes').value = machine.notes || '';
        document.getElementById('machine-weight').value = machine.weight || '';
        document.getElementById('machine-dimensions').value = machine.dimensions || '';
        document.getElementById('machine-power').value = machine.power || '';
        document.getElementById('machine-voltage').value = machine.voltage || '';
        document.getElementById('machine-oil').value = machine.oil || '';
        document.getElementById('machine-requirements').value = machine.requirements || '';
        document.getElementById('machine-hazmat').value = machine.hazmat || '';
        document.getElementById('dismantling-date').value = machine.dismantling_date || '';
        document.getElementById('transport-date').value = machine.transport_date || '';
        document.getElementById('installation-date').value = machine.installation_date || '';
        document.getElementById('ppap-date').value = machine.ppap_date || '';
        document.getElementById('transport-company').value = machine.transport_company || '';
        document.getElementById('planning-notes').value = machine.planning_notes || '';
        document.getElementById('ce-certificate').value = machine.ce_certificate || '';
        document.getElementById('manual-link').value = machine.manual_link || '';
    } catch (error) {
        console.error('Error loading machine:', error);
        showNotification('Fout bij laden van machine gegevens', 'error');
    }
}

// Close modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Save machine (create or update)
async function saveMachine() {
    try {
        const machineId = document.getElementById('machine-id').value;

        const machineData = {
            type: document.getElementById('machine-type').value,
            number: document.getElementById('machine-number').value,
            status: document.getElementById('machine-status').value,
            destination: document.getElementById('machine-destination').value,
            line: document.getElementById('machine-line').value,
            responsible: document.getElementById('machine-responsible').value,
            notes: document.getElementById('machine-notes').value,
            weight: document.getElementById('machine-weight').value || null,
            dimensions: document.getElementById('machine-dimensions').value,
            power: document.getElementById('machine-power').value || null,
            voltage: document.getElementById('machine-voltage').value,
            oil: document.getElementById('machine-oil').value,
            requirements: document.getElementById('machine-requirements').value,
            hazmat: document.getElementById('machine-hazmat').value,
            dismantlingDate: document.getElementById('dismantling-date').value,
            transportDate: document.getElementById('transport-date').value,
            installationDate: document.getElementById('installation-date').value,
            ppapDate: document.getElementById('ppap-date').value,
            transportCompany: document.getElementById('transport-company').value,
            planningNotes: document.getElementById('planning-notes').value,
            ceCertificate: document.getElementById('ce-certificate').value,
            manualLink: document.getElementById('manual-link').value
        };

        if (machineId) {
            // Update existing
            await MachinesAPI.update(machineId, machineData);
            showNotification('Machine bijgewerkt!', 'success');
        } else {
            // Create new
            await MachinesAPI.create(machineData);
            showNotification('Machine toegevoegd!', 'success');
        }

        closeModal();
        await loadMachines();
        await loadStatistics();
    } catch (error) {
        console.error('Error saving machine:', error);
        showNotification('Fout bij opslaan: ' + error.message, 'error');
    }
}

// Edit machine
function editMachine(id) {
    openModal('machine', id);
}

// View details
async function viewDetails(id) {
    try {
        const machine = await MachinesAPI.getById(id);
        alert('Machine Details:\n\n' + JSON.stringify(machine, null, 2));
    } catch (error) {
        console.error('Error loading details:', error);
        showNotification('Fout bij laden van details', 'error');
    }
}

// View history
async function viewHistory(id) {
    try {
        const history = await MachinesAPI.getHistory(id);
        alert('Machine History:\n\n' + JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Error loading history:', error);
        showNotification('Fout bij laden van historie', 'error');
    }
}

// Delete machine
async function deleteMachine(id) {
    if (!confirm('Weet u zeker dat u deze machine wilt verwijderen?')) {
        return;
    }

    try {
        await MachinesAPI.delete(id);
        showNotification('Machine verwijderd', 'success');
        await loadMachines();
        await loadStatistics();
    } catch (error) {
        console.error('Error deleting machine:', error);
        showNotification('Fout bij verwijderen', 'error');
    }
}

// Logout
function logout() {
    if (confirm('Weet u zeker dat u wilt uitloggen?')) {
        AuthAPI.logout();
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const notificationIcon = document.getElementById('notification-icon');

    if (!notification || !notificationText || !notificationIcon) return;

    notificationText.textContent = message;
    notificationIcon.textContent = type === 'success' ? '✓' : '✗';

    notification.classList.remove('error');
    if (type === 'error') {
        notification.classList.add('error');
    }

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Show loading indicator
function showLoading(show) {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

// Switch language
function switchLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === lang);
    });

    // Update translations (simplified - in production use i18n library)
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        // Translation logic here
    });
}

// Switch form tabs
function switchFormTab(tabName) {
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });

    event.target.classList.add('active');
    document.getElementById(tabName + '-section').classList.add('active');
}

// Setup event listeners
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async (e) => {
            await loadMachines({ search: e.target.value });
        }, 500));
    }

    // Filters
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', async (e) => {
            const status = e.target.value === 'all' ? null : e.target.value;
            await loadMachines({ status });
        });
    }

    const locationFilter = document.getElementById('location-filter');
    if (locationFilter) {
        locationFilter.addEventListener('change', async (e) => {
            const destination = e.target.value === 'all' ? null : e.target.value;
            await loadMachines({ destination });
        });
    }

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Debounce utility
function debounce(func, wait) {
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

// Export functions to global scope
window.switchTab = switchTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.saveMachine = saveMachine;
window.editMachine = editMachine;
window.viewDetails = viewDetails;
window.viewHistory = viewHistory;
window.deleteMachine = deleteMachine;
window.logout = logout;
window.switchLanguage = switchLanguage;
window.switchFormTab = switchFormTab;
