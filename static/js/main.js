/**
 * Dental IQ - Main JavaScript
 * Handles all interactive functionality for the agent dashboard
 */

// Global state
const appData = window.APP_DATA || { agents: [], simulate_active: false, selected_agent: "", user_info: {} };
let chatMessages = [];
let selectedAgentId = null;
let simulateActive = appData.simulate_active;
let selectedSimAgent = appData.selected_agent || "";
let isTyping = false;
let miniKpiPopups = [];
let kpiPopupsVisible = false;

// Role-based agent access
const ROLE_AGENT_ACCESS = {
  'doctor': ['nora', 'auditor'],
  'receptionist': ['isabella', 'gabriel', 'leo'],
  'admin': ['isabella', 'leo', 'gabriel', 'nora', 'auditor']
};

function canUserSeeAgent(agentId) {
  const userJobRole = appData.user_info?.job_role || 'admin';
  const allowedAgents = ROLE_AGENT_ACCESS[userJobRole] || ROLE_AGENT_ACCESS['admin'];
  return allowedAgents.includes(agentId);
}

/**
 * Agent positioning and rendering
 */
function placeAgents() {
  const root = document.getElementById('agentsRoot');
  root.innerHTML = '';
  miniKpiPopups = [];
  
  // Circle layout configuration
  const centerX = 325; // half of 650px
  const centerY = 325; // half of 650px
  const radius = 220; // distance from center
  const numAgents = appData.agents.length;
  const angleOffset = -Math.PI / 2; // Start from top
  
  // Calculate positions for each agent
  const positions = appData.agents.map((agent, i) => {
    const angle = angleOffset + (i * 2 * Math.PI / numAgents);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // Determine popup direction based on position
    let popupDirection = 'right';
    if (x < centerX - 50) popupDirection = 'left';
    else if (x > centerX + 50) popupDirection = 'right';
    else if (y < centerY) popupDirection = 'top';
    else popupDirection = 'bottom';
    
    return { x, y, angle, popupDirection };
  });

  // Create agent elements
  appData.agents.forEach((agent, i) => {
    const pos = positions[i];
    const div = document.createElement('div');
    
    // Check if user can see this agent in simulation mode
    const canSeeSim = canUserSeeAgent(agent.id);
    const shouldHighlight = simulateActive && selectedSimAgent === agent.id && canSeeSim;
    
    div.className = 'agent' + (shouldHighlight ? ' badge' : '');
    div.style.position = 'absolute';
    div.style.left = (pos.x - 60) + 'px'; // 60 = half of 120px width
    div.style.top = (pos.y - 60) + 'px'; // 60 = half of 120px height
    div.innerHTML = `<div>${agent.avatar}</div>`;
    div.dataset.agentId = agent.id;

    // Create floating popup for simulation mode
    const popup = createAgentPopup(agent, shouldHighlight);
    document.body.appendChild(popup);

    // Create mini KPI popup
    const miniKpi = createMiniKpiPopup(agent);
    document.body.appendChild(miniKpi);
    miniKpiPopups.push({ element: miniKpi, agentId: agent.id, pos: pos, agentDiv: div });

    // Agent click handler
    div.onclick = (e) => handleAgentClick(e, agent, div, popup, pos, shouldHighlight);

    // Add agent name
    const name = document.createElement('div');
    name.className = 'agent-name';
    name.textContent = agent.name;
    div.appendChild(name);

    // Add notification badge if highlighted
    if (shouldHighlight) {
      const badge = document.createElement('div');
      badge.className = 'notification';
      badge.textContent = '!';
      div.appendChild(badge);
    }

    root.appendChild(div);
  });
  
  // Close popups when clicking outside
  document.body.addEventListener('click', handleOutsideClick);
}

/**
 * Create agent detail popup (for simulation mode)
 */
function createAgentPopup(agent, isSimulated) {
  const popup = document.createElement('div');
  popup.className = 'agent-popup';
  popup.dataset.agentId = agent.id;
  
  if (isSimulated) {
    popup.innerHTML = `
      <div class="agent-popup-header">
        <h4>${agent.name} - ${agent.role}</h4>
        <div class="popup-controls">
          <button class="popup-btn" onclick="toggleMaximizePopup('${agent.id}')" title="Maximalizovat/Obnovit">⛶</button>
          <button class="popup-btn" onclick="closeAgentPopup('${agent.id}')" title="Zavřít">×</button>
        </div>
      </div>
      <div class="simulation-header">🚨 Vyžaduje okamžitou pozornost</div>
      <div class="kpis">${agent.kpis.map(k => 
        '<div class="kpi"><div>' + k[1] + '</div><div style="font-size:10px">' + k[0] + '</div></div>'
      ).join('')}</div>
      <div style="margin-top:12px;margin-bottom:8px;font-weight:600;color:#007c91">Úkoly k dokončení:</div>
      ${agent.simulation_tasks ? agent.simulation_tasks.map(t => `
        <div class="task-item">
          <input type="checkbox" class="task-checkbox">
          <div class="task-text">
            ${t.task}
            <div><span class="task-priority priority-${getPriorityClass(t.priority)}">${t.priority}</span></div>
          </div>
        </div>
      `).join('') : '<div style="color:#888;padding:6px">Žádné úkoly</div>'}
    `;
  }
  
  return popup;
}

/**
 * Create mini KPI popup
 */
function createMiniKpiPopup(agent) {
  const miniKpi = document.createElement('div');
  miniKpi.className = 'mini-kpi-popup';
  miniKpi.dataset.agentId = agent.id;
  miniKpi.innerHTML = agent.mini_kpis.map(k => `
    <div class="kpi-item">
      <span class="kpi-icon">${k[0]}</span>
      <span class="kpi-value">${k[1]}</span>
    </div>
  `).join('');
  return miniKpi;
}

/**
 * Get CSS class for priority
 */
function getPriorityClass(priority) {
  if (priority === 'Vysoká') return 'high';
  if (priority === 'Střední') return 'medium';
  return 'low';
}

/**
 * Handle agent click
 */
function handleAgentClick(e, agent, div, popup, pos, isSimulated) {
  e.stopPropagation();
  hideMiniKpis();
  
  // Toggle selection
  if (selectedAgentId === agent.id) {
    selectedAgentId = null;
    div.classList.remove('selected');
  } else {
    document.querySelectorAll('.agent').forEach(a => a.classList.remove('selected'));
    selectedAgentId = agent.id;
    div.classList.add('selected');
  }
  
  document.querySelectorAll('.agent-popup').forEach(p => p.classList.remove('show'));
  
  if (isSimulated) {
    // Simulation mode - show floating popup near agent
    positionAgentPopup(popup, div, pos, agent.id);
    popup.classList.add('show');
  } else {
    // Non-simulation mode - show centered modal
    showModal(agent);
  }
}

/**
 * Position agent popup based on location
 */
function positionAgentPopup(popup, div, pos, agentId) {
  const rect = div.getBoundingClientRect();
  const isIsabella = agentId === 'isabella';
  const heightOffset = isIsabella ? 0 : 100;
  
  if (pos.popupDirection === 'right') {
    popup.style.top = (rect.top + window.scrollY - popup.offsetHeight/2 + div.offsetHeight/2 - heightOffset) + 'px';
    popup.style.left = (rect.right + 15) + 'px';
    popup.style.right = 'auto';
  } else if (pos.popupDirection === 'left') {
    popup.style.top = (rect.top + window.scrollY - popup.offsetHeight - 60 - heightOffset) + 'px';
    popup.style.left = '20px';
    popup.style.right = 'auto';
  } else if (pos.popupDirection === 'top') {
    popup.style.top = (rect.top + window.scrollY - popup.offsetHeight - 40) + 'px';
    popup.style.left = (rect.left + window.scrollX + div.offsetWidth/2 - popup.offsetWidth/2 + 80) + 'px';
    popup.style.right = 'auto';
  } else {
    popup.style.top = (rect.bottom + window.scrollY - 20 - heightOffset) + 'px';
    popup.style.left = (rect.left + window.scrollX + div.offsetWidth/2 - popup.offsetWidth/2) + 'px';
    popup.style.right = 'auto';
  }
}

/**
 * Handle clicks outside of agents and popups
 */
function handleOutsideClick(e) {
  if (!e.target.closest('.agent') && 
      !e.target.closest('.agent-popup') && 
      !e.target.closest('.center') && 
      !e.target.closest('.mini-kpi-popup')) {
    document.querySelectorAll('.agent-popup').forEach(p => p.classList.remove('show'));
    hideMiniKpis();
  }
}

/**
 * Show modal with agent details
 */
function showModal(agent) {
  const modalBody = document.getElementById('modalBody');
  
  let tableHtml = '';
  if (agent.rows && agent.rows.length > 0) {
    const headers = Object.keys(agent.rows[0]);
    const headerRow = '<tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr>';
    const bodyRows = agent.rows.map(r => 
      '<tr>' + Object.values(r).map(v => '<td>' + v + '</td>').join('') + '</tr>'
    ).join('');
    tableHtml = '<table><thead>' + headerRow + '</thead><tbody>' + bodyRows + '</tbody></table>';
  } else {
    tableHtml = '<div style="color:#888;padding:12px">Žádná data</div>';
  }
  
  modalBody.innerHTML = `
    <div class="modal-header">
      <div>
        <h4>${agent.name} - ${agent.role}</h4>
      </div>
      <div class="modal-controls">
        <button class="popup-btn" onclick="toggleMaximizeModal()" title="Maximalizovat/Obnovit">⛶</button>
        <button class="modal-close" onclick="closeModal()" title="Zavřít">×</button>
      </div>
    </div>
    <div class="kpis">${agent.kpis.map(k => 
      '<div class="kpi"><div>' + k[1] + '</div><div>' + k[0] + '</div></div>'
    ).join('')}</div>
    ${tableHtml}
  `;
  
  document.getElementById('modalOverlay').classList.add('show');
}

/**
 * Toggle modal maximize
 */
function toggleMaximizeModal() {
  const modal = document.getElementById('modalContent');
  modal.classList.toggle('maximized');
}

/**
 * Close modal
 */
function closeModal() {
  const modal = document.getElementById('modalContent');
  document.getElementById('modalOverlay').classList.remove('show');
  modal.classList.remove('maximized');
  selectedAgentId = null;
  document.querySelectorAll('.agent').forEach(a => a.classList.remove('selected'));
}

/**
 * Show mini KPI popups for all agents
 */
function showMiniKpis() {
  kpiPopupsVisible = true;
  miniKpiPopups.forEach((item, index) => {
    const { element, pos, agentDiv, agentId } = item;
    const rect = agentDiv.getBoundingClientRect();
    
    const isIsabella = agentId === 'isabella';
    const heightOffset = isIsabella ? 0 : 60;
    
    // Position mini KPI near agent
    if (pos.popupDirection === 'top') {
      // Isabella - above
      element.style.top = (rect.top + window.scrollY - 50) + 'px';
      element.style.left = (rect.left + window.scrollX + agentDiv.offsetWidth/2 - 80) + 'px';
    } else if (pos.popupDirection === 'bottom') {
      element.style.top = (rect.bottom + window.scrollY + 10 - heightOffset) + 'px';
      element.style.left = (rect.left + window.scrollX + agentDiv.offsetWidth/2 - 80) + 'px';
    } else if (pos.popupDirection === 'left') {
      element.style.top = (rect.top + window.scrollY + agentDiv.offsetHeight/2 - 20 - heightOffset) + 'px';
      element.style.left = (rect.left + window.scrollX - 180) + 'px';
    } else {
      element.style.top = (rect.top + window.scrollY + agentDiv.offsetHeight/2 - 20 - heightOffset) + 'px';
      element.style.left = (rect.right + window.scrollX + 10) + 'px';
    }
    
    // Stagger animation
    setTimeout(() => {
      element.classList.add('show');
    }, index * 80);
  });
}

/**
 * Hide mini KPI popups
 */
function hideMiniKpis() {
  kpiPopupsVisible = false;
  miniKpiPopups.forEach(item => {
    item.element.classList.remove('show');
  });
}

/**
 * Toggle chat window
 */
function toggleChat() {
  document.getElementById('chatBox').classList.toggle('show');
}

/**
 * Send chat message
 */
function sendChat() {
  const input = document.getElementById('chatInput');
  if (!input.value.trim() || isTyping) return;
  
  const userMessage = input.value.trim();
  chatMessages.push({ who: 'user', text: userMessage });
  renderChat();
  input.value = '';
  
  // Show typing indicator
  isTyping = true;
  showTypingIndicator();
  
  // Simulate realistic delay (1-3 seconds)
  const delay = 1000 + Math.random() * 2000;
  setTimeout(() => {
    isTyping = false;
    chatMessages.push({ who: 'bot', text: 'Demo: rozumím, provádím akci – ' + userMessage });
    renderChat();
  }, delay);
}

/**
 * Show typing indicator in chat
 */
function showTypingIndicator() {
  const body = document.getElementById('chatBody');
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typingIndicator';
  typingDiv.style.marginBottom = '8px';
  typingDiv.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
  body.appendChild(typingDiv);
  body.scrollTop = body.scrollHeight;
}

/**
 * Render chat messages
 */
function renderChat() {
  const body = document.getElementById('chatBody');
  
  // Remove typing indicator if exists
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) typingIndicator.remove();
  
  body.innerHTML = chatMessages.map(m => 
    '<div style="margin-bottom:8px"><div style="display:inline-block;padding:10px;border-radius:12px;max-width:80%;background:' +
    (m.who === 'user' ? 'linear-gradient(135deg,#7dd1fc,#c0ebff)' : 'linear-gradient(135deg,#e0f8ff,#fff)') +
    '">' + m.text + '</div></div>'
  ).join('');
  
  body.scrollTop = body.scrollHeight;
}

/**
 * Save configuration
 */
function saveConfig() {
  if (confirm('Uložit nastavení trvale?')) {
    alert('✅ Vaše změny byly uloženy!');
    document.getElementById('configPopup').classList.remove('show');
  }
}

function applyConfig() {
  if (confirm('Opravdu chcete použít tato nastavení?')) {
    alert('⚡ Nastavení bylo použito!');
  }
}

function toggleMaximizeConfig() {
  const popup = document.getElementById('configPopup');
  popup.classList.toggle('maximized');
}

function closeConfigPopup() {
  const popup = document.getElementById('configPopup');
  popup.classList.remove('show');
  popup.classList.remove('maximized');
}

function toggleMaximizePopup(agentId) {
  const popup = document.querySelector(`.agent-popup[data-agent-id="${agentId}"]`);
  if (popup) {
    popup.classList.toggle('maximized');
  }
}

function closeAgentPopup(agentId) {
  const popup = document.querySelector(`.agent-popup[data-agent-id="${agentId}"]`);
  if (popup) {
    popup.classList.remove('show');
    popup.classList.remove('maximized');
  }
  // Also deselect the agent
  document.querySelectorAll('.agent').forEach(a => a.classList.remove('selected'));
  selectedAgentId = null;
}

/**
 * Configuration settings templates for each agent
 */
const CONFIG_TEMPLATES = {
  isabella: `
    <div class="config-section">
      <label class="config-label">Pracovní doba</label>
      <input type="text" class="config-input" placeholder="8:00 - 18:00" value="8:00 - 18:00">
    </div>
    <div class="config-section">
      <label class="config-label">Režim zpracování hovorů</label>
      <select class="config-select">
        <option>Všechny hovory</option>
        <option>Pouze mimo pracovní dobu</option>
        <option>Pouze při plné frontě</option>
        <option>Prioritní hovory</option>
      </select>
    </div>
    <div class="config-section">
      <label class="config-label">Upozornění</label>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox" checked>
        <span style="font-size:13px">E-mailová notifikace</span>
      </div>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox" checked>
        <span style="font-size:13px">SMS upozornění</span>
      </div>
    </div>
    <div class="config-section">
      <label class="config-label">Automatické akce</label>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox" checked>
        <span style="font-size:13px">Automatické potvrzování SMS</span>
      </div>
    </div>
  `,
  leo: `
    <div class="config-section">
      <label class="config-label">Cílový archiv</label>
      <select class="config-select">
        <option>archiv_1</option>
        <option selected>archiv_2</option>
        <option>archiv_3</option>
        <option>archiv_4</option>
      </select>
    </div>
    <div class="config-section">
      <label class="config-label">Maximální velikost souboru</label>
      <input type="text" class="config-input" value="5 MB">
    </div>
    <div class="config-section">
      <label class="config-label">Automatické zpracování</label>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox" checked>
        <span style="font-size:13px">Automaticky importovat nové karty</span>
      </div>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox" checked>
        <span style="font-size:13px">Kontrola duplicit před nahráním</span>
      </div>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox">
        <span style="font-size:13px">OCR rozpoznávání textu</span>
      </div>
    </div>
  `,
  gabriel: `
    <div class="config-section">
      <label class="config-label">Prioritní klíčová slova</label>
      <input type="text" class="config-input" value="urgentní, okamžitě, důležité" placeholder="Oddělte čárkou">
    </div>
    <div class="config-section">
      <label class="config-label">Automatické odpovědi</label>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox" checked>
        <span style="font-size:13px">Automatická odpověď na dotazy o otevírací době</span>
      </div>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox" checked>
        <span style="font-size:13px">Automatické potvrzení přijetí e-mailu</span>
      </div>
    </div>
    <div class="config-section">
      <label class="config-label">Eskalace problémů</label>
      <select class="config-select">
        <option>Okamžitě upozornit</option>
        <option selected>Shromáždit a odeslat jednou denně</option>
        <option>Pouze kritické problémy</option>
      </select>
    </div>
  `,
  nora: `
    <div class="config-section">
      <label class="config-label">Formát výstupu shrnutí</label>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox" checked>
        <span style="font-size:13px">Textové shrnutí</span>
      </div>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox">
        <span style="font-size:13px">Hlasové shrnutí (audio)</span>
      </div>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox">
        <span style="font-size:13px">Strukturovaný JSON export</span>
      </div>
    </div>
    <div class="config-section">
      <label class="config-label">Úroveň detailu</label>
      <select class="config-select">
        <option>Základní shrnutí</option>
        <option selected>Standardní detail</option>
        <option>Kompletní analýza</option>
      </select>
    </div>
    <div class="config-section">
      <label class="config-label">Jazyk shrnutí</label>
      <select class="config-select">
        <option selected>Čeština</option>
        <option>Angličtina</option>
        <option>Slovenština</option>
      </select>
    </div>
  `,
  auditor: `
    <div class="config-section">
      <label class="config-label">Frekvence auditů</label>
      <select class="config-select">
        <option>Každou hodinu</option>
        <option selected>Každé 4 hodiny</option>
        <option>Jednou denně</option>
        <option>Týdně</option>
      </select>
    </div>
    <div class="config-section">
      <label class="config-label">Kontrolované oblasti</label>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox" checked>
        <span style="font-size:13px">Úplnost dokumentace</span>
      </div>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox" checked>
        <span style="font-size:13px">Fakturační nesrovnalosti</span>
      </div>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox" checked>
        <span style="font-size:13px">Chybějící podpisy</span>
      </div>
      <div class="config-checkbox-group">
        <input type="checkbox" class="config-checkbox">
        <span style="font-size:13px">Duplicitní záznamy</span>
      </div>
    </div>
    <div class="config-section">
      <label class="config-label">Priorita upozornění</label>
      <select class="config-select">
        <option selected>Pouze vysoká priorita</option>
        <option>Střední a vyšší</option>
        <option>Všechny problémy</option>
      </select>
    </div>
  `
};

/**
 * Event Listeners
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  placeAgents();
  
  // Set initial config content
  const contentDiv = document.getElementById('configContent');
  if (contentDiv) {
    contentDiv.innerHTML = CONFIG_TEMPLATES.isabella;
  }
  
  // Initialize user menu with user info
  if (appData.user_info) {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    if (userName) userName.textContent = appData.user_info.name;
    if (userRole) userRole.textContent = appData.user_info.role === 'admin' ? 'Administrátor' : 'Uživatel';
    
    // Show admin panel item for admins
    if (appData.user_info.role === 'admin') {
      const adminItem = document.getElementById('adminPanelItem');
      if (adminItem) adminItem.style.display = 'flex';
    }
  }
});

// Center button toggles mini KPI popups
document.getElementById('center').addEventListener('click', (e) => {
  e.stopPropagation();
  closeModal();
  document.querySelectorAll('.agent-popup').forEach(p => p.classList.remove('show'));
  
  if (kpiPopupsVisible) {
    hideMiniKpis();
  } else {
    showMiniKpis();
  }
});

// Simulate button toggle
document.getElementById('simulateBtn').addEventListener('click', () => {
  simulateActive = !simulateActive;
  const dropdown = document.getElementById('agentSelect');
  
  if (simulateActive) {
    // Clear and repopulate dropdown based on user role
    dropdown.innerHTML = '<option value="">Vyberte agenta...</option>';
    const userJobRole = appData.user_info?.job_role || 'admin';
    const allowedAgents = ROLE_AGENT_ACCESS[userJobRole] || ROLE_AGENT_ACCESS['admin'];
    
    appData.agents.forEach(agent => {
      if (allowedAgents.includes(agent.id)) {
        const option = document.createElement('option');
        option.value = agent.id;
        option.textContent = agent.name;
        dropdown.appendChild(option);
      }
    });
    
    dropdown.style.display = 'block';
  } else {
    dropdown.style.display = 'none';
    selectedSimAgent = "";
    dropdown.value = "";
    placeAgents();
  }
});

// Agent selection dropdown
document.getElementById('agentSelect').addEventListener('change', (e) => {
  selectedSimAgent = e.target.value;
  placeAgents();
});

// Modal overlay click to close
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'modalOverlay') {
    closeModal();
  }
});

// Configuration button toggle
document.getElementById('configBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  const popup = document.getElementById('configPopup');
  popup.classList.toggle('show');
});

// Configuration agent selector
document.getElementById('configAgentSelect').addEventListener('change', (e) => {
  const selectedAgent = e.target.value;
  const contentDiv = document.getElementById('configContent');
  contentDiv.innerHTML = CONFIG_TEMPLATES[selectedAgent] || CONFIG_TEMPLATES.isabella;
});

// Close config popup when clicking outside
document.addEventListener('click', (e) => {
  const popup = document.getElementById('configPopup');
  const btn = document.getElementById('configBtn');
  if (popup && btn && !popup.contains(e.target) && !btn.contains(e.target)) {
    popup.classList.remove('show');
  }
});

// Enter key in chat input
document.getElementById('chatInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendChat();
  }
});

// User menu button toggle
document.getElementById('userMenuBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  const menu = document.getElementById('userMenu');
  menu.classList.toggle('show');
  
  // Close config popup if open
  document.getElementById('configPopup').classList.remove('show');
});

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('userMenu');
  const btn = document.getElementById('userMenuBtn');
  if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('show');
  }
});

/**
 * User menu actions
 */
function handleLogout() {
  if (confirm('Opravdu se chcete odhlásit?')) {
    // Redirect to the same page with logout parameter
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('logout', 'true');
    window.location.href = currentUrl.toString();
  }
}

function openPersonalSettings() {
  alert('Osobní nastavení - tato funkce bude brzy k dispozici');
  document.getElementById('userMenu').classList.remove('show');
}

function openAdminPanel() {
  alert('Administrační panel - tato funkce bude brzy k dispozici');
  document.getElementById('userMenu').classList.remove('show');
}