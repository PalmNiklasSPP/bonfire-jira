// Bonfire - Dark Souls Victory Banner for Jira
// Content Script

(function() {
  'use strict';

  // Configuration
  const BANNER_DURATION = 4000; // 4 seconds display time
  const FADE_OUT_DURATION = 1000; // 1 second fade out

  // Sound settings
  let soundEnabled = true; // Can be controlled via popup in future
  let selectedSound = 'elden_ring_sound.mp3'; // Default sound file

  // Auto-detection settings
  let autoDetectEnabled = true;
  let columnMappings = [
    { columnName: 'Code Review', mainText: 'READY FOR REVIEW', subText: 'Code Awaits Inspection' },
    { columnName: 'Ready for Test', mainText: 'TESTING PHASE', subText: 'Quality Check Begins' },
    { columnName: 'Done', mainText: 'YOU DEFEATED', subText: 'Task Conquered' },
    { columnName: 'Closed', mainText: 'VICTORY ACHIEVED', subText: 'Epic Completed' }
  ];
  let observer = null;
  let isObserving = false;

  // Create and inject the victory banner overlay
  function createBannerOverlay() {
    // Check if overlay already exists
    if (document.getElementById('bonfire-victory-overlay')) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'bonfire-victory-overlay';
    overlay.innerHTML = `
      <div class="bonfire-backdrop"></div>
      <div class="bonfire-banner">
        <div class="bonfire-ornament"></div>
        <h1 class="bonfire-text-main" id="bonfire-main-text">VICTORY ACHIEVED</h1>
        <div class="bonfire-ornament"></div>
        <p class="bonfire-text-sub" id="bonfire-sub-text">Epic Completed</p>
      </div>
    `;

    document.body.appendChild(overlay);
    console.log('[Bonfire] Victory banner overlay created');
  }

  // Show the victory banner with custom text
  function showVictoryBanner(mainText = 'VICTORY ACHIEVED', subText = 'Epic Completed') {
    const overlay = document.getElementById('bonfire-victory-overlay');
    
    if (!overlay) {
      console.error('[Bonfire] Overlay not found, creating it now');
      createBannerOverlay();
      // Retry after creation
      setTimeout(() => showVictoryBanner(mainText, subText), 100);
      return;
    }

    // Update text content
    const mainTextElement = document.getElementById('bonfire-main-text');
    const subTextElement = document.getElementById('bonfire-sub-text');
    
    if (mainTextElement) mainTextElement.textContent = mainText;
    if (subTextElement) subTextElement.textContent = subText;

    // Show the banner
    overlay.classList.add('show');
    console.log('[Bonfire] Victory banner displayed:', mainText);

    // Play sound effect if enabled
    if (soundEnabled) {
      console.log('[Bonfire] Playing victory sound:', selectedSound);
      const soundUrl = chrome.runtime.getURL(`assets/${selectedSound}`);
      console.log('[Bonfire] Sound URL:', soundUrl);
      const audio = new Audio(soundUrl);
      audio.volume = 1.0; // 100% volume for testing
      audio.play().then(() => {
        console.log('[Bonfire] Sound started playing successfully');
      }).catch(err => {
        console.warn('[Bonfire] Could not play sound:', err);
      });
    }

    // Auto-hide after duration
    setTimeout(() => {
      hideBanner();
    }, BANNER_DURATION);
  }

  // Hide the banner
  function hideBanner() {
    const overlay = document.getElementById('bonfire-victory-overlay');
    if (overlay) {
      overlay.classList.remove('show');
      console.log('[Bonfire] Victory banner hidden');
    }
  }

  // Load settings from storage
  function loadSettings() {
    const defaultMappings = [
      { columnName: 'Code Review', mainText: 'READY FOR REVIEW', subText: 'Code Awaits Inspection' },
      { columnName: 'Ready for Test', mainText: 'TESTING PHASE', subText: 'Quality Check Begins' },
      { columnName: 'Done', mainText: 'YOU DEFEATED', subText: 'Task Conquered' }
    ];
    
    chrome.storage.sync.get(
      { autoDetectEnabled: true, selectedSound: 'elden_ring_sound.mp3', columnMappings: defaultMappings },
      (settings) => {
        console.log('[Bonfire] Raw settings from storage:', settings);
        autoDetectEnabled = settings.autoDetectEnabled;
        selectedSound = settings.selectedSound || 'elden_ring_sound.mp3';
        columnMappings = settings.columnMappings || defaultMappings;
        console.log('[Bonfire] selectedSound variable is now:', selectedSound);
        console.log('[Bonfire] Settings loaded:', { autoDetectEnabled, selectedSound, columnMappings });
        
        // Restart observer with new settings
        if (autoDetectEnabled) {
          startObserving();
        } else {
          stopObserving();
        }
      }
    );
  }

  // Find column mapping for a column element
  function getColumnMapping(columnEl) {
    const titleEl = columnEl.querySelector(
      '[data-testid="platform-board-kit.common.ui.column-header.editable-title.column-title.column-name"]'
    );
    if (!titleEl) return null;

    const columnName = titleEl.textContent.trim();
    return columnMappings.find(mapping => 
      mapping.columnName.toLowerCase() === columnName.toLowerCase()
    );
  }

  // Extract ticket ID from card element
  function extractTicketId(cardEl) {
    const id = cardEl.id;
    if (id && id.startsWith('card-')) {
      return id.replace('card-', '');
    }
    return null;
  }

  // Handle card added to column
  function handleCardAddedToColumn(cardEl, columnEl) {
    if (!autoDetectEnabled) return;
    
    const mapping = getColumnMapping(columnEl);
    if (mapping) {
      const ticketId = extractTicketId(cardEl);
      if (ticketId) {
        console.log('[Bonfire] Ticket moved to tracked column:', mapping.columnName, ticketId);
        // Replace {ticketId} placeholder in subText if present
        const subText = mapping.subText.includes('{ticketId}') 
          ? mapping.subText.replace('{ticketId}', ticketId)
          : `${mapping.subText} - ${ticketId}`;
        showVictoryBanner(mapping.mainText, subText);
      }
    }
  }

  // Start observing board for card movements
  function startObserving() {
    if (isObserving) {
      console.log('[Bonfire] Already observing');
      return;
    }

    // Check if we're on a board view
    const isBoardView = window.location.href.includes('/jira/software/') && 
                       (window.location.href.includes('/board/') || 
                        window.location.href.includes('/boards/'));
    
    if (!isBoardView) {
      console.log('[Bonfire] Not on board view, skipping observation');
      return;
    }

    // Wait for board to load
    const checkBoardReady = setInterval(() => {
      const columns = document.querySelectorAll(
        '[data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper"] ul'
      );

      if (columns.length > 0) {
        clearInterval(checkBoardReady);
        setupObserver(columns);
      }
    }, 500);

    // Stop checking after 10 seconds
    setTimeout(() => clearInterval(checkBoardReady), 10000);
  }

  // Setup MutationObserver on column lists
  function setupObserver(columnLists) {
    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;

          // Check if the added node contains a card
          const card = node.querySelector?.(
            '[data-testid="platform-board-kit.ui.card.card"]'
          );
          
          if (card) {
            const column = node.closest(
              '[data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper"]'
            );

            if (column) {
              handleCardAddedToColumn(card, column);
            }
          }
        }
      }
    });

    // Observe all column lists
    columnLists.forEach((ul) => {
      observer.observe(ul, { childList: true });
    });

    isObserving = true;
    console.log(`[Bonfire] Now observing ${columnLists.length} columns for card movements`);
  }

  // Stop observing
  function stopObserving() {
    if (observer) {
      observer.disconnect();
      observer = null;
      isObserving = false;
      console.log('[Bonfire] Stopped observing columns');
    }
  }

  // Test function - can be triggered manually
  window.bonfireTest = function(mainText, subText) {
    showVictoryBanner(mainText, subText);
  };

  // Listen for messages from popup or other extension components
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'showBanner') {
      showVictoryBanner(message.mainText, message.subText);
      sendResponse({ success: true });
    } else if (message.action === 'testBanner') {
      showVictoryBanner('YOU DEFEATED', 'The Task');
      sendResponse({ success: true });
    } else if (message.action === 'reloadSettings') {
      loadSettings();
      sendResponse({ success: true });
    }
    return true;
  });

  // Initialize on page load
  function init() {
    createBannerOverlay();
    console.log('[Bonfire] Extension initialized and ready');
    
    // Load settings and start observing
    loadSettings();
    
    // Add keyboard shortcut for testing (Ctrl+Shift+V)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        showVictoryBanner('YOU DEFEATED', 'The Jira Ticket');
      }
    });

    // Re-observe when navigating within Jira (SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        console.log('[Bonfire] URL changed, restarting observation');
        stopObserving();
        if (autoDetectEnabled) {
          setTimeout(() => startObserving(), 1000);
        }
      }
    }).observe(document, { subtree: true, childList: true });
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for future Jira event detection
  window.Bonfire = {
    showVictory: showVictoryBanner,
    hide: hideBanner,
    version: '1.0.0'
  };

  console.log('[Bonfire] Dark Souls Victory Extension loaded');
})();
