"""
HTML and JavaScript template for the UI
"""
import os
import base64

def get_html_template():
    """Returns the complete HTML template with embedded JavaScript"""
    
    # Read JavaScript file and encode it
    js_path = os.path.join(os.path.dirname(__file__), 'static', 'js', 'main.js')
    js_content = ""
    
    if os.path.exists(js_path):
        with open(js_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
    
    return '''
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dental IQ</title>
<style>
* { box-sizing: border-box; margin:0; padding:0 }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; background:#fff; color:#222; overflow-x: hidden }
.app { min-height:80vh; padding:10px 20px }
.header { display:flex; justify-content:space-between; align-items:center; padding:12px 20px }
.logo { font-weight:800; font-size:20px; color:#007c91; display:flex; align-items:center; gap:12px }
.logo-subtitle { font-weight:400; font-size:14px; color:#00acc1; font-style:italic }
.controls { display:flex; gap:10px; align-items:center }
.icon-btn { width:44px; height:44px; border-radius:50%; border:none; background:linear-gradient(135deg,#00acc1,#00e5ff); color:white; cursor:pointer; transition: all 0.3s ease }
.icon-btn:hover { transform: scale(1.1); box-shadow:0 8px 20px rgba(0,172,193,0.4) }
.icon-btn.ai-chat { 
  background:linear-gradient(135deg,#1e3a5f,#2d5a87); 
  box-shadow:0 4px 15px rgba(30,58,95,0.4);
  position: relative;
  animation: ai-pulse 2s ease-in-out infinite;
}
.icon-btn.ai-chat:hover { 
  transform: scale(1.15); 
  box-shadow:0 8px 25px rgba(30,58,95,0.6);
}
.icon-btn.ai-chat::before {
  content: 'AI';
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: 700;
  color: #1e3a5f;
}
@keyframes ai-pulse {
  0%, 100% { 
    box-shadow: 0 4px 15px rgba(30,58,95,0.4), 0 0 0 0 rgba(45,90,135,0.4); 
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 4px 25px rgba(30,58,95,0.6), 0 0 20px 5px rgba(45,90,135,0.3); 
    transform: scale(1.05);
  }
}
.sim-dropdown { 
  padding:10px 16px; 
  border-radius:16px; 
  border:2px solid #00acc1; 
  background:#fff; 
  color:#007c91; 
  font-size:13px; 
  cursor:pointer; 
  min-width:140px; 
  font-weight:600;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%23007c91' d='M7 10L2 5h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,172,193,0.1);
}
.sim-dropdown:hover {
  border-color: #00e5ff;
  box-shadow: 0 4px 12px rgba(0,172,193,0.2);
  transform: translateY(-1px);
}
.sim-dropdown:focus {
  outline: none;
  border-color: #00e5ff;
  box-shadow: 0 0 0 4px rgba(0,172,193,0.15), 0 4px 16px rgba(0,172,193,0.2);
}
.sim-dropdown option {
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  color: #007c91;
  font-weight: 500;
}
.sim-dropdown option:checked {
  background: linear-gradient(135deg, #b2ebf2, #80deea);
  color: #007c91;
  font-weight: 600;
}
.sim-dropdown option:hover {
  background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
  color: #007c91;
}
.main { display:flex; align-items:center; justify-content:center; padding:20px }
.tuner { position:relative; width:650px; height:650px }
.center { 
  position:absolute; left:50%; top:50%; width:200px; height:200px; 
  transform:translate(-50%,-50%); border-radius:50%; 
  display:flex; align-items:center; justify-content:center; font-size:50px; 
  background:linear-gradient(135deg,#00acc1,#00e5ff); 
  box-shadow:0 12px 40px rgba(0,172,193,0.35); cursor:pointer;
  transition: all 0.3s ease;
}
.center:hover {
  transform:translate(-50%,-50%) scale(1.1);
  box-shadow:0 16px 50px rgba(0,172,193,0.5), 0 0 30px rgba(0,229,255,0.4);
}
.agent { 
  position:absolute; width:120px; height:120px; border-radius:50%; 
  display:flex; align-items:center; justify-content:center; font-size:44px; 
  background:linear-gradient(135deg,#e0f7fa,#fff); 
  box-shadow:0 8px 25px rgba(0,172,193,0.15); cursor:pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}
.agent:hover {
  transform: scale(1.15);
  box-shadow:0 12px 35px rgba(0,172,193,0.3), 0 0 25px rgba(0,229,255,0.3);
}
.agent.selected {
  border: 4px solid #007c91;
}
.agent-name { position:absolute; bottom:-32px; left:50%; transform:translateX(-50%); font-size:13px; color:#007c91; font-weight:600 }
.agent.badge { border:4px solid #ff5252; background:linear-gradient(135deg,#ffebee,#fff) }
.agent.badge.selected { border:4px solid #007c91; }
.notification { position:absolute; top:-8px; right:-8px; width:32px; height:32px; border-radius:50%; background:#ff5252; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px }

.mini-kpi-popup {
  position: absolute;
  background: linear-gradient(145deg, #fff, #f8fcfd);
  padding: 8px 10px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,172,193,0.3);
  z-index: 900;
  display: none;
  opacity: 0;
  transform: scale(0.7) translateY(20px) rotate(-5deg);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
}
.mini-kpi-popup.show {
  display: flex;
  opacity: 1;
  transform: scale(1) translateY(0) rotate(0deg);
  animation: popupBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes popupBounce {
  0% {
    transform: scale(0.7) translateY(20px) rotate(-5deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) translateY(-5px) rotate(2deg);
  }
  100% {
    transform: scale(1) translateY(0) rotate(0deg);
    opacity: 1;
  }
}
.mini-kpi-popup .kpi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  min-width: 40px;
}
.mini-kpi-popup .kpi-icon {
  font-size: 14px;
}
.mini-kpi-popup .kpi-value {
  font-size: 11px;
  font-weight: 700;
  color: #007c91;
}

.agent-popup { 
  position:absolute; background:#fff; padding:16px; border-radius:12px; width:520px; 
  box-shadow:0 12px 40px rgba(0,172,193,0.3); z-index:1000; display:none;
  transition: all 0.3s ease;
}
.agent-popup.maximized {
  position: fixed !important;
  top: 20px !important;
  left: 20px !important;
  right: 20px !important;
  bottom: 20px !important;
  width: auto !important;
  height: auto !important;
  z-index: 2500;
}
.agent-popup.show { display:block }
.agent-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.popup-controls {
  display: flex;
  gap: 8px;
}
.popup-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: #e0f7fa;
  color: #007c91;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}
.popup-btn:hover {
  background: #00acc1;
  color: white;
  transform: scale(1.1);
}
.agent-popup h4 { margin-bottom:8px; color:#007c91; margin: 0; }
.agent-popup .kpis { display:flex; gap:6px; margin-bottom:8px }
.agent-popup .kpi { flex:1; padding:6px; border-radius:6px; background:linear-gradient(145deg,#e0f7fa,#fff); text-align:center }
.agent-popup table { 
  width:100%; 
  border-collapse:collapse; 
  margin-top:10px;
  display: block;
  max-height: 280px;
  overflow-y: auto;
  max-width: 100%;
  box-sizing: border-box;
}
.agent-popup table tbody {
  display: block;
  max-height: 240px;
  overflow-y: auto;
  width: 100%;
}
.agent-popup table thead,
.agent-popup table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}
.agent-popup thead { 
  position: sticky; 
  top: 0; 
  background: white;
  z-index: 1;
}
.agent-popup th { 
  padding:6px; 
  border-bottom:2px solid #00acc1; 
  font-size:11px; 
  text-align:left;
  font-weight: 700;
  color: #007c91;
}
.agent-popup td { 
  padding:6px; 
  border-bottom:1px solid #eef9fb; 
  font-size:12px;
}
.agent-popup .task-item { 
  padding: 10px; 
  margin-bottom: 8px; 
  border-radius: 8px; 
  background: linear-gradient(145deg, #fff5f5, #fff);
  border-left: 4px solid #ff5252;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.agent-popup .task-checkbox { 
  width: 20px; 
  height: 20px; 
  min-width: 20px;
  border: 2px solid #007c91; 
  border-radius: 4px; 
  cursor: pointer;
  margin-top: 2px;
}
.agent-popup .task-text { 
  flex: 1;
  font-size: 13px;
  line-height: 1.4;
}
.agent-popup .task-priority { 
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin-top: 4px;
}
.agent-popup .priority-high { background: #ffcdd2; color: #c62828; }
.agent-popup .priority-medium { background: #fff9c4; color: #f57f17; }
.agent-popup .priority-low { background: #e0f7fa; color: #00838f; }

/* Attention items with modern checkboxes */
.attention-item {
  margin-bottom: 12px;
  transition: all 0.3s ease;
}
.attention-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  cursor: pointer;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #f8fcfd);
  border: 2px solid #e0f7fa;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.attention-checkbox-label::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #00acc1, #00e5ff);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}
.attention-checkbox-label:hover {
  border-color: #00acc1;
  box-shadow: 0 4px 12px rgba(0,172,193,0.15);
  transform: translateY(-2px);
}
.attention-checkbox-label:hover::before {
  transform: scaleY(1);
}
.attention-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.attention-checkmark {
  position: relative;
  width: 24px;
  height: 24px;
  min-width: 24px;
  border: 2.5px solid #00acc1;
  border-radius: 6px;
  background: #fff;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  margin-top: 2px;
}
.attention-checkmark::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg) scale(0);
  transition: transform 0.2s ease 0.1s;
}
.attention-checkbox:checked + .attention-checkmark {
  background: linear-gradient(135deg, #00acc1, #00e5ff);
  border-color: #00acc1;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,172,193,0.3);
}
.attention-checkbox:checked + .attention-checkmark::after {
  transform: rotate(45deg) scale(1);
}
.attention-content {
  flex: 1;
  transition: all 0.3s ease;
}
.attention-patient {
  font-size: 15px;
  font-weight: 700;
  color: #007c91;
  margin-bottom: 6px;
  line-height: 1.4;
}
.attention-context {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
  font-weight: 500;
}
.attention-description {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;
  padding-top: 6px;
  border-top: 1px solid #e0f7fa;
  margin-top: 6px;
}
.attention-checkbox:checked ~ .attention-content .attention-patient {
  opacity: 0.6;
}
.attention-checkbox:checked ~ .attention-content .attention-context {
  opacity: 0.5;
}
.attention-checkbox:checked ~ .attention-content .attention-description {
  text-decoration: line-through;
  opacity: 0.7;
}
.attention-save-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #b0bec5, #cfd8dc);
  color: #78909c;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: not-allowed;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.attention-save-btn.enabled {
  background: linear-gradient(135deg, #00acc1, #00e5ff);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,172,193,0.3);
}
.attention-save-btn.enabled:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,172,193,0.4);
}
.attention-save-btn:disabled {
  opacity: 0.6;
}
.agent-popup .simulation-header {
  background: linear-gradient(135deg, #ff5252, #ff8a80);
  color: white;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-overlay.show {
  display: flex;
}
.modal-content {
  background: #fff;
  padding: 24px;
  border-radius: 20px;
  width: 620px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0,172,193,0.4), 0 0 0 1px rgba(0,172,193,0.1);
  position: relative;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}
.modal-content.maximized {
  width: 95vw !important;
  max-width: 95vw !important;
  height: 90vh !important;
  max-height: 90vh !important;
}
@keyframes modalIn {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(30px) rotateX(10deg);
    filter: blur(4px);
  }
  50% {
    transform: scale(1.02) translateY(-5px) rotateX(-2deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0) rotateX(0deg);
    filter: blur(0);
  }
}
.modal-content {
  animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-style: preserve-3d;
  perspective: 1000px;
}
.modal-content h4 { margin-bottom:12px; color:#007c91; font-size: 18px; }
.modal-content .kpis { display:flex; gap:8px; margin-bottom:12px }
.modal-content .kpi { flex:1; padding:10px; border-radius:8px; background:linear-gradient(145deg,#e0f7fa,#fff); text-align:center }
.modal-content .kpi div:first-child { font-size: 20px; font-weight: 700; color: #007c91; }
.modal-content .kpi div:last-child { font-size: 11px; color: #666; }
.modal-content table { 
  width:100%; 
  border-collapse:collapse; 
  margin-top:12px;
  display: block;
  max-height: 60vh;
  overflow-y: auto;
  max-width: 100%;
  box-sizing: border-box;
}
.modal-content table tbody {
  display: block;
  max-height: calc(60vh - 50px);
  overflow-y: auto;
  width: 100%;
}
.modal-content table thead,
.modal-content table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}
.modal-content thead { 
  position: sticky; 
  top: 0; 
  background: white;
  z-index: 1;
}
.modal-content th { 
  padding:8px; 
  border-bottom:2px solid #00acc1; 
  font-size:12px; 
  text-align:left;
  font-weight: 700;
  color: #007c91;
}
.modal-content td { 
  padding:8px; 
  border-bottom:1px solid #eef9fb; 
  font-size:13px;
}
.modal-close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #e0f7fa;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #007c91;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-close:hover {
  background: #ff5252;
  color: white;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.modal-controls {
  display: flex;
  gap: 8px;
}

.chat { 
  position:fixed; right:0px; bottom:60px; width:320px; height:450px; 
  background:#fff; border-radius:12px 0 0 0; box-shadow:-4px 0 20px rgba(0,0,0,0.15); 
  display:none; flex-direction:column 
}
.chat.show { display:flex }
.chat-head { background:linear-gradient(135deg,#1e3a5f,#2d5a87); color:#fff; padding:12px; border-radius:12px 12px 0 0; display:flex; justify-content:space-between }
.chat-body { padding:12px; overflow:auto; flex:1 }
.chat-input { border-top:1px solid #eef9fb; padding:10px; display:flex; gap:8px }
.chat-send-btn {
  background: linear-gradient(135deg, #1e3a5f, #2d5a87);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.chat-send-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30,58,95,0.3);
}
.chat-send-btn:active {
  transform: scale(0.95) translateY(0);
  box-shadow: 0 2px 6px rgba(30,58,95,0.2);
}
.chat-send-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}
.chat-send-btn.clicked::before {
  width: 300px;
  height: 300px;
}
@keyframes sendPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(30,58,95,0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(30,58,95,0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(30,58,95,0);
  }
}
.chat-send-btn.animating {
  animation: sendPulse 0.6s ease;
}
.typing-indicator { 
  display: inline-flex;
  padding: 10px 15px;
  border-radius: 12px;
  background: linear-gradient(135deg,#e0f8ff,#fff);
  gap: 4px;
  align-items: center;
}
.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1e3a5f;
  animation: typing 1.4s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
  30% { transform: translateY(-10px); opacity: 1; }
}
.config-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00acc1, #00e5ff);
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,172,193,0.3);
  transition: all 0.3s ease;
}
.config-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(0,172,193,0.4);
}
.config-popup {
  position: absolute;
  top: 70px;
  right: 20px;
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 12px 40px rgba(0,172,193,0.3);
  display: none;
  z-index: 1000;
  transition: all 0.3s ease;
}
.config-popup.maximized {
  position: fixed !important;
  top: 20px !important;
  left: 20px !important;
  right: 20px !important;
  bottom: 20px !important;
  width: auto !important;
  max-height: none !important;
  z-index: 2500;
}
.config-popup.show { display: block; }
.config-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.config-popup h3 {
  margin: 0;
  color: #007c91;
  font-size: 18px;
}
.config-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eef9fb;
}
.config-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
.config-label {
  font-size: 13px;
  font-weight: 600;
  color: #007c91;
  margin-bottom: 8px;
  display: block;
}
.config-input, .config-select {
  width: 100%;
  padding: 10px 16px;
  border: 2px solid #e0f7fa;
  border-radius: 16px;
  font-size: 13px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,172,193,0.08);
}
.config-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%23007c91' d='M7 10L2 5h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
  cursor: pointer;
}
.config-select:hover {
  border-color: #00acc1;
  box-shadow: 0 4px 12px rgba(0,172,193,0.15);
  transform: translateY(-1px);
}
.config-select:focus {
  outline: none;
  border-color: #00acc1;
  box-shadow: 0 0 0 4px rgba(0,172,193,0.15), 0 4px 16px rgba(0,172,193,0.2);
}
.config-select option {
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  color: #007c91;
  font-weight: 500;
}
.config-select option:checked {
  background: linear-gradient(135deg, #b2ebf2, #80deea);
  color: #007c91;
  font-weight: 600;
}
.config-select option:hover {
  background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
  color: #007c91;
}
.config-checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.config-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.config-action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.config-apply-btn {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, #ff9800, #ffc107);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.config-apply-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255,152,0,0.3);
}
.config-save-btn {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, #00acc1, #00e5ff);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.5;
  pointer-events: none;
}
.config-save-btn.enabled {
  opacity: 1;
  pointer-events: auto;
}
.config-save-btn.enabled:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,172,193,0.3);
}
.user-menu {
  position: absolute;
  top: 70px;
  right: 70px;
  width: 260px;
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 12px 40px rgba(0,172,193,0.3);
  display: none;
  z-index: 1001;
  overflow: hidden;
}
.user-menu.show { display: block; }
.user-menu-header {
  padding: 16px;
  background: linear-gradient(135deg, #00acc1, #00e5ff);
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.user-info {
  flex: 1;
}
.user-name {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 2px;
}
.user-role {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.user-menu-divider {
  height: 1px;
  background: #e0f7fa;
  margin: 0;
}
.user-menu-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  color: #007c91;
}
.user-menu-item:hover {
  background: #f0f9fa;
}
.user-menu-item.logout {
  color: #d32f2f;
}
.user-menu-item.logout:hover {
  background: #ffebee;
}
.menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}
.user-menu-btn {
  position: relative;
}
</style>
</head>
<body>
<div class="app">
  <div class="header">
    <div class="logo">
      <span>🦷 Dental IQ</span>
      <span class="logo-subtitle">Váš administrativní tým</span>
    </div>
    <div class="controls">
      <button class="icon-btn" id="simulateBtn" title="Simulace">▶️</button>
      <select class="sim-dropdown" id="agentSelect" style="display:none">
        <option value="">Vyberte agenta...</option>
        <option value="isabella">Isabella</option>
        <option value="leo">Leo</option>
        <option value="gabriel">Gabriel</option>
        <option value="nora">Nora</option>
        <option value="auditor">Auditor</option>
      </select>
      <button class="config-btn" id="configBtn" title="Konfigurace agentů">⚙️</button>
      <button class="icon-btn user-menu-btn" id="userMenuBtn" title="Uživatelské menu">👤</button>
      <button class="icon-btn ai-chat" onclick="toggleChat()" title="Axel">💬</button>
      
      <!-- User menu dropdown -->
      <div class="user-menu" id="userMenu">
        <div class="user-menu-header">
          <div class="user-avatar">👤</div>
          <div class="user-info">
            <div class="user-name" id="userName"></div>
            <div class="user-role" id="userRole"></div>
          </div>
        </div>
        <div class="user-menu-divider"></div>
        <div class="user-menu-item" onclick="openPersonalSettings()">
          <span class="menu-icon">⚙️</span>
          <span>Osobní nastavení</span>
        </div>
        <div class="user-menu-item" id="adminPanelItem" onclick="openAdminPanel()" style="display:none">
          <span class="menu-icon">🛡️</span>
          <span>Administrační panel</span>
        </div>
        <div class="user-menu-divider"></div>
        <div class="user-menu-item logout" onclick="handleLogout()">
          <span class="menu-icon">🚪</span>
          <span>Odhlásit se</span>
        </div>
      </div>
    </div>
  </div>
  
  <div class="config-popup" id="configPopup">
    <div class="config-popup-header">
      <h3>⚙️ Konfigurace agentů</h3>
      <div class="popup-controls">
        <button class="popup-btn" onclick="toggleMaximizeConfig()" title="Maximalizovat/Obnovit">⛶</button>
        <button class="popup-btn" onclick="closeConfigPopup()" title="Zavřít">×</button>
      </div>
    </div>
    
    <div class="config-section">
      <label class="config-label">Vyberte agenta</label>
      <select class="config-select" id="configAgentSelect">
        <option value="isabella">Isabella - Recepční na telefonu</option>
        <option value="leo">Leo - Příprava karet pacientů</option>
        <option value="gabriel">Gabriel - Kontrola e-mailů</option>
        <option value="nora">Nora - Shrnutí pacienta</option>
        <option value="auditor">Auditor - Kontrola záznamů</option>
      </select>
    </div>
    
    <div id="configContent"></div>
    
    <div class="config-action-buttons">
      <button class="config-apply-btn" onclick="applyConfig()">⚡ Použít</button>
      <button class="config-save-btn" onclick="saveConfig()">💾 Uložit nastavení</button>
    </div>
  </div>
  
  <div class="main">
    <div class="tuner" id="tuner">
      <div class="center" id="center">🦷</div>
      <div id="agentsRoot"></div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="modalOverlay">
  <div class="modal-content" id="modalContent" style="position:relative;">
    <div id="modalBody"></div>
  </div>
</div>

<div class="chat" id="chatBox">
  <div class="chat-head"><div>🤖 Axel</div><div><button onclick="toggleChat()" style="background:none;border:none;color:#fff;font-weight:700;cursor:pointer">✕</button></div></div>
  <div class="chat-body" id="chatBody"></div>
  <div class="chat-input">
    <input id="chatInput" placeholder="Zadejte zprávu..." style="flex:1;padding:8px;border-radius:8px;border:1px solid #eef9fb">
    <button id="chatSendBtn" onclick="sendChat()" class="chat-send-btn">Send</button>
  </div>
</div>

<script>
// Inject app data into global scope
window.APP_DATA = __PAYLOAD__;
</script>
<script>
''' + js_content + '''
</script>
</body>
</html>
'''