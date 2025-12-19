# Bonfire - Dark Souls Victory for Jira

A Chrome extension that adds epic Dark Souls-style victory banners to your Jira workflow, making task completion feel truly legendary.

## Features

- 🔥 **Epic Victory Banners** - Dark Souls-inspired overlay with golden text and dramatic animations
- ✨ **Beautiful Visual Effects** - Radial vignette backdrop, glowing text, and smooth animations
- ⌨️ **Quick Test Shortcut** - Press `Ctrl+Shift+V` to trigger the banner anytime
- 🎮 **Multiple Banner Styles** - Different victory messages for various achievements
- 🎯 **Jira Integration Ready** - Works on all Jira Cloud and Server instances

## Installation

### For Development/Testing:

1. **Clone or download** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable "Developer mode"** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the `bonfire-jira` folder
5. **Navigate to any Jira page** to see the extension in action

### Generate Icons (Optional):

The extension needs icon files. To generate them:
1. Open `icons/generate-icons.html` in your browser
2. Click each "Download" link to save the icons
3. Place them in the `icons/` folder as `icon16.png`, `icon48.png`, and `icon128.png`

## Usage

### Manual Testing:

1. **Extension Popup**: Click the Bonfire icon in your browser toolbar and choose a test banner
2. **Keyboard Shortcut**: Press `Ctrl+Shift+V` while on any Jira page
3. **Console Command**: Open DevTools console and type: `window.bonfireTest('YOUR TEXT', 'Subtitle')`

### Banner Display:

The banner will:
- Fade in with a dramatic animation
- Display golden glowing text with Dark Souls styling
- Auto-dismiss after 4 seconds
- Show ornamental dividers above and below the main text

## Project Structure

```
bonfire-jira/
├── manifest.json       # Extension configuration
├── content.js          # Main script injected into Jira pages
├── styles.css          # Dark Souls-themed banner styles
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── icons/              # Extension icons
│   ├── generate-icons.html
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

## Customization

### Change Banner Text:

Edit the default messages in `content.js`:
```javascript
showVictoryBanner('YOUR CUSTOM TEXT', 'Your Subtitle');
```

### Modify Visual Style:

Edit `styles.css` to customize:
- Colors (search for `#f4e4c1` and `#ffd700`)
- Font sizes (`.bonfire-text-main` and `.bonfire-text-sub`)
- Animation timing and effects
- Glow intensity

### Add Sound Effects:

1. Place Dark Souls sound files in a `sounds/` folder
2. Update the banner display function in `content.js`:
```javascript
const audio = new Audio(chrome.runtime.getURL('sounds/victory.mp3'));
audio.play();
```

## Future Enhancements

- 🔊 Dark Souls sound effect integration
- 🎯 Automatic trigger on Jira events (ticket closed, epic completed, etc.)
- ⚙️ Customizable settings and preferences
- 🎨 Multiple banner themes
- 📊 Achievement tracking and statistics

## Technical Details

- **Manifest Version**: 3
- **Permissions**: Active tab access for Jira domains
- **Content Script**: Injected on all Jira pages
- **Browser Compatibility**: Chrome, Edge, Brave (Chromium-based browsers)

## Troubleshooting

**Banner not showing?**
- Ensure you're on a Jira page (`*.atlassian.net` or `jira.*`)
- Check browser console for error messages
- Verify the extension is enabled in `chrome://extensions/`

**Icons missing?**
- Generate icons using `icons/generate-icons.html`
- Or use placeholder images temporarily

## License

This is a fan project inspired by Dark Souls. All Dark Souls trademarks and copyrights belong to FromSoftware and Bandai Namco.

## Credits

Created with passion for both Jira productivity and Dark Souls epicness! 🔥

---

**Praise the Sun!** ☀️
