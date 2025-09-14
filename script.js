class ColorSchemeGenerator {
    constructor() {
        this.colorPicker = document.getElementById('colorPicker');
        this.generateBtn = document.getElementById('generateBtn');
        this.colorSchemeContainer = document.getElementById('colorSchemeContainer');
        
        this.initEventListeners();
        this.generateColorScheme(); // Generate initial scheme
    }
    
    initEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateColorScheme());
        this.colorPicker.addEventListener('change', () => this.generateColorScheme());
    }
    
    async generateColorScheme() {
        const selectedColor = this.colorPicker.value.replace('#', '');
        
        try {
            this.showLoading();
            const schemes = await this.fetchColorSchemes(selectedColor);
            this.displayColorSchemes(schemes);
        } catch (error) {
            this.showError('Failed to generate color scheme. Please try again.');
            console.error('Error generating color scheme:', error);
        }
    }
    
    async fetchColorSchemes(hexColor) {
        const schemes = ['monochrome', 'analogic', 'complement', 'triad', 'quad'];
        const promises = schemes.map(scheme => 
            fetch(`https://www.thecolorapi.com/scheme?hex=${hexColor}&mode=${scheme}&count=5`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => ({
                    scheme: scheme,
                    colors: data.colors
                }))
        );
        
        const results = await Promise.all(promises);
        return results;
    }
    
    displayColorSchemes(schemes) {
        this.colorSchemeContainer.innerHTML = '';
        
        schemes.forEach(schemeData => {
            const schemeSection = this.createSchemeSection(schemeData.scheme, schemeData.colors);
            this.colorSchemeContainer.appendChild(schemeSection);
        });
    }
    
    createSchemeSection(schemeName, colors) {
        const section = document.createElement('div');
        section.className = 'scheme-section';
        
        const title = document.createElement('h3');
        title.textContent = this.formatSchemeName(schemeName);
        title.className = 'scheme-title';
        section.appendChild(title);
        
        const colorRow = document.createElement('div');
        colorRow.className = 'color-row';
        
        colors.forEach(color => {
            const colorCard = this.createColorCard(color);
            colorRow.appendChild(colorCard);
        });
        
        section.appendChild(colorRow);
        return section;
    }
    
    createColorCard(color) {
        const card = document.createElement('div');
        card.className = 'color-card';
        card.addEventListener('click', () => this.copyToClipboard(color.hex.value));
        
        const preview = document.createElement('div');
        preview.className = 'color-preview';
        preview.style.backgroundColor = color.hex.value;
        
        const info = document.createElement('div');
        info.className = 'color-info';
        
        const hex = document.createElement('div');
        hex.className = 'color-hex';
        hex.textContent = color.hex.value;
        
        const name = document.createElement('div');
        name.className = 'color-name';
        name.textContent = color.name.value;
        
        info.appendChild(hex);
        info.appendChild(name);
        card.appendChild(preview);
        card.appendChild(info);
        
        return card;
    }
    
    formatSchemeName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    async copyToClipboard(hexCode) {
        try {
            await navigator.clipboard.writeText(hexCode);
            this.showSuccessMessage(`Copied ${hexCode} to clipboard!`);
        } catch (error) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(hexCode);
        }
    }
    
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccessMessage(`Copied ${text} to clipboard!`);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            this.showError('Failed to copy to clipboard');
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    showSuccessMessage(message) {
        // Remove existing success message if any
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        // Trigger animation
        setTimeout(() => messageDiv.classList.add('show'), 100);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
    
    showLoading() {
        this.colorSchemeContainer.innerHTML = '<div class="loading">Generating color schemes...</div>';
    }
    
    showError(message) {
        this.colorSchemeContainer.innerHTML = `<div class="error">${message}</div>`;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ColorSchemeGenerator();
});