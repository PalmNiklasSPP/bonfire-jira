// Popup script for manual testing and settings

// Default settings
const DEFAULT_SETTINGS = {
  autoDetectEnabled: true,
  selectedSound: 'elden_ring_sound.mp3',
  columnMappings: [
    { columnName: 'Code Review', mainText: 'READY FOR REVIEW', subText: 'Code Awaits Inspection' },
    { columnName: 'Ready for Test', mainText: 'TESTING PHASE', subText: 'Quality Check Begins' },
    { columnName: 'Done', mainText: 'YOU DEFEATED', subText: 'Task Conquered' },
    { columnName: 'Closed', mainText: 'VICTORY ACHIEVED', subText: 'Epic Completed' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const testBtn1 = document.getElementById('testBtn1');
  const testBtn2 = document.getElementById('testBtn2');
  const testBtn3 = document.getElementById('testBtn3');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const addMappingBtn = document.getElementById('addMapping');
  const autoDetectToggle = document.getElementById('autoDetectToggle');
  const soundSelect = document.getElementById('soundSelect');
  const previewSoundBtn = document.getElementById('previewSound');
  const columnMappingsContainer = document.getElementById('columnMappings');
  const status = document.getElementById('status');

  console.log('[Bonfire Popup] Elements found:', {
    soundSelect: !!soundSelect,
    saveSettingsBtn: !!saveSettingsBtn,
    previewSoundBtn: !!previewSoundBtn
  });

  // Create a mapping item element
  function createMappingElement(mapping, index) {
    const div = document.createElement('div');
    div.className = 'mapping-item';
    div.dataset.index = index;
    div.innerHTML = `
      <div class="mapping-header">
        <span class="mapping-title">Trigger #${index + 1}</span>
        <button class="remove-btn" data-index="${index}">✕ Remove</button>
      </div>
      <input type="text" class="column-name" placeholder="Column name (e.g., Code Review)" value="${mapping.columnName}">
      <input type="text" class="main-text" placeholder="Main text (e.g., READY FOR REVIEW)" value="${mapping.mainText}">
      <input type="text" class="sub-text" placeholder="Sub text (e.g., Code Awaits Inspection)" value="${mapping.subText}">
    `;
    return div;
  }

  // Render all mappings
  function renderMappings(mappings) {
    columnMappingsContainer.innerHTML = '';
    mappings.forEach((mapping, index) => {
      const element = createMappingElement(mapping, index);
      columnMappingsContainer.appendChild(element);
    });

    // Add remove button listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        removeMappingAtIndex(index);
      });
    });
  }

  // Get current mappings from UI
  function getCurrentMappings() {
    const mappings = [];
    document.querySelectorAll('.mapping-item').forEach(item => {
      const columnName = item.querySelector('.column-name').value.trim();
      const mainText = item.querySelector('.main-text').value.trim();
      const subText = item.querySelector('.sub-text').value.trim();
      
      if (columnName && mainText && subText) {
        mappings.push({ columnName, mainText, subText });
      }
    });
    return mappings;
  }

  // Remove mapping at index
  function removeMappingAtIndex(index) {
    const mappings = getCurrentMappings();
    mappings.splice(index, 1);
    renderMappings(mappings);
  }

  // Add new mapping
  function addMapping() {
    const mappings = getCurrentMappings();
    mappings.push({ columnName: '', mainText: '', subText: '' });
    renderMappings(mappings);
  }

  // Load settings
  function loadSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
      console.log('[Bonfire Popup] Loaded settings from storage:', settings);
      autoDetectToggle.checked = settings.autoDetectEnabled;
      soundSelect.value = settings.selectedSound;
      console.log('[Bonfire Popup] Sound selector set to:', soundSelect.value);
      renderMappings(settings.columnMappings);
    });
  }

  // Save settings
  function saveSettings() {
    const mappings = getCurrentMappings();
    
    if (mappings.length === 0) {
      status.textContent = 'Please add at least one column trigger';
      status.style.color = '#ff4444';
      showStatus();
      return;
    }

    const settings = {
      autoDetectEnabled: autoDetectToggle.checked,
      selectedSound: soundSelect.value,
      columnMappings: mappings
    };

    console.log('[Bonfire Popup] Saving settings:', settings);

    chrome.storage.sync.set(settings, () => {
      console.log('[Bonfire Popup] Settings saved successfully');
      
      // Notify content script to reload settings
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'reloadSettings' }, (response) => {
            status.textContent = 'Settings saved!';
            status.style.color = '#4CAF50';
            showStatus();
          });
        } else {
          status.textContent = 'Settings saved!';
          status.style.color = '#4CAF50';
          showStatus();
        }
      });
    });
  }

  // Load settings on popup open
  loadSettings();

  function showStatus() {
    status.classList.add('show');
    setTimeout(() => {
      status.classList.remove('show');
    }, 2000);
  }

  function sendBannerMessage(mainText, subText) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'showBanner', mainText, subText },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error:', chrome.runtime.lastError);
              status.textContent = 'Error: Make sure you\'re on a Jira page!';
              status.style.color = '#ff4444';
              showStatus();
            } else {
              showStatus();
            }
          }
        );
      }
    });
  }

  testBtn1.addEventListener('click', () => {
    sendBannerMessage('VICTORY ACHIEVED', 'Epic Completed');
  });

  testBtn2.addEventListener('click', () => {
    sendBannerMessage('YOU DEFEATED', 'The Jira Ticket');
  });

  testBtn3.addEventListener('click', () => {
    sendBannerMessage('EPIC COMPLETED', 'Task Accomplished');
  });

  // Preview sound
  function previewSound() {
    const selectedSound = soundSelect.value;
    const soundUrl = chrome.runtime.getURL(`assets/${selectedSound}`);
    const audio = new Audio(soundUrl);
    audio.volume = 0.5;
    audio.play().catch(err => {
      console.warn('[Bonfire] Could not play preview sound:', err);
      status.textContent = 'Could not play sound';
      status.style.color = '#ff4444';
      showStatus();
    });
  }

  saveSettingsBtn.addEventListener('click', saveSettings);
  addMappingBtn.addEventListener('click', addMapping);
  previewSoundBtn.addEventListener('click', previewSound);
});
