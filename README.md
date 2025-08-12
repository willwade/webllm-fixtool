# WebLLM Grammar Correction Tool

A web application that demonstrates using WebLLM to build a grammar correction tool. This application uses the WebLLM library to correct grammatical errors in text input, providing up to 3 corrected sentence options with the first being the most likely correction.

## 🚀 **Live Demo**

**Try it now**: [https://willwade.github.io/webllm-fixtool/](https://willwade.github.io/webllm-fixtool/)

*The application runs entirely in your browser using WebGPU - no data is sent to any server!*

## Features

- **AI-Powered Grammar Correction**: Uses the "SmolLM2-360M-Instruct-q4f32_1-MLC" model for fast, efficient grammar correction
- **Multi-Language Support**: Supports multiple languages including English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, and Chinese
- **Real-time Correction**: Provides up to 3 correction options with the most likely option first
- **Web Interface**: Simple, user-friendly web interface for testing the functionality
- **Robust Error Handling**: Comprehensive error handling for WebLLM initialization and inference failures

## Prerequisites

- **Node.js**: Version 16 or higher
- **WebGPU-Compatible Browser**: Chrome 113+, Edge 113+, or other WebGPU-enabled browsers
- **Internet Connection**: Required for initial model download (approximately 1.5GB)

## Installation

1. **Clone or download this repository**:
   ```bash
   git clone <repository-url>
   cd webllm-fixtool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

### Using the Live Demo

1. **Visit**: [https://willwade.github.io/webllm-fixtool/](https://willwade.github.io/webllm-fixtool/)

2. **Initialize WebLLM**:
   - Click the "Initialize WebLLM" button
   - Wait for the model to download and initialize (this may take a few minutes on first run)
   - The button will turn green and show "WebLLM Ready ✓" when complete

3. **Correct Grammar**:
   - Select a language from the dropdown
   - Enter text with grammatical errors in the text area
   - Click "Correct Grammar" to get up to 3 correction options

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/willwade/webllm-fixtool.git
   cd webllm-fixtool
   ```

2. **Install dependencies** (for development):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

### Architecture

**Client-Side Processing**: WebLLM runs entirely in the browser using WebGPU for local AI inference. No data is sent to external servers for processing.

**GitHub Pages Hosting**: The application is hosted as a static site on GitHub Pages, requiring no server infrastructure. Everything runs in your browser!

### API Endpoints

The application provides minimal REST API endpoints:

- **GET `/api/health`** - Health check and status
- **GET `/api/locales`** - Get supported language locales

**Note**: Grammar correction is performed entirely client-side in the browser using WebLLM. No server-side API is needed for the core functionality.

## Technical Details

### Core Components

1. **Client-Side WebLLM Integration** (`public/app.js`):
   - Handles WebLLM engine initialization in the browser
   - Implements the grammar correction logic using WebGPU
   - Uses the exact prompt template as specified
   - Provides robust error handling and input validation
   - Real-time progress updates during model loading

2. **Express Server** (`server.js`):
   - Serves static files and minimal API endpoints
   - Handles CORS and JSON parsing
   - Lightweight server for hosting the web interface

3. **Web Interface** (`public/index.html`):
   - Responsive, user-friendly interface
   - Real-time status updates during initialization and processing
   - Sample text suggestions for different languages
   - WebGPU compatibility checking

### Model Information

- **Models**: 5 options from 376MB to 3.7GB
- **Smart prompting**: Automatically uses JSON mode for larger models, simple prompts for smaller ones
- **Streaming**: Real-time response generation with progress updates
- **Quantization**: 4-bit quantization for efficiency
- **Performance**: Optimized for grammar correction tasks

### Prompt Template

The application uses this exact prompt template:
```
"Correct this sentence to a full grammatically correct sentence. Please give no more than 3 options and the first one most likely. Please provide nothing more than 3 options separated by a comma. Do not reply with errors or issues like you can't fix it. DO NOT remove swear words etc. It will be in language {locale} please respond in that language"
```

## Browser Compatibility

This application requires a WebGPU-compatible browser:

- ✅ Chrome 113+
- ✅ Edge 113+
- ✅ Firefox Nightly (with WebGPU enabled)
- ❌ Safari (WebGPU not yet supported)

To verify WebGPU support, visit: https://webgpu.github.io/webgpu-samples/

## Troubleshooting

### Common Issues

1. **"WebGPU is not supported"**:
   - Ensure you're using a compatible browser
   - Check that WebGPU is enabled in browser flags

2. **Model loading fails**:
   - Check your internet connection
   - Ensure sufficient disk space (2GB+)
   - Try refreshing the page and reinitializing

3. **Slow performance**:
   - First-time model download can be slow
   - Subsequent runs should be much faster
   - Consider using a faster internet connection for initial setup

### Performance Tips

- The model is cached after first download
- Grammar correction is faster after initialization
- Shorter text inputs process more quickly
- Multiple corrections can be requested without reinitializing

## Development

### Project Structure
```
webllm-fixtool/
├── package.json          # Project configuration
├── server.js            # Express server
├── grammarCorrector.js  # Core grammar correction logic
├── public/
│   ├── index.html      # Web interface
│   └── app.js          # Frontend JavaScript
└── README.md           # This file
```

### Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server (same as start)

## License

ISC License

## Contributing

Feel free to submit issues and enhancement requests!
