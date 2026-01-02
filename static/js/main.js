/**
 * Dental IQ - Main JavaScript
 * Handles all interactive functionality for the agent dashboard
 */

// Global state
const appData = window.APP_DATA || { agents: [], simulate_active: false, selected_agent: "", user_info: {} };

// Define handleLogout globally IMMEDIATELY (before DOMContentLoaded)
// This ensures it's available when onclick handlers are evaluated
window.handleLogout = function handleLogout() {
  console.log('handleLogout called');
  if (confirm('Opravdu se chcete odhlásit?')) {
    console.log('Logout confirmed, clearing session...');
    
    // Clear localStorage immediately
    try {
      localStorage.removeItem('dental_iq_session');
      localStorage.removeItem('dental_iq_session_token');
      console.log('localStorage cleared');
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    
    // Redirect to the same page with logout parameter
    // Use window.top to handle iframe case (Streamlit component)
    let targetWindow = window;
    try {
      if (window.top && window.top !== window) {
        targetWindow = window.top;
        console.log('Using top window for redirect');
      }
    } catch (e) {
      // Cross-origin iframe, use current window
      console.log('Using current window (cross-origin)');
      targetWindow = window;
    }
    
    try {
      const currentUrl = new URL(targetWindow.location.href);
      currentUrl.searchParams.set('logout', 'true');
      console.log('Redirecting to:', currentUrl.toString());
      targetWindow.location.href = currentUrl.toString();
    } catch (e) {
      // Fallback: try to reload with query param
      console.error('Error redirecting:', e);
      const baseUrl = window.location.href.split('?')[0];
      window.location.href = baseUrl + '?logout=true';
    }
  } else {
    console.log('Logout cancelled');
  }
};
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
  
  // Special handling for Nora - show patient search
  if (agent.id === 'nora' && !isSimulated) {
    showNoraPatientSearch();
    return;
  }
  
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
async function sendChat() {
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
  
  try {
    // Send message to Streamlit backend via postMessage
    if (window.parent && window.parent !== window) {
      // We're in an iframe (Streamlit component)
      window.parent.postMessage({
        type: 'streamlit:setComponentValue',
        value: JSON.stringify({
          action: 'chat',
          message: userMessage,
          agents_data: appData.agents,
          chat_history: chatMessages
        })
      }, '*');
      
      // Poll for response (Streamlit will rerun and we can check for response)
      let pollCount = 0;
      const maxPolls = 40; // 20 seconds max
      
      const pollInterval = setInterval(() => {
        pollCount++;
        
        // Try to get response from parent (this is a simplified approach)
        // In production, you'd use proper Streamlit component return values
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          isTyping = false;
          chatMessages.push({ 
            who: 'bot', 
            text: 'Omlouvám se, odpověď trvá příliš dlouho. Zkontrolujte prosím konfiguraci Azure OpenAI.' 
          });
          renderChat();
        }
      }, 500);
      
      // For now, use a direct API approach via a hidden endpoint
      // This is a workaround until proper Streamlit component communication is set up
      callChatAPI(userMessage, pollInterval);
    } else {
      // Direct call if not in iframe
      callChatAPI(userMessage);
    }
  } catch (error) {
    isTyping = false;
    chatMessages.push({ 
      who: 'bot', 
      text: 'Omlouvám se, došlo k chybě při komunikaci s AI. Zkuste to prosím znovu.' 
    });
    renderChat();
    console.error('Chat error:', error);
  }
}

/**
 * Call chat API directly
 */
async function callChatAPI(userMessage, pollInterval = null) {
  try {
    // Create a form data approach for Streamlit
    // Since Streamlit components run in iframes, we need to communicate via parent
    const formData = new FormData();
    formData.append('message', userMessage);
    formData.append('agents_data', JSON.stringify(appData.agents));
    formData.append('chat_history', JSON.stringify(chatMessages));
    
    // Use fetch to call a Streamlit endpoint
    // Note: This requires a custom Streamlit endpoint or using query params
    const response = await fetch(window.location.href + '?chat_message=' + encodeURIComponent(userMessage), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Parse response if it's JSON
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // If not JSON, it might be HTML (Streamlit page)
      // In this case, we'll need to extract data differently
      // For now, show a message about configuration
      throw new Error('Response is not JSON - check Azure OpenAI configuration');
    }
    
    if (data && data.response) {
      if (pollInterval) clearInterval(pollInterval);
      isTyping = false;
      chatMessages.push({ who: 'bot', text: data.response });
      renderChat();
    } else {
      throw new Error('No response in data');
    }
  } catch (error) {
    if (pollInterval) clearInterval(pollInterval);
    isTyping = false;
    chatMessages.push({ 
      who: 'bot', 
      text: 'Omlouvám se, došlo k chybě při komunikaci s AI. Zkontrolujte prosím konfiguraci Azure OpenAI (AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY).' 
    });
    renderChat();
    console.error('Chat API error:', error);
  }
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
      <div style="display:flex;gap:12px;align-items:center">
        <select class="config-select" style="flex:1">
          <option>00:00</option>
          <option>00:15</option>
          <option>00:30</option>
          <option>00:45</option>
          <option>01:00</option>
          <option>01:15</option>
          <option>01:30</option>
          <option>01:45</option>
          <option>02:00</option>
          <option>02:15</option>
          <option>02:30</option>
          <option>02:45</option>
          <option>03:00</option>
          <option>03:15</option>
          <option>03:30</option>
          <option>03:45</option>
          <option>04:00</option>
          <option>04:15</option>
          <option>04:30</option>
          <option>04:45</option>
          <option>05:00</option>
          <option>05:15</option>
          <option>05:30</option>
          <option>05:45</option>
          <option>06:00</option>
          <option>06:15</option>
          <option>06:30</option>
          <option>06:45</option>
          <option>07:00</option>
          <option>07:15</option>
          <option>07:30</option>
          <option>07:45</option>
          <option selected>08:00</option>
          <option>08:15</option>
          <option>08:30</option>
          <option>08:45</option>
          <option>09:00</option>
          <option>09:15</option>
          <option>09:30</option>
          <option>09:45</option>
          <option>10:00</option>
          <option>10:15</option>
          <option>10:30</option>
          <option>10:45</option>
          <option>11:00</option>
          <option>11:15</option>
          <option>11:30</option>
          <option>11:45</option>
          <option>12:00</option>
          <option>12:15</option>
          <option>12:30</option>
          <option>12:45</option>
          <option>13:00</option>
          <option>13:15</option>
          <option>13:30</option>
          <option>13:45</option>
          <option>14:00</option>
          <option>14:15</option>
          <option>14:30</option>
          <option>14:45</option>
          <option>15:00</option>
          <option>15:15</option>
          <option>15:30</option>
          <option>15:45</option>
          <option>16:00</option>
          <option>16:15</option>
          <option>16:30</option>
          <option>16:45</option>
          <option>17:00</option>
          <option>17:15</option>
          <option>17:30</option>
          <option>17:45</option>
          <option selected>18:00</option>
          <option>18:15</option>
          <option>18:30</option>
          <option>18:45</option>
          <option>19:00</option>
          <option>19:15</option>
          <option>19:30</option>
          <option>19:45</option>
          <option>20:00</option>
          <option>20:15</option>
          <option>20:30</option>
          <option>20:45</option>
          <option>21:00</option>
          <option>21:15</option>
          <option>21:30</option>
          <option>21:45</option>
          <option>22:00</option>
          <option>22:15</option>
          <option>22:30</option>
          <option>22:45</option>
          <option>23:00</option>
          <option>23:15</option>
          <option>23:30</option>
          <option>23:45</option>
        </select>
        <span style="color:#666;font-weight:600">-</span>
        <select class="config-select" style="flex:1">
          <option>00:00</option>
          <option>00:15</option>
          <option>00:30</option>
          <option>00:45</option>
          <option>01:00</option>
          <option>01:15</option>
          <option>01:30</option>
          <option>01:45</option>
          <option>02:00</option>
          <option>02:15</option>
          <option>02:30</option>
          <option>02:45</option>
          <option>03:00</option>
          <option>03:15</option>
          <option>03:30</option>
          <option>03:45</option>
          <option>04:00</option>
          <option>04:15</option>
          <option>04:30</option>
          <option>04:45</option>
          <option>05:00</option>
          <option>05:15</option>
          <option>05:30</option>
          <option>05:45</option>
          <option>06:00</option>
          <option>06:15</option>
          <option>06:30</option>
          <option>06:45</option>
          <option>07:00</option>
          <option>07:15</option>
          <option>07:30</option>
          <option>07:45</option>
          <option>08:00</option>
          <option>08:15</option>
          <option>08:30</option>
          <option>08:45</option>
          <option>09:00</option>
          <option>09:15</option>
          <option>09:30</option>
          <option>09:45</option>
          <option>10:00</option>
          <option>10:15</option>
          <option>10:30</option>
          <option>10:45</option>
          <option>11:00</option>
          <option>11:15</option>
          <option>11:30</option>
          <option>11:45</option>
          <option>12:00</option>
          <option>12:15</option>
          <option>12:30</option>
          <option>12:45</option>
          <option>13:00</option>
          <option>13:15</option>
          <option>13:30</option>
          <option>13:45</option>
          <option>14:00</option>
          <option>14:15</option>
          <option>14:30</option>
          <option>14:45</option>
          <option>15:00</option>
          <option>15:15</option>
          <option>15:30</option>
          <option>15:45</option>
          <option>16:00</option>
          <option>16:15</option>
          <option>16:30</option>
          <option>16:45</option>
          <option>17:00</option>
          <option>17:15</option>
          <option>17:30</option>
          <option>17:45</option>
          <option>18:00</option>
          <option>18:15</option>
          <option>18:30</option>
          <option>18:45</option>
          <option>19:00</option>
          <option>19:15</option>
          <option>19:30</option>
          <option>19:45</option>
          <option>20:00</option>
          <option>20:15</option>
          <option>20:30</option>
          <option>20:45</option>
          <option>21:00</option>
          <option>21:15</option>
          <option>21:30</option>
          <option>21:45</option>
          <option>22:00</option>
          <option>22:15</option>
          <option>22:30</option>
          <option>22:45</option>
          <option>23:00</option>
          <option>23:15</option>
          <option>23:30</option>
          <option>23:45</option>
        </select>
      </div>
    </div>
    <div class="config-section">
      <label class="config-label">Režim zpracování hovorů</label>
      <select class="config-select">
        <option>Všechny hovory</option>
        <option>Pouze mimo pracovní dobu</option>
        <option>Pouze při plné frontě</option>
        <option>Při plné frontě a mimo pracovní dobu</option>
      </select>
    </div>
    <div class="config-section">
      <label class="config-label">Automatické akce</label>
      <div class="config-toggle-group">
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Automatické potvrzování SMS</span>
            <label class="toggle-switch">
              <input type="checkbox" checked>
              <span class="toggle-slider"></span>
            </label>
          </label>
        </div>
      </div>
    </div>
    <div class="config-section">
      <label class="config-label" style="font-size:15px;font-weight:700;margin-bottom:12px">Konfigurace scénářů</label>
      <div class="config-toggle-group">
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Uvítací fráze (v češtině)</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="isabella-welcome-phrase" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="isabella-welcome-phrase-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Zadejte uvítací frázi..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Použít číslo pojištění k ověření pacienta</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="isabella-insurance-verify" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="isabella-insurance-verify-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k ověření..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Pokud se nepodaří pacienta ověřit</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="isabella-verify-fail" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="isabella-verify-fail-notes" style="display:none;margin-top:8px">
            <select class="config-select">
              <option>Přepojit na recepci</option>
              <option>Požádat o další údaje</option>
              <option>Označit jako urgentní</option>
              <option>Zaznamenat a vrátit se později</option>
            </select>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Pacient si může vybrat doktora</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="isabella-choose-doctor" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="isabella-choose-doctor-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k výběru doktora..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Nechat v kalendáři volné místo pro urgentní případy</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="isabella-urgent-slot" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="isabella-urgent-slot-notes" style="display:none;margin-top:8px">
            <select class="config-select">
              <option>1 hodina denně</option>
              <option>2 hodiny denně</option>
              <option>3 hodiny denně</option>
              <option>4 hodiny denně</option>
              <option>5 hodin denně</option>
            </select>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Automaticky poslat SMS potvrzení</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="isabella-confirm-sms" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="isabella-confirm-sms-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k SMS potvrzení..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Nabídnout zpětné volání při nedostupnosti</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="isabella-callback" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="isabella-callback-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k zpětnému volání..." rows="2"></textarea>
          </div>
        </div>
      </div>
    </div>
    <div class="config-section">
      <label class="config-label" style="font-size:15px;font-weight:700;margin-bottom:12px">Definice urgentnosti</label>
      <div class="config-toggle-group">
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Pacient krvácí</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="isabella-bleeding" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="isabella-bleeding-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k urgentnímu případu..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Pacient má silnou bolest</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="isabella-severe-pain" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="isabella-severe-pain-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k urgentnímu případu..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Pacient utrpěl úraz</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="isabella-trauma" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="isabella-trauma-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k urgentnímu případu..." rows="2"></textarea>
          </div>
        </div>
      </div>
    </div>
  `,
  leo: `
    <div class="config-section">
      <label class="config-label">Cílový systém</label>
      <select class="config-select" id="leo-target-system" onchange="updateLeoFolderField()">
        <option value="sharepoint">SharePoint</option>
        <option value="onedrive" selected>OneDrive</option>
        <option value="googledrive">Google Drive</option>
      </select>
      <button class="config-apply-btn" onclick="fakeLeoLogin()" style="width:100%;margin-top:8px">🔐 Přihlásit se</button>
    </div>
    <div class="config-section">
      <label class="config-label">Odkaz na složku</label>
      <input type="text" class="config-input" placeholder="https://..." value="" id="leo-folder-link">
      <button class="config-apply-btn" onclick="fakeLeoConnect()" style="width:100%;margin-top:8px">🔗 Propojit</button>
    </div>
    <div class="config-section">
      <label class="config-label" style="font-size:15px;font-weight:700;margin-bottom:12px">Konfigurace struktury archivu</label>
      <div style="margin-bottom:12px">
        <label class="config-label">Organizace souborů</label>
        <select class="config-select">
          <option>Všechny archivy v jedné složce na pacienta</option>
          <option>Samostatné složky pro každý typ dokumentu</option>
        </select>
      </div>
      <div style="margin-bottom:12px">
        <label class="config-label">Identifikace pacienta</label>
        <select class="config-select">
          <option>Podle rodného čísla</option>
          <option selected>Podle jména, příjmení a data narození</option>
        </select>
      </div>
      <div style="margin-bottom:12px">
        <label class="config-label">Rozdělení do podsložek</label>
        <select class="config-select">
          <option>Podle data</option>
          <option>Podle formátu souboru</option>
          <option>Bez rozdělení</option>
        </select>
      </div>
      <div style="margin-bottom:12px">
        <label class="config-label">Lékařské zprávy</label>
        <select class="config-select">
          <option>V hlavní složce</option>
          <option selected>V samostatné podsložce</option>
        </select>
      </div>
      <div style="margin-bottom:12px">
        <label class="config-label">Shrnutí komunikace</label>
        <select class="config-select">
          <option>V hlavní složce</option>
          <option selected>V samostatné podsložce</option>
        </select>
      </div>
      <div style="margin-bottom:12px">
        <label class="config-label">Pojmenování příloh</label>
        <select class="config-select">
          <option>Unix datum + typ souboru</option>
          <option>Datum a čas + název</option>
          <option>Název + pořadové číslo</option>
          <option>Původní název souboru</option>
        </select>
      </div>
    </div>
  `,
  gabriel: `
    <div class="config-section">
      <label class="config-label" style="font-size:15px;font-weight:700;margin-bottom:12px">Konfigurace</label>
      <div class="config-toggle-group">
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Automatické potvrzení přijetí e-mailu</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="gabriel-auto-confirm" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-auto-confirm-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k automatickému potvrzení..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Automatická odpověď na dotazy o otevírací době</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="gabriel-auto-reply-hours" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-auto-reply-hours-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k automatické odpovědi..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Eskalace problémů</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="gabriel-escalation" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-escalation-notes" style="display:none;margin-top:8px">
            <select class="config-select">
              <option>Okamžitě upozornit</option>
              <option selected>Shromáždit a odeslat jednou denně</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="config-section">
      <label class="config-label" style="font-size:15px;font-weight:700;margin-bottom:12px">Detekce kritických e-mailů (max 5)</label>
      <div class="config-toggle-group" id="gabriel-critical-emails">
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Stav pacienta se výrazně zhoršil</span>
            <label class="toggle-switch">
              <input type="checkbox" class="critical-email" data-toggle-id="gabriel-worse-state" onchange="toggleNotesField(this);checkMaxCriticalEmails(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-worse-state-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k detekci..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Pacient změnil pojišťovnu</span>
            <label class="toggle-switch">
              <input type="checkbox" class="critical-email" data-toggle-id="gabriel-insurance-change" onchange="toggleNotesField(this);checkMaxCriticalEmails(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-insurance-change-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k detekci..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Pacient se nemůže dostavit na schůzku</span>
            <label class="toggle-switch">
              <input type="checkbox" class="critical-email" data-toggle-id="gabriel-cannot-attend" onchange="toggleNotesField(this);checkMaxCriticalEmails(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-cannot-attend-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k detekci..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Pacientova data se změnila</span>
            <label class="toggle-switch">
              <input type="checkbox" class="critical-email" data-toggle-id="gabriel-data-change" onchange="toggleNotesField(this);checkMaxCriticalEmails(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-data-change-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k detekci..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Nové doporučení od lékaře</span>
            <label class="toggle-switch">
              <input type="checkbox" class="critical-email" data-toggle-id="gabriel-doctor-recommendation" onchange="toggleNotesField(this);checkMaxCriticalEmails(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-doctor-recommendation-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k detekci..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Problém s platbou</span>
            <label class="toggle-switch">
              <input type="checkbox" class="critical-email" data-toggle-id="gabriel-payment-issue" onchange="toggleNotesField(this);checkMaxCriticalEmails(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-payment-issue-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k detekci..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Stížnost pacienta</span>
            <label class="toggle-switch">
              <input type="checkbox" class="critical-email" data-toggle-id="gabriel-complaint" onchange="toggleNotesField(this);checkMaxCriticalEmails(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-complaint-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k detekci..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Naléhavá žádost</span>
            <label class="toggle-switch">
              <input type="checkbox" class="critical-email" data-toggle-id="gabriel-urgent-request" onchange="toggleNotesField(this);checkMaxCriticalEmails(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-urgent-request-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k detekci..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Lékařská pohotovost</span>
            <label class="toggle-switch">
              <input type="checkbox" class="critical-email" data-toggle-id="gabriel-medical-emergency" onchange="toggleNotesField(this);checkMaxCriticalEmails(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-medical-emergency-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k detekci..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Varování o alergii</span>
            <label class="toggle-switch">
              <input type="checkbox" class="critical-email" data-toggle-id="gabriel-allergy-warning" onchange="toggleNotesField(this);checkMaxCriticalEmails(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="gabriel-allergy-warning-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k detekci..." rows="2"></textarea>
          </div>
        </div>
      </div>
    </div>
  `,
  nora: `
    <div class="config-section">
      <label class="config-label">Formát výstupu shrnutí</label>
      <select class="config-select">
        <option selected>Textové shrnutí</option>
        <option>Hlasové shrnutí (audio)</option>
      </select>
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
    <div class="config-section">
      <label class="config-label">Čas před schůzkou pro poskytnutí shrnutí</label>
      <select class="config-select">
        <option>15 minut</option>
        <option>30 minut</option>
        <option selected>1 hodina</option>
        <option>2 hodiny</option>
        <option>4 hodiny</option>
        <option>1 den</option>
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
      <label class="config-label" style="font-size:15px;font-weight:700;margin-bottom:12px">Kontrolované oblasti</label>
      <div class="config-toggle-group">
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Úplnost dokumentace</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="auditor-documentation" onchange="toggleNotesField(this)" checked>
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="auditor-documentation-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k kontrole..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Fakturační nesrovnalosti</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="auditor-billing" onchange="toggleNotesField(this)" checked>
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="auditor-billing-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k kontrole..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Chybějící podpisy</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="auditor-signatures" onchange="toggleNotesField(this)" checked>
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="auditor-signatures-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k kontrole..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Duplicitní záznamy</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="auditor-duplicates" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="auditor-duplicates-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k kontrole..." rows="2"></textarea>
          </div>
        </div>
        <div class="config-toggle-item">
          <label class="config-toggle-label">
            <span>Detekce vágních zpráv</span>
            <label class="toggle-switch">
              <input type="checkbox" data-toggle-id="auditor-vague-reports" onchange="toggleNotesField(this)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <div class="config-toggle-notes" id="auditor-vague-reports-notes" style="display:none;margin-top:8px">
            <textarea class="config-input" placeholder="Poznámky k detekci..." rows="2"></textarea>
          </div>
        </div>
      </div>
    </div>
    <div class="config-section">
      <label class="config-label" style="font-size:15px;font-weight:700;margin-bottom:12px">Upozornění o problémech</label>
      <div style="margin-bottom:12px">
        <label class="config-label">Komu upozornit</label>
        <div class="config-checkbox-group">
          <input type="checkbox" class="config-checkbox" checked>
          <span style="font-size:13px">Lékař</span>
        </div>
        <div class="config-checkbox-group">
          <input type="checkbox" class="config-checkbox" checked>
          <span style="font-size:13px">Supervizor</span>
        </div>
      </div>
      <div style="margin-bottom:12px">
        <label class="config-label">Kanál upozornění</label>
        <div class="config-checkbox-group">
          <input type="checkbox" class="config-checkbox" checked>
          <span style="font-size:13px">Aplikace</span>
        </div>
        <div class="config-checkbox-group">
          <input type="checkbox" class="config-checkbox" checked>
          <span style="font-size:13px">E-mail</span>
        </div>
      </div>
    </div>
  `
};

/**
 * Toggle notes field visibility
 */
function toggleNotesField(checkbox) {
  const toggleId = checkbox.getAttribute('data-toggle-id');
  const notesField = document.getElementById(toggleId + '-notes');
  if (notesField) {
    if (checkbox.checked) {
      notesField.style.display = 'block';
    } else {
      notesField.style.display = 'none';
    }
  }
}

/**
 * Fake login for Leo cloud service
 */
function fakeLeoLogin() {
  const select = document.getElementById('leo-target-system');
  const system = select?.value || 'onedrive';
  const systemNames = {
    'sharepoint': 'SharePoint',
    'onedrive': 'OneDrive',
    'googledrive': 'Google Drive'
  };
  const systemName = systemNames[system] || 'cloud service';
  
  // Simulate login process
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = '⏳ Přihlašování...';
  btn.disabled = true;
  
    setTimeout(() => {
      btn.textContent = '✅ Přihlášeno';
      btn.style.background = 'linear-gradient(135deg, #80deea, #4dd0e1, #26c6da)';
      btn.style.color = '#006064';
      alert(`Úspěšně přihlášeno do ${systemName}!`);
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 2000);
    }, 1500);
}

/**
 * Fake folder connection check for Leo
 */
function fakeLeoConnect() {
  const folderInput = document.getElementById('leo-folder-link');
  const folderLink = folderInput?.value.trim() || '';
  
  if (!folderLink) {
    alert('Zadejte prosím odkaz na složku.');
    return;
  }
  
  // Simulate connection check
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = '⏳ Kontroluji...';
  btn.disabled = true;
  
  setTimeout(() => {
    // Randomly succeed or fail for demo
    const success = Math.random() > 0.3;
    if (success) {
      btn.textContent = '✅ Propojeno';
      btn.style.background = 'linear-gradient(135deg, #80deea, #4dd0e1, #26c6da)';
      btn.style.color = '#006064';
      alert('Složka byla úspěšně propojena!');
    } else {
      btn.textContent = '❌ Chyba';
      btn.style.background = 'linear-gradient(135deg, #f44336, #e57373)';
      btn.style.color = '#fff';
      alert('Složka nebyla nalezena. Zkontrolujte odkaz a zkuste to znovu.');
    }
    
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 2000);
  }, 1500);
}

/**
 * Check max 5 critical emails selected
 */
function checkMaxCriticalEmails(checkbox) {
  const checked = document.querySelectorAll('#gabriel-critical-emails .critical-email:checked');
  if (checked.length > 5) {
    checkbox.checked = false;
    alert('Můžete vybrat maximálně 5 možností pro detekci kritických e-mailů.');
    const toggleId = checkbox.getAttribute('data-toggle-id');
    const notesField = document.getElementById(toggleId + '-notes');
    if (notesField) {
      notesField.style.display = 'none';
    }
  }
}

/**
 * Update Leo folder field placeholder based on target system
 */
function updateLeoFolderField() {
  const select = document.getElementById('leo-target-system');
  const folderInput = select?.parentElement?.nextElementSibling?.querySelector('.config-input');
  if (folderInput && select) {
    const system = select.value;
    if (system === 'sharepoint') {
      folderInput.placeholder = 'https://yourcompany.sharepoint.com/...';
    } else if (system === 'onedrive') {
      folderInput.placeholder = 'https://onedrive.live.com/...';
    } else if (system === 'googledrive') {
      folderInput.placeholder = 'https://drive.google.com/drive/folders/...';
    }
  }
}

/**
 * Show patient search modal for Nora
 */
function showNoraPatientSearch() {
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="modal-header">
      <div>
        <h4>🔍 Vyhledat pacienta - Nora</h4>
        <div style="margin-top:8px;font-size:13px;color:#666">Vyhledejte pacienta pro poskytnutí shrnutí na vyžádání</div>
      </div>
      <div class="modal-controls">
        <button class="modal-close" onclick="closeModal()" title="Zavřít">×</button>
      </div>
    </div>
    <div style="margin-top:16px">
      <div class="config-section">
        <label class="config-label">Vyhledat pacienta</label>
        <input type="text" class="config-input" id="noraPatientSearch" placeholder="Zadejte jméno, příjmení nebo rodné číslo..." style="margin-bottom:12px">
        <button class="config-apply-btn" onclick="searchNoraPatient()" style="width:100%">🔍 Vyhledat</button>
      </div>
      <div id="noraSearchResults" style="margin-top:16px;display:none">
        <div class="config-section">
          <label class="config-label">Výsledky vyhledávání</label>
          <div id="noraResultsList"></div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('show');
  
  // Allow Enter key to search
  document.getElementById('noraPatientSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchNoraPatient();
    }
  });
}

/**
 * Search for patient in Nora
 */
function searchNoraPatient() {
  const searchTerm = document.getElementById('noraPatientSearch').value.trim();
  if (!searchTerm) {
    alert('Zadejte prosím vyhledávací termín.');
    return;
  }
  
  // Simulate search (in real app, this would be an API call)
  const resultsDiv = document.getElementById('noraResultsList');
  const resultsContainer = document.getElementById('noraSearchResults');
  
  // Mock results
  const mockResults = [
    { name: 'Jan Novák', birthdate: '1985-03-15', insurance: 'VZP', id: '1' },
    { name: 'Petra Dvořáková', birthdate: '1990-07-22', insurance: 'OZP', id: '2' }
  ];
  
  if (mockResults.length > 0) {
    resultsContainer.style.display = 'block';
    resultsDiv.innerHTML = mockResults.map(patient => `
      <div style="padding:12px;margin-bottom:8px;border-radius:8px;background:linear-gradient(145deg,#e0f7fa,#fff);border:2px solid #e0f7fa;cursor:pointer" 
           onclick="generateNoraSummary('${patient.id}', '${patient.name}')">
        <div style="font-weight:700;color:#007c91;margin-bottom:4px">${patient.name}</div>
        <div style="font-size:12px;color:#666">Narození: ${patient.birthdate} • ${patient.insurance}</div>
      </div>
    `).join('');
  } else {
    resultsContainer.style.display = 'block';
    resultsDiv.innerHTML = '<div style="color:#888;padding:12px;text-align:center">Žádné výsledky nenalezeny</div>';
  }
}

/**
 * Generate summary for selected patient
 */
function generateNoraSummary(patientId, patientName) {
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="modal-header">
      <div>
        <h4>🧾 Shrnutí pacienta - ${patientName}</h4>
      </div>
      <div class="modal-controls">
        <button class="modal-close" onclick="closeModal()" title="Zavřít">×</button>
      </div>
    </div>
    <div style="margin-top:16px;padding:16px;background:linear-gradient(145deg,#e0f7fa,#fff);border-radius:12px">
      <div style="color:#666;margin-bottom:12px">Generování shrnutí...</div>
      <div style="font-size:14px;line-height:1.6">
        <p><strong>Pacient:</strong> ${patientName}</p>
        <p><strong>Pojišťovna:</strong> VZP</p>
        <p><strong>Shrnutí:</strong> Bez kazů, doporučena pravidelná hygiena</p>
        <p><strong>Poslední návštěva:</strong> 15.01.2024</p>
        <p><strong>Poznámky:</strong> Pacient je v dobrém stavu, žádné komplikace.</p>
      </div>
      <button class="config-apply-btn" onclick="closeModal()" style="width:100%;margin-top:16px">✅ Hotovo</button>
    </div>
  `;
}

/**
 * Event Listeners
 */

// Session persistence functions
function saveSessionToStorage() {
  if (appData.user_info && appData.session_token) {
    try {
      const sessionData = {
        user_id: appData.user_info.user_id,
        client_id: appData.user_info.client_id || 'client001',
        token: appData.session_token,
        timestamp: Date.now()
      };
      localStorage.setItem('dental_iq_session', JSON.stringify(sessionData));
      localStorage.setItem('dental_iq_session_token', appData.session_token);
    } catch (e) {
      console.error('Error saving session to storage:', e);
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Save session to localStorage FIRST (before anything else)
  if (appData.user_info && appData.user_info.user_id && appData.session_token) {
    saveSessionToStorage();
  }
  
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
  
  // Ensure handleLogout is available
  if (typeof handleLogout === 'function') {
    window.handleLogout = handleLogout;
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
  
  // Re-initialize toggle handlers for the new content
  setTimeout(() => {
    const toggles = contentDiv.querySelectorAll('input[type="checkbox"][data-toggle-id]');
    toggles.forEach(toggle => {
      const toggleId = toggle.getAttribute('data-toggle-id');
      const notesField = document.getElementById(toggleId + '-notes');
      if (notesField && toggle.checked) {
        notesField.style.display = 'block';
      }
    });
  }, 100);
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
 * Note: handleLogout is defined at the top of the file for immediate availability
 */

function openPersonalSettings() {
  alert('Osobní nastavení - tato funkce bude brzy k dispozici');
  document.getElementById('userMenu').classList.remove('show');
}

function openAdminPanel() {
  alert('Administrační panel - tato funkce bude brzy k dispozici');
  document.getElementById('userMenu').classList.remove('show');
}