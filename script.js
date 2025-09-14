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
        try {
            // Try to use the external API first
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
        } catch (error) {
            // Fallback to local color generation if API fails
            console.log('API failed, using local color generation');
            return this.generateLocalColorSchemes(hexColor);
        }
    }
    
    generateLocalColorSchemes(hexColor) {
        const baseColor = this.hexToHsl(hexColor);
        const schemes = [
            {
                scheme: 'monochrome',
                colors: this.generateMonochromeScheme(baseColor, hexColor)
            },
            {
                scheme: 'analogic',
                colors: this.generateAnalogicScheme(baseColor, hexColor)
            },
            {
                scheme: 'complement',
                colors: this.generateComplementScheme(baseColor, hexColor)
            },
            {
                scheme: 'triad',
                colors: this.generateTriadScheme(baseColor, hexColor)
            },
            {
                scheme: 'quad',
                colors: this.generateQuadScheme(baseColor, hexColor)
            }
        ];
        
        return schemes;
    }
    
    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s: s * 100, l: l * 100 };
    }
    
    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
    
    generateMonochromeScheme(baseColor, originalHex) {
        const colors = [];
        for (let i = 0; i < 5; i++) {
            const lightness = Math.max(10, Math.min(90, baseColor.l + (i - 2) * 20));
            const hex = this.hslToHex(baseColor.h, baseColor.s, lightness);
            colors.push({
                hex: { value: hex },
                name: { value: this.generateColorName(hex) }
            });
        }
        return colors;
    }
    
    generateAnalogicScheme(baseColor, originalHex) {
        const colors = [];
        for (let i = 0; i < 5; i++) {
            const hue = (baseColor.h + (i - 2) * 30) % 360;
            const hex = this.hslToHex(hue, baseColor.s, baseColor.l);
            colors.push({
                hex: { value: hex },
                name: { value: this.generateColorName(hex) }
            });
        }
        return colors;
    }
    
    generateComplementScheme(baseColor, originalHex) {
        const colors = [];
        const complementHue = (baseColor.h + 180) % 360;
        
        // Base color variations
        for (let i = 0; i < 3; i++) {
            const lightness = Math.max(20, Math.min(80, baseColor.l + (i - 1) * 25));
            const hex = this.hslToHex(baseColor.h, baseColor.s, lightness);
            colors.push({
                hex: { value: hex },
                name: { value: this.generateColorName(hex) }
            });
        }
        
        // Complement variations
        for (let i = 0; i < 2; i++) {
            const lightness = Math.max(20, Math.min(80, baseColor.l + i * 20));
            const hex = this.hslToHex(complementHue, baseColor.s, lightness);
            colors.push({
                hex: { value: hex },
                name: { value: this.generateColorName(hex) }
            });
        }
        
        return colors;
    }
    
    generateTriadScheme(baseColor, originalHex) {
        const colors = [];
        const hues = [baseColor.h, (baseColor.h + 120) % 360, (baseColor.h + 240) % 360];
        
        for (let i = 0; i < 3; i++) {
            const hex = this.hslToHex(hues[i], baseColor.s, baseColor.l);
            colors.push({
                hex: { value: hex },
                name: { value: this.generateColorName(hex) }
            });
        }
        
        // Add variations
        for (let i = 0; i < 2; i++) {
            const hue = hues[i];
            const lightness = Math.max(20, Math.min(80, baseColor.l + (i === 0 ? 20 : -20)));
            const hex = this.hslToHex(hue, baseColor.s, lightness);
            colors.push({
                hex: { value: hex },
                name: { value: this.generateColorName(hex) }
            });
        }
        
        return colors;
    }
    
    generateQuadScheme(baseColor, originalHex) {
        const colors = [];
        const hues = [
            baseColor.h,
            (baseColor.h + 90) % 360,
            (baseColor.h + 180) % 360,
            (baseColor.h + 270) % 360
        ];
        
        for (let i = 0; i < 4; i++) {
            const hex = this.hslToHex(hues[i], baseColor.s, baseColor.l);
            colors.push({
                hex: { value: hex },
                name: { value: this.generateColorName(hex) }
            });
        }
        
        // Add one variation
        const hex = this.hslToHex(baseColor.h, Math.max(20, baseColor.s - 20), baseColor.l);
        colors.push({
            hex: { value: hex },
            name: { value: this.generateColorName(hex) }
        });
        
        return colors;
    }
    
    generateColorName(hex) {
        const colorNames = [
            'Deep', 'Light', 'Dark', 'Bright', 'Muted', 'Vibrant', 'Soft', 'Bold',
            'Warm', 'Cool', 'Rich', 'Pale', 'Intense', 'Subtle', 'Electric', 'Pastel'
        ];
        
        const hsl = this.hexToHsl(hex);
        let baseName = '';
        
        if (hsl.h >= 0 && hsl.h < 30) baseName = 'Red';
        else if (hsl.h >= 30 && hsl.h < 60) baseName = 'Orange';
        else if (hsl.h >= 60 && hsl.h < 120) baseName = 'Yellow';
        else if (hsl.h >= 120 && hsl.h < 180) baseName = 'Green';
        else if (hsl.h >= 180 && hsl.h < 240) baseName = 'Cyan';
        else if (hsl.h >= 240 && hsl.h < 300) baseName = 'Blue';
        else baseName = 'Purple';
        
        const adjective = colorNames[Math.floor(Math.random() * colorNames.length)];
        return `${adjective} ${baseName}`;
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