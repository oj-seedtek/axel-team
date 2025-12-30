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
  
  // Clean up any existing agent popups
  document.querySelectorAll('.agent-popup').forEach(p => p.remove());
  
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
    
    // Render avatar properly - check if it's a data URL (image) or emoji
    let avatarHtml = '';
    if (agent.avatar && agent.avatar.startsWith('data:image')) {
      // It's a base64 image - render as img tag
      avatarHtml = `<img src="${agent.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="${agent.name}">`;
    } else {
      // It's an emoji or text - render as div
      avatarHtml = `<div style="font-size:44px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${agent.avatar || '👤'}</div>`;
    }
    div.innerHTML = avatarHtml;
    div.dataset.agentId = agent.id;

    // Create popup only for non-simulation mode (simulation uses modals now)
    // For simulation mode, we still create it but it won't be used/shown
    const popup = shouldHighlight ? null : createAgentPopup(agent, false);
    if (popup) {
      document.body.appendChild(popup);
    }

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
 * Create agent detail popup (for non-simulation mode only)
 * Note: Simulation mode now uses modals instead
 */
function createAgentPopup(agent, isSimulated) {
  // Don't create popup for simulation mode - we use modals now
  if (isSimulated) {
    return null;
  }
  
  const popup = document.createElement('div');
  popup.className = 'agent-popup';
  popup.dataset.agentId = agent.id;
  // Empty popup for non-simulation mode (will use modal instead)
  popup.innerHTML = '';
  
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
  
  // Close any existing popups
  document.querySelectorAll('.agent-popup').forEach(p => p.classList.remove('show'));
  
  // Both simulation and non-simulation modes now use modals
  showModal(agent, isSimulated);
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
 * Get rows that need attention (for simulation mode)
 */
function getRowsNeedingAttention(agent) {
  if (!agent.rows || agent.rows.length === 0) return [];
  
  // Filter rows that need attention based on status/result
  const attentionIndicators = [
    '⚠️', '⏳', '📞', 
    'Chybí', 'Nalezeno', 'Problém', 'Neodpovězený',
    'Přepojeno', 'Čeká', 'Vyžaduje', 'Nesoulad',
    'Chybějící', 'Neúplná', 'Duplicitní'
  ];
  
  return agent.rows.filter(row => {
    const values = Object.values(row).join(' ').toLowerCase();
    const lowerIndicators = attentionIndicators.map(i => i.toLowerCase());
    
    // Check if any indicator is in the row values
    const hasIndicator = lowerIndicators.some(indicator => 
      values.includes(indicator)
    );
    
    // Also check specific fields for each agent type
    if (agent.id === 'isabella') {
      const result = row['Výsledek'] || '';
      return hasIndicator || result.includes('⏳') || result.includes('📞') || result.includes('Čeká');
    } else if (agent.id === 'gabriel') {
      const comment = row['Komentář'] || '';
      const found = row['Zjištěno'] || '';
      return hasIndicator || comment.includes('⚠️') || found === 'Ano';
    } else if (agent.id === 'leo') {
      const status = row['Status'] || '';
      return hasIndicator || status.includes('⚠️') || status.includes('⏳') || status.includes('Chybí');
    } else if (agent.id === 'auditor') {
      // All auditor rows need attention
      return true;
    } else if (agent.id === 'nora') {
      // Nora rows typically don't need attention, but check anyway
      const summary = row['Shrnutí'] || '';
      return hasIndicator || summary.includes('Drobné') || summary.includes('Nutná');
    }
    
    return hasIndicator;
  });
}

/**
 * Format row as attention item with description
 */
function formatAttentionItem(row, agentId, idx) {
  // Extract patient name and context based on agent type
  let patientName = '';
  let context = '';
  let problemDescription = row['Popis problému'] || '';
  
  if (agentId === 'isabella') {
    patientName = row['Pacient'] || '';
    const reason = row['Důvod hovoru'] || '';
    const request = row['Požadavek'] || '';
    const result = row['Výsledek'] || '';
    const time = row['Čas'] || '';
    context = `${reason}${request ? ` • ${request}` : ''}${time ? ` • ${time}` : ''}${result ? ` • ${result}` : ''}`;
    
    if (!problemDescription) {
      if (result.includes('⏳') || result.includes('📞')) {
        problemDescription = `Hovor vyžaduje další akci: ${result}`;
      }
    }
  } else if (agentId === 'gabriel') {
    patientName = row['Odesílatel'] || '';
    const topic = row['Téma'] || '';
    const found = row['Zjištěno'] || '';
    const comment = row['Komentář'] || '';
    context = `${topic}${found ? ` • Zjištěno: ${found}` : ''}${comment ? ` • ${comment}` : ''}`;
    
    if (!problemDescription) {
      if (comment.includes('⚠️') || found === 'Ano') {
        problemDescription = `E-mail vyžaduje okamžitou pozornost: ${topic}`;
      }
    }
  } else if (agentId === 'leo') {
    patientName = row['Soubor'] || '';
    const status = row['Status'] || '';
    const size = row['Velikost'] || '';
    const archive = row['Archiv'] || '';
    context = `${status}${size ? ` • ${size}` : ''}${archive ? ` • ${archive}` : ''}`;
    
    if (!problemDescription) {
      if (status.includes('⚠️') || status.includes('⏳')) {
        problemDescription = `Karta vyžaduje akci: ${status}`;
      }
    }
  } else if (agentId === 'nora') {
    patientName = row['Pacient'] || '';
    const summary = row['Shrnutí'] || '';
    const insurance = row['Pojišťovna'] || '';
    const time = row['Čas přípravy'] || '';
    context = `${insurance ? `${insurance}` : ''}${summary ? ` • ${summary}` : ''}${time ? ` • ${time}` : ''}`;
    
    if (!problemDescription) {
      if (summary.includes('Drobné') || summary.includes('Nutná')) {
        problemDescription = `Shrnutí vyžaduje kontrolu: ${summary}`;
      }
    }
  } else if (agentId === 'auditor') {
    patientName = row['Pacient'] || '';
    const problem = row['Problém'] || '';
    const priority = row['Priorita'] || '';
    const link = row['Link'] || '';
    context = `${problem}${priority ? ` • Priorita: ${priority}` : ''}`;
    
    if (!problemDescription) {
      problemDescription = `Nalezen problém: ${problem}`;
    }
  } else {
    // Fallback: try to find patient name in any field
    patientName = row['Pacient'] || row['Odesílatel'] || row['Soubor'] || '';
    const keys = Object.keys(row);
    const values = Object.values(row);
    context = keys.map((key, i) => {
      if (key === 'Link' || key === 'Čas' || key === 'Velikost' || key === 'Archiv' || key === 'Popis problému' || key === 'Pacient' || key === 'Odesílatel' || key === 'Soubor') {
        return '';
      }
      return `${key}: ${values[i]}`;
    }).filter(v => v).join(' • ');
  }
  
  return { 
    patientName, 
    context, 
    problemDescription, 
    row, 
    idx 
  };
}

/**
 * Show modal with agent details
 */
function showModal(agent, isSimulated = false) {
  const modalBody = document.getElementById('modalBody');
  
  let contentHtml = '';
  
  if (isSimulated) {
    // Simulation mode: Show only rows that need attention with checkboxes
    const attentionRows = getRowsNeedingAttention(agent);
    
    if (attentionRows.length > 0) {
      const attentionItems = attentionRows.map((row, idx) => formatAttentionItem(row, agent.id, idx));
      
      contentHtml = `
        <div style="margin-top:16px;margin-bottom:12px;font-weight:600;color:#007c91;font-size:16px">Položky vyžadující pozornost:</div>
        <div id="attention-container-modal-${agent.id}" style="max-height:50vh;overflow-y:auto;">
          ${attentionItems.map((item, idx) => `
            <div class="attention-item" data-item-idx="${idx}">
              <label class="attention-checkbox-label">
                <input type="checkbox" class="attention-checkbox" id="attention-modal-${agent.id}-${idx}" onchange="updateSaveButtonState('${agent.id}')">
                <span class="attention-checkmark"></span>
                <div class="attention-content">
                  ${item.patientName ? `<div class="attention-patient">${item.patientName}</div>` : ''}
                  ${item.context ? `<div class="attention-context">${item.context}</div>` : ''}
                  ${item.problemDescription ? `<div class="attention-description">${item.problemDescription}</div>` : ''}
                </div>
              </label>
            </div>
          `).join('')}
        </div>
        <button class="attention-save-btn" id="save-btn-modal-${agent.id}" onclick="saveAttentionChangesModal('${agent.id}')" disabled style="margin-top:16px;width:100%">💾 Uložit změny</button>
      `;
    } else {
      contentHtml = '<div style="color:#888;padding:20px;text-align:center;font-size:14px">✅ Všechny položky jsou v pořádku, není potřeba žádná akce.</div>';
    }
  } else {
    // Non-simulation mode: Show table as before (exclude "Popis problému" from table display)
    if (agent.rows && agent.rows.length > 0) {
      const headers = Object.keys(agent.rows[0]).filter(h => h !== 'Popis problému');
      const headerRow = '<tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr>';
      const bodyRows = agent.rows.map(r => {
        const values = headers.map(h => r[h] || '');
        return '<tr>' + values.map(v => '<td>' + v + '</td>').join('') + '</tr>';
      }).join('');
      contentHtml = '<table><thead>' + headerRow + '</thead><tbody>' + bodyRows + '</tbody></table>';
    } else {
      contentHtml = '<div style="color:#888;padding:12px">Žádná data</div>';
    }
  }
  
  modalBody.innerHTML = `
    <div class="modal-header">
      <div>
        <h4>${agent.name} - ${agent.role}</h4>
        ${isSimulated ? '<div class="simulation-header" style="margin-top:8px;margin-bottom:0">🚨 Vyžaduje okamžitou pozornost</div>' : ''}
      </div>
      <div class="modal-controls">
        <button class="popup-btn" onclick="toggleMaximizeModal()" title="Maximalizovat/Obnovit">⛶</button>
        <button class="modal-close" onclick="closeModal()" title="Zavřít">×</button>
      </div>
    </div>
    <div class="kpis">${agent.kpis.map(k => 
      '<div class="kpi"><div>' + k[1] + '</div><div>' + k[0] + '</div></div>'
    ).join('')}</div>
    ${contentHtml}
  `;
  
  document.getElementById('modalOverlay').classList.add('show');
}

function updateSaveButtonState(agentId) {
  const container = document.getElementById(`attention-container-modal-${agentId}`);
  const saveBtn = document.getElementById(`save-btn-modal-${agentId}`);
  
  if (!container || !saveBtn) return;
  
  const checkboxes = container.querySelectorAll('.attention-checkbox');
  const hasChecked = Array.from(checkboxes).some(cb => cb.checked);
  
  saveBtn.disabled = !hasChecked;
  if (hasChecked) {
    saveBtn.classList.add('enabled');
  } else {
    saveBtn.classList.remove('enabled');
  }
}

function saveAttentionChangesModal(agentId) {
  const container = document.getElementById(`attention-container-modal-${agentId}`);
  const saveBtn = document.getElementById(`save-btn-modal-${agentId}`);
  
  if (!container) return;
  
  const checkboxes = container.querySelectorAll('.attention-checkbox');
  const checkedItems = [];
  
  checkboxes.forEach((checkbox, idx) => {
    if (checkbox.checked) {
      checkedItems.push(idx);
    }
  });
  
  if (checkedItems.length === 0) return;
  
  // Remove checked items with animation
  checkedItems.reverse().forEach(idx => {
    const item = container.querySelector(`[data-item-idx="${idx}"]`);
    if (item) {
      item.style.transition = 'opacity 0.4s ease, transform 0.4s ease, margin 0.4s ease';
      item.style.opacity = '0';
      item.style.transform = 'translateX(-30px) scale(0.95)';
      item.style.marginBottom = '0';
      item.style.paddingTop = '0';
      item.style.paddingBottom = '0';
      item.style.height = '0';
      item.style.overflow = 'hidden';
      setTimeout(() => {
        item.remove();
      }, 400);
    }
  });
  
  // Update button state and hide if no items left
  setTimeout(() => {
    const remainingItems = container.querySelectorAll('.attention-item');
    if (remainingItems.length === 0) {
      if (saveBtn) {
        saveBtn.style.transition = 'opacity 0.3s ease';
        saveBtn.style.opacity = '0';
        setTimeout(() => {
          saveBtn.remove();
        }, 300);
      }
      container.innerHTML = '<div style="color:#4caf50;padding:20px;text-align:center;font-size:14px;font-weight:600">✅ Všechny položky byly úspěšně zpracovány!</div>';
    } else {
      updateSaveButtonState(agentId);
    }
  }, 450);
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
  const sendBtn = document.getElementById('chatSendBtn');
  if (!input.value.trim() || isTyping) return;
  
  // Animate button
  if (sendBtn) {
    sendBtn.classList.add('clicked', 'animating');
    setTimeout(() => {
      sendBtn.classList.remove('clicked', 'animating');
    }, 600);
  }
  
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
    // Reset button state
    const saveBtn = document.querySelector('.config-save-btn');
    if (saveBtn) {
      saveBtn.classList.remove('enabled');
    }
  }
}

function applyConfig() {
  if (confirm('Opravdu chcete použít tato nastavení?')) {
    alert('⚡ Nastavení bylo použito!');
    // Enable save button after apply
    const saveBtn = document.querySelector('.config-save-btn');
    if (saveBtn) {
      saveBtn.classList.add('enabled');
    }
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

function saveTaskChanges(agentId) {
  const container = document.getElementById(`tasks-container-${agentId}`);
  if (!container) return;
  
  const checkboxes = container.querySelectorAll('.task-checkbox');
  const checkedItems = [];
  
  checkboxes.forEach((checkbox, idx) => {
    if (checkbox.checked) {
      checkedItems.push(idx);
    }
  });
  
  // Remove checked items
  checkedItems.reverse().forEach(idx => {
    const taskItem = container.querySelector(`[data-task-idx="${idx}"]`);
    if (taskItem) {
      taskItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      taskItem.style.opacity = '0';
      taskItem.style.transform = 'translateX(-20px)';
      setTimeout(() => {
        taskItem.remove();
      }, 300);
    }
  });
  
  // Hide save button if no tasks left
  setTimeout(() => {
    const remainingTasks = container.querySelectorAll('.task-item');
    if (remainingTasks.length === 0) {
      const saveBtn = container.parentElement.querySelector('.config-save-btn');
      if (saveBtn) {
        saveBtn.style.transition = 'opacity 0.3s ease';
        saveBtn.style.opacity = '0';
        setTimeout(() => {
          saveBtn.remove();
        }, 300);
      }
    }
  }, 350);
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
  const isShowing = popup.classList.contains('show');
  popup.classList.toggle('show');
  
  // Reset save button state when opening
  if (!isShowing) {
    const saveBtn = document.querySelector('.config-save-btn');
    if (saveBtn) {
      saveBtn.classList.remove('enabled');
    }
  }
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