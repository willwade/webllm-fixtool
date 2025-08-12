// Import WebLLM from CDN
import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

class GrammarCorrectionApp {
    constructor() {
        this.engine = null;
        this.isInitialized = false;
        this.isInitializing = false;
        this.modelId = "SmolLM2-360M-Instruct-q4f16_1-MLC"; // Default to working small model
        this.availableModels = {
            "SmolLM2-360M-Instruct-q4f16_1-MLC": {
                name: "SmolLM2-360M (Fastest)",
                size: "~192MB",
                speed: "Very Fast",
                quality: "Basic",
                description: "Best for slow internet"
            },
            "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC": {
                name: "TinyLlama-1.1B (Fast)",
                size: "~697MB",
                speed: "Fast",
                quality: "Good",
                description: "Good balance of speed/quality"
            },
            "Llama-3.2-1B-Instruct-q4f16_1-MLC": {
                name: "Llama-3.2-1B (Balanced)",
                size: "~879MB",
                speed: "Medium",
                quality: "Very Good",
                description: "Latest Llama model, excellent grammar"
            },
            "gemma-2b-it-q4f16_1-MLC": {
                name: "Gemma-2B (High Quality)",
                size: "~1.5GB",
                speed: "Slower",
                quality: "Excellent",
                description: "Google's model, great for grammar"
            },
            "Phi-3-mini-4k-instruct-q4f16_1-MLC": {
                name: "Phi-3-Mini (Best Quality)",
                size: "~3.7GB",
                speed: "Slow",
                quality: "Excellent",
                description: "Microsoft's model, best results"
            }
        };
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
        this.modelSelect = document.getElementById('modelSelect');
        this.noisyStringTextarea = document.getElementById('noisyString');
        this.resultsDiv = document.getElementById('results');
        this.correctionsDiv = document.getElementById('corrections');
        this.populateModelDropdown();
    }

    attachEventListeners() {
        this.initializeBtn.addEventListener('click', () => this.initializeWebLLM());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Add some sample texts for different languages
        this.localeSelect.addEventListener('change', () => this.updateSampleText());

        // Handle model selection changes
        this.modelSelect.addEventListener('change', () => this.handleModelChange());
    }

    populateModelDropdown() {
        if (!this.modelSelect) return;

        // Clear existing options
        this.modelSelect.innerHTML = '';

        // Add model options
        Object.entries(this.availableModels).forEach(([modelId, info]) => {
            const option = document.createElement('option');
            option.value = modelId;
            option.textContent = `${info.name} - ${info.size}`;
            option.title = `${info.description}\nQuality: ${info.quality}\nSpeed: ${info.speed}\nSize: ${info.size}`;

            if (modelId === this.modelId) {
                option.selected = true;
            }

            this.modelSelect.appendChild(option);
        });
    }

    handleModelChange() {
        const newModelId = this.modelSelect.value;
        if (newModelId !== this.modelId) {
            this.modelId = newModelId;

            // Reset initialization state
            this.isInitialized = false;
            this.engine = null;
            this.correctBtn.disabled = true;
            this.initializeBtn.disabled = false;
            this.initializeBtn.textContent = 'Initialize WebLLM';
            this.initializeBtn.style.background = '';
            this.initializeBtn.style.color = '';

            const modelInfo = this.availableModels[newModelId];
            this.showStatus(`Model changed to ${modelInfo.name}. Click Initialize to load the new model.`, 'success');
        }
    }

    handleModelChange() {
        const newModelId = this.modelSelect.value;
        if (newModelId !== this.modelId) {
            this.modelId = newModelId;

            // Reset initialization state
            this.isInitialized = false;
            this.engine = null;
            this.correctBtn.disabled = true;
            this.initializeBtn.disabled = false;
            this.initializeBtn.textContent = 'Initialize WebLLM';
            this.initializeBtn.style.background = '';
            this.initializeBtn.style.color = '';

            const modelInfo = this.availableModels[newModelId];
            this.showStatus(`Model changed to ${modelInfo.name}. Click Initialize to load the new model.`, 'success');
        }
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

        // Use JSON mode for ALL models - WebLLM supports it universally
        const prompt = `Fix the grammar and spelling in this text: "${sanitizedText}"

Example: If the text was "i want burger", you would return:
{
  "corrections": [
    "I want a burger",
    "I want burgers",
    "I would like a burger"
  ]
}

Now fix "${sanitizedText}" and return 3 different corrected versions in the same JSON format. Language: ${locale}.`;

        console.log(`Correcting grammar for locale: ${locale}`);
        console.log(`Input text: ${sanitizedText}`);

        // Add timeout for the API call
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout - the model took too long to respond')), 30000);
        });

        // Use streaming with JSON mode for all models
        const apiPromise = this.engine.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 200,
            stream: true,
            response_format: { type: "json_object" } // JSON mode works on all WebLLM models
        });

        const stream = await Promise.race([apiPromise, timeoutPromise]);

        // Collect streaming response
        let fullResponse = '';
        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || '';
            fullResponse += delta;

            // Show streaming progress
            if (delta) {
                this.showStatus(`Generating corrections... ${fullResponse.length} characters`, 'loading');
            }
        }

        console.log(`Raw streaming response: ${fullResponse}`);

        // Parse JSON response
        const corrections = this.parseJSONCorrections(fullResponse);

        console.log(`Parsed corrections: ${JSON.stringify(corrections)}`);
        return corrections;
    }

    parseJSONCorrections(response) {
        if (!response || typeof response !== 'string') {
            return ["Unable to generate corrections"];
        }

        try {
            // Clean up the response - sometimes models add extra text
            let cleanResponse = response.trim();

            // Extract JSON if it's wrapped in other text
            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanResponse = jsonMatch[0];
            }

            const parsed = JSON.parse(cleanResponse);

            if (parsed.corrections && Array.isArray(parsed.corrections)) {
                const corrections = parsed.corrections
                    .filter(correction => typeof correction === 'string' && correction.trim().length > 0)
                    .map(correction => correction.trim())
                    .filter(correction => {
                        // Filter out template placeholders
                        const lower = correction.toLowerCase();
                        return !lower.includes('first corrected') &&
                               !lower.includes('second corrected') &&
                               !lower.includes('third corrected') &&
                               !lower.includes('put the') &&
                               !lower.includes('corrected version') &&
                               !lower.includes('placeholder');
                    })
                    .slice(0, 3);

                if (corrections.length > 0) {
                    return corrections;
                }
            }

            // Fallback if JSON structure is different
            return this.parseCorrections(response);

        } catch (error) {
            console.warn('Failed to parse JSON response, falling back to text parsing:', error);
            return this.parseCorrections(response);
        }
    }

    parseCorrections(response) {
        if (!response || typeof response !== 'string') {
            return ["Unable to generate corrections"];
        }

        // Clean up the response first
        let cleanResponse = response.trim();

        // Remove common prefixes and formatting that small models add
        cleanResponse = cleanResponse
            .replace(/^(Here are the corrections?:?\s*|Corrected versions?:?\s*|Fixed:?\s*|The corrected versions are:?\s*|Answer with 3 versions separated by commas:?\s*)/i, '')
            .replace(/Option \d+[^:]*:?\s*/gi, '') // Remove "Option 1:", "Option 2 (Most Likely):", etc.
            .replace(/\d+\.\s*/g, '') // Remove numbering "1. ", "2. ", "3. "
            .replace(/This is the corrected version.*$/i, '') // Remove explanatory text
            .replace(/Here are.*$/i, '') // Remove "Here are the corrections"
            .trim();

        // Try different splitting methods
        let corrections = [];

        // First try splitting by comma (most common)
        if (cleanResponse.includes(',')) {
            corrections = cleanResponse.split(',');
        }
        // Try splitting by quotes if they contain corrections
        else if (cleanResponse.includes('"')) {
            const matches = cleanResponse.match(/"([^"]+)"/g);
            if (matches) {
                corrections = matches.map(match => match.replace(/"/g, ''));
            }
        }
        // Try splitting by newlines
        else if (cleanResponse.includes('\n')) {
            corrections = cleanResponse.split('\n');
        }
        // Try splitting by periods followed by capital letter
        else if (cleanResponse.match(/\.\s+[A-Z]/)) {
            corrections = cleanResponse.split(/\.\s+(?=[A-Z])/);
        }
        // If no clear separators, treat as single correction
        else {
            corrections = [cleanResponse];
        }

        // Clean up each correction
        corrections = corrections
            .map(correction => {
                return correction
                    .trim()
                    .replace(/^["']|["']$/g, '')     // Remove quotes
                    .replace(/^\d+\.\s*/, '')        // Remove numbering
                    .replace(/^-\s*/, '')            // Remove dashes
                    .replace(/^[•*]\s*/, '')         // Remove bullet points
                    .replace(/\.$/, '')              // Remove trailing period
                    .replace(/^(and\s+)?/i, '')      // Remove leading "and"
                    .trim();
            })
            .filter(correction => {
                return correction.length > 0 &&
                       correction.length < 200 &&
                       !correction.toLowerCase().includes('unable') &&
                       !correction.toLowerCase().includes('cannot') &&
                       !correction.toLowerCase().includes('error') &&
                       !correction.toLowerCase().includes('option') &&
                       correction.length > 2; // Filter out very short fragments
            })
            .slice(0, 3); // Ensure maximum of 3 options

        // If no valid corrections found, return a helpful message
        if (corrections.length === 0) {
            corrections = ["Unable to generate corrections"];
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
