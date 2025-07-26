// ThemeGenerator class handles all the logic for theme customization
class ThemeGenerator {
    constructor() {
        // Set default theme values
        this.currentTheme = this.getDefaultTheme();
        this.googleFonts = [];
        this.init(); // Initialize the theme system
    }

    // Default theme values
    getDefaultTheme() {
        return {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            accentColor: '#ff6b6b',
            backgroundColor: '#ffffff',
            textColor: '#333333',
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            lineHeight: 1.5,
            borderRadius: 8,
            spacing: 1,
            shadowIntensity: 0.1
        };
    }

    // Initialize: load fonts, setup events, and load saved/shared theme
    async init() {
        await this.loadGoogleFonts();
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.loadFromURL();
        this.updatePreview();
    }

    // Load Google Fonts (fallback if API fails)
    async loadGoogleFonts() {
        try {
            const response = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyDummyKey&sort=popularity');
            this.googleFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro', 'Nunito', 'Raleway', 'Ubuntu'];
            this.populateFontSelect();
        } catch (error) {
            console.log('Using fallback fonts');
            this.googleFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro', 'Nunito'];
            this.populateFontSelect();
        }
    }

    // Add fonts to dropdown selector
    populateFontSelect() {
        const fontSelect = document.getElementById('fontFamily');
        fontSelect.innerHTML = '';
        this.googleFonts.forEach(font => {
            const option = document.createElement('option');
            option.value = `${font}, sans-serif`;
            option.textContent = font;
            fontSelect.appendChild(option);
        });
    }

    // Setup all event listeners for inputs and buttons
    setupEventListeners() {
        // Color pickers
        ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor'].forEach(id => {
            this.setupColorInput(id);
        });

        // Range sliders
        ['fontSize', 'lineHeight', 'borderRadius', 'spacing', 'shadowIntensity'].forEach(id => {
            const unit = id === 'fontSize' ? 'px' : id === 'borderRadius' ? 'px' : id === 'spacing' ? 'x' : '';
            this.setupRangeInput(id, unit);
        });

        // Font dropdown
        document.getElementById('fontFamily').addEventListener('change', (e) => {
            this.currentTheme.fontFamily = e.target.value;
            this.loadGoogleFont(e.target.value.split(',')[0]);
            this.updatePreview();
            this.saveToLocalStorage();
        });

        // Action buttons
        document.getElementById('exportBtn').addEventListener('click', () => this.exportCSS());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareTheme());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveTheme());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadTheme());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetTheme());

        // Preview mode buttons
        document.getElementById('mobileView').addEventListener('click', () => this.setPreviewMode('mobile'));
        document.getElementById('tabletView').addEventListener('click', () => this.setPreviewMode('tablet'));
        document.getElementById('desktopView').addEventListener('click', () => this.setPreviewMode('desktop'));

        // Modal close and copy
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('copyUrlBtn').addEventListener('click', () => this.copyShareUrl());

        // Close modal when clicking outside the content
        document.getElementById('shareModal').addEventListener('click', (e) => {
            if (e.target.id === 'shareModal') {
                this.closeModal();
            }
        });
    }

    // Setup for color input and its linked text input
    setupColorInput(colorId) {
        const colorInput = document.getElementById(colorId);
        const textInput = document.getElementById(colorId + 'Text');

        // When color is selected
        colorInput.addEventListener('input', (e) => {
            const value = e.target.value;
            textInput.value = value;
            this.currentTheme[colorId] = value;
            this.updatePreview();
            this.saveToLocalStorage();
        });

        // When hex code is typed manually
        textInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (this.isValidColor(value)) {
                colorInput.value = value;
                this.currentTheme[colorId] = value;
                this.updatePreview();
                this.saveToLocalStorage();
            }
        });
    }

    // Setup for range sliders like font size, spacing, etc.
    setupRangeInput(inputId, unit) {
        const input = document.getElementById(inputId);
        const valueSpan = document.getElementById(inputId + 'Value');

        input.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            valueSpan.textContent = value + unit;
            this.currentTheme[inputId] = value;
            this.updatePreview();
            this.saveToLocalStorage();
        });
    }

    // Check if a string is a valid color
    isValidColor(color) {
        const style = new Option().style;
        style.color = color;
        return style.color !== '';
    }

    // Dynamically load a Google Font when selected
    async loadGoogleFont(fontName) {
        const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
        const existingLink = document.querySelector(`link[href*="${fontName.replace(' ', '+')}"]`);
        if (existingLink) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
    }

    // Apply all theme settings to CSS variables
    updatePreview() {
        const root = document.documentElement;
        const theme = this.currentTheme;

        root.style.setProperty('--primary-color', theme.primaryColor);
        root.style.setProperty('--secondary-color', theme.secondaryColor);
        root.style.setProperty('--accent-color', theme.accentColor);
        root.style.setProperty('--background-color', theme.backgroundColor);
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--font-family', theme.fontFamily);
        root.style.setProperty('--font-size', theme.fontSize + 'px');
        root.style.setProperty('--line-height', theme.lineHeight);
        root.style.setProperty('--border-radius', theme.borderRadius + 'px');
        root.style.setProperty('--spacing', theme.spacing);
        root.style.setProperty('--shadow-intensity', theme.shadowIntensity);

        this.updateFormValues(); // Sync UI inputs
    }

    // Sync all input values with current theme
    updateFormValues() {
        const t = this.currentTheme;
        document.getElementById('primaryColor').value = t.primaryColor;
        document.getElementById('primaryColorText').value = t.primaryColor;
        document.getElementById('secondaryColor').value = t.secondaryColor;
        document.getElementById('secondaryColorText').value = t.secondaryColor;
        document.getElementById('accentColor').value = t.accentColor;
        document.getElementById('accentColorText').value = t.accentColor;
        document.getElementById('backgroundColor').value = t.backgroundColor;
        document.getElementById('backgroundColorText').value = t.backgroundColor;
        document.getElementById('textColor').value = t.textColor;
        document.getElementById('textColorText').value = t.textColor;

        document.getElementById('fontFamily').value = t.fontFamily;
        document.getElementById('fontSize').value = t.fontSize;
        document.getElementById('fontSizeValue').textContent = t.fontSize + 'px';
        document.getElementById('lineHeight').value = t.lineHeight;
        document.getElementById('lineHeightValue').textContent = t.lineHeight;
        document.getElementById('borderRadius').value = t.borderRadius;
        document.getElementById('borderRadiusValue').textContent = t.borderRadius + 'px';
        document.getElementById('spacing').value = t.spacing;
        document.getElementById('spacingValue').textContent = t.spacing + 'x';
        document.getElementById('shadowIntensity').value = t.shadowIntensity;
        document.getElementById('shadowIntensityValue').textContent = t.shadowIntensity;
    }

    // Export the current theme as a downloadable CSS file
    exportCSS() {
        const css = this.generateCSS();
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-theme.css';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Theme exported successfully!');
    }

    // Generate full CSS from the current theme
    generateCSS() {
        const t = this.currentTheme;
        return `:root {
  --primary-color: ${t.primaryColor};
  --secondary-color: ${t.secondaryColor};
  --accent-color: ${t.accentColor};
  --background-color: ${t.backgroundColor};
  --text-color: ${t.textColor};
  --font-family: ${t.fontFamily};
  --font-size: ${t.fontSize}px;
  --line-height: ${t.lineHeight};
  --border-radius: ${t.borderRadius}px;
  --spacing: ${t.spacing};
  --shadow-intensity: ${t.shadowIntensity};
}`;
    }

    // Share theme as a URL (encoded in query string)
    shareTheme() {
        const themeData = btoa(JSON.stringify(this.currentTheme));
        const shareUrl = `${window.location.origin}${window.location.pathname}?theme=${themeData}`;
        document.getElementById('shareUrl').value = shareUrl;
        document.getElementById('shareModal').classList.add('show');
    }

    // Copy the share URL to clipboard
    copyShareUrl() {
        const shareUrl = document.getElementById('shareUrl');
        shareUrl.select();
        shareUrl.setSelectionRange(0, 99999);

        try {
            document.execCommand('copy');
            this.showToast('URL copied to clipboard!');
        } catch (err) {
            navigator.clipboard.writeText(shareUrl.value).then(() => {
                this.showToast('URL copied to clipboard!');
            }).catch(() => {
                this.showToast('Failed to copy URL', 'error');
            });
        }
    }

    // Close the share modal
    closeModal() {
        document.getElementById('shareModal').classList.remove('show');
    }

    // Save the current theme to localStorage
    saveTheme() {
        this.saveToLocalStorage();
        this.showToast('Theme saved locally!');
    }

    // Load theme from localStorage
    loadTheme() {
        const saved = this.loadFromLocalStorage();
        if (saved) {
            this.showToast('Theme loaded from local storage!');
        } else {
            this.showToast('No saved theme found', 'error');
        }
    }

    // Reset theme to default
    resetTheme() {
        this.currentTheme = this.getDefaultTheme();
        this.updatePreview();
        this.saveToLocalStorage();
        this.showToast('Theme reset to defaults!');
    }

    // Save to localStorage
    saveToLocalStorage() {
        localStorage.setItem('cssThemeGenerator', JSON.stringify(this.currentTheme));
    }

    // Load from localStorage
    loadFromLocalStorage() {
        const saved = localStorage.getItem('cssThemeGenerator');
        if (saved) {
            try {
                this.currentTheme = { ...this.getDefaultTheme(), ...JSON.parse(saved) };
                this.updatePreview();
                return true;
            } catch (error) {
                console.error('Error loading from localStorage:', error);
            }
        }
        return false;
    }

    // Load theme if it's shared in the URL
    loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const themeData = urlParams.get('theme');

        if (themeData) {
            try {
                const decodedTheme = JSON.parse(atob(themeData));
                this.currentTheme = { ...this.getDefaultTheme(), ...decodedTheme };
                this.updatePreview();
                this.showToast('Theme loaded from shared URL!');
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Error loading theme from URL:', error);
                this.showToast('Invalid theme URL', 'error');
            }
        }
    }

    // Set preview mode (mobile/tablet/desktop)
    setPreviewMode(mode) {
        const container = document.getElementById('previewContainer');
        const buttons = document.querySelectorAll('.view-btn');

        container.classList.remove('mobile', 'tablet', 'desktop');
        buttons.forEach(btn => btn.classList.remove('active'));

        if (mode !== 'desktop') {
            container.classList.add(mode);
        }

        document.getElementById(mode + 'View').classList.add('active');
    }

    // Show toast message
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        document.getElementById('toastContainer').appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Start the app once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ThemeGenerator();
});
