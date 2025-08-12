// Import WebLLM from CDN
import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

class GrammarCorrectionApp {
    constructor() {
        this.engine = null;
        this.isInitialized = false;
        this.isInitializing = false;
        this.modelId = "SmolLM2-360M-Instruct-q4f32_1-MLC";
        this.initializeElements();
        this.attachEventListeners();
        this.loadSampleTexts();
        this.checkWebGPUSupport();
    }

    initializeElements() {
        this.statusDiv = document.getElementById('status');
        this.initializeBtn = document.getElementById('initializeBtn');
        this.correctBtn = document.getElementById('correctBtn');
        this.form = document.getElementById('correctionForm');
        this.localeSelect = document.getElementById('locale');
        this.noisyStringTextarea = document.getElementById('noisyString');
        this.resultsDiv = document.getElementById('results');
        this.correctionsDiv = document.getElementById('corrections');
    }

    attachEventListeners() {
        this.initializeBtn.addEventListener('click', () => this.initializeWebLLM());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add some sample texts for different languages
        this.localeSelect.addEventListener('change', () => this.updateSampleText());
    }

    loadSampleTexts() {
        this.sampleTexts = {
            'en': 'I are going to the store and buy some apple.',
            'es': 'Yo va a la tienda y comprar algunas manzana.',
            'fr': 'Je va au magasin et acheter quelques pomme.',
            'de': 'Ich gehe zu der Geschäft und kaufe einige Apfel.',
            'it': 'Io va al negozio e comprare alcune mela.',
            'pt': 'Eu vai para a loja e comprar algumas maçã.',
            'ru': 'Я идти в магазин и покупать некоторые яблоко.',
            'ja': '私は店に行くと、いくつかのりんごを買う。',
            'ko': '나는 가게에 가서 사과를 몇 개 산다.',
            'zh': '我去商店买一些苹果。'
        };
    }

    checkWebGPUSupport() {
        if (!navigator.gpu) {
            this.showStatus('WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+.', 'error');
            this.initializeBtn.disabled = true;
            return false;
        }
        return true;
    }

    updateSampleText() {
        const selectedLocale = this.localeSelect.value;
        if (selectedLocale && this.sampleTexts[selectedLocale]) {
            this.noisyStringTextarea.placeholder = `Example: ${this.sampleTexts[selectedLocale]}`;
        }
    }

    showStatus(message, type = 'loading') {
        this.statusDiv.className = `status ${type}`;
        this.statusDiv.innerHTML = type === 'loading' ? 
            `<span class="spinner"></span>${message}` : message;
        this.statusDiv.classList.remove('hidden');
    }

    hideStatus() {
        this.statusDiv.classList.add('hidden');
    }

    async initializeWebLLM() {
        if (this.isInitializing || this.isInitialized) {
            return;
        }

        if (!this.checkWebGPUSupport()) {
            return;
        }

        this.isInitializing = true;
        this.initializeBtn.disabled = true;
        this.showStatus('Initializing WebLLM engine... This may take a few minutes on first run.', 'loading');

        try {
            console.log("Initializing WebLLM engine...");

            this.engine = await CreateMLCEngine(this.modelId, {
                initProgressCallback: (report) => {
                    console.log(`Loading progress: ${report.text}`);
                    this.showStatus(`Loading model: ${report.text}`, 'loading');
                }
            });

            this.isInitialized = true;
            this.correctBtn.disabled = false;
            this.initializeBtn.textContent = 'WebLLM Ready ✓';
            this.initializeBtn.style.background = '#28a745';
            this.initializeBtn.style.color = 'white';
            this.showStatus('WebLLM engine initialized successfully! You can now correct grammar.', 'success');

            setTimeout(() => {
                this.hideStatus();
            }, 3000);

        } catch (error) {
            console.error('Initialization error:', error);
            let errorMessage = error.message;

            if (error.message.includes('WebGPU')) {
                errorMessage = "WebGPU is not available. Please use a compatible browser (Chrome 113+, Edge 113+) and ensure WebGPU is enabled.";
            } else if (error.message.includes('model')) {
                errorMessage = `Model '${this.modelId}' could not be loaded. Please check your internet connection and try again.`;
            }

            this.showStatus(`Initialization failed: ${errorMessage}`, 'error');
            this.initializeBtn.disabled = false;
        } finally {
            this.isInitializing = false;
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        if (!this.isInitialized) {
            this.showStatus('Please initialize WebLLM first.', 'error');
            return;
        }

        const locale = this.localeSelect.value;
        const noisyString = this.noisyStringTextarea.value.trim();

        if (!locale || !noisyString) {
            this.showStatus('Please select a language and enter text to correct.', 'error');
            return;
        }

        // Validate input
        if (noisyString.length > 1000) {
            this.showStatus('Input text is too long. Please limit to 1000 characters or less.', 'error');
            return;
        }

        this.correctBtn.disabled = true;
        this.showStatus('Correcting grammar... Please wait.', 'loading');
        this.hideResults();

        try {
            const corrections = await this.correctGrammar(locale, noisyString);
            this.displayResults(corrections, { locale, noisyString });
            this.hideStatus();
        } catch (error) {
            console.error('Correction error:', error);
            this.showStatus(`Grammar correction failed: ${error.message}`, 'error');
        } finally {
            this.correctBtn.disabled = false;
        }
    }

    async correctGrammar(locale, noisyString) {
        // Basic sanitization - remove potentially problematic characters
        const sanitizedText = noisyString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();

        const prompt = `Fix grammar. Return ONLY 1-3 corrected versions separated by commas. No explanations. Language: ${locale}. Text: "${sanitizedText}"`;

        console.log(`Correcting grammar for locale: ${locale}`);
        console.log(`Input text: ${sanitizedText}`);

        // Add timeout for the API call
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout - the model took too long to respond')), 30000);
        });

        const apiPromise = this.engine.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.1, // Very low temperature for consistent, focused responses
            max_tokens: 100,   // Shorter limit to prevent explanations
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);

        if (!response || !response.choices || response.choices.length === 0) {
            throw new Error("Invalid response from the model");
        }

        const correctedText = response.choices[0].message.content.trim();
        console.log(`Raw response: ${correctedText}`);

        // Parse the response to extract up to 3 options
        const corrections = this.parseCorrections(correctedText);

        console.log(`Parsed corrections: ${JSON.stringify(corrections)}`);
        return corrections;
    }

    parseCorrections(response) {
        if (!response || typeof response !== 'string') {
            return ["Unable to generate corrections"];
        }

        // Clean up the response first
        let cleanResponse = response.trim();

        // Remove common prefixes that models might add
        cleanResponse = cleanResponse.replace(/^(Here are the corrections?:?\s*|Corrected versions?:?\s*|Fixed:?\s*)/i, '');

        // Split by comma and clean up each option
        let corrections = cleanResponse
            .split(',')
            .map(correction => {
                // Remove quotes, extra whitespace, and common prefixes
                return correction
                    .trim()
                    .replace(/^["']|["']$/g, '')
                    .replace(/^\d+\.\s*/, '') // Remove numbering like "1. "
                    .replace(/^-\s*/, '')     // Remove dashes
                    .trim();
            })
            .filter(correction => correction.length > 0 && correction.length < 200) // Filter out very long responses
            .slice(0, 3); // Ensure maximum of 3 options

        // If no valid corrections found, try to extract the first sentence
        if (corrections.length === 0) {
            const firstSentence = cleanResponse.split(/[.!?]/)[0].trim();
            if (firstSentence.length > 0 && firstSentence.length < 200) {
                corrections = [firstSentence];
            } else {
                corrections = ["Unable to generate corrections"];
            }
        }

        return corrections;
    }

    displayResults(corrections, input) {
        this.correctionsDiv.innerHTML = '';

        if (!corrections || corrections.length === 0) {
            this.correctionsDiv.innerHTML = '<p>No corrections available.</p>';
            this.resultsDiv.classList.remove('hidden');
            return;
        }

        corrections.forEach((correction, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'correction-option';
            
            const optionNumber = document.createElement('div');
            optionNumber.className = 'option-number';
            optionNumber.textContent = `Option ${index + 1}${index === 0 ? ' (Most Likely)' : ''}:`;
            
            const correctionText = document.createElement('div');
            correctionText.textContent = correction;
            
            optionDiv.appendChild(optionNumber);
            optionDiv.appendChild(correctionText);
            this.correctionsDiv.appendChild(optionDiv);
        });

        // Add original text for reference
        const originalDiv = document.createElement('div');
        originalDiv.style.marginTop = '20px';
        originalDiv.style.padding = '15px';
        originalDiv.style.background = '#e9ecef';
        originalDiv.style.borderRadius = '6px';
        originalDiv.innerHTML = `<strong>Original text:</strong><br>${input.noisyString}`;
        this.correctionsDiv.appendChild(originalDiv);

        this.resultsDiv.classList.remove('hidden');
    }

    hideResults() {
        this.resultsDiv.classList.add('hidden');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GrammarCorrectionApp();
});
