#!/usr/bin/env node

/**
 * Simple test script to verify the grammar correction API
 * Run this after starting the server to test the functionality
 */

const API_BASE = 'http://localhost:3000/api';

async function makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url);
        const result = await response.json();
        return { success: response.ok, data: result, status: response.status };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function testAPI() {
    console.log('🧪 Testing WebLLM Grammar Correction API\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResult = await makeRequest('/health');
    if (healthResult.success) {
        console.log('✅ Health check passed');
        console.log(`   Status: ${healthResult.data.status}`);
        console.log(`   WebLLM initialized: ${healthResult.data.webllm.isInitialized}`);
    } else {
        console.log('❌ Health check failed');
        console.log(`   Error: ${healthResult.error || healthResult.data.error}`);
    }
    console.log();

    // Test 2: Get locales
    console.log('2. Testing locales endpoint...');
    const localesResult = await makeRequest('/locales');
    if (localesResult.success) {
        console.log('✅ Locales endpoint passed');
        console.log(`   Available locales: ${localesResult.data.locales.length}`);
        console.log(`   Sample locales: ${localesResult.data.locales.slice(0, 3).map(l => l.code).join(', ')}`);
    } else {
        console.log('❌ Locales endpoint failed');
        console.log(`   Error: ${localesResult.error || localesResult.data.error}`);
    }
    console.log();

    // Test 3: Note about WebLLM
    console.log('3. WebLLM functionality...');
    console.log('   ℹ️  WebLLM now runs entirely in the browser using WebGPU');
    console.log('   ℹ️  Grammar correction is performed client-side');
    console.log('   ℹ️  Open http://localhost:3000 in a WebGPU-compatible browser to test');
    console.log('   ℹ️  Supported browsers: Chrome 113+, Edge 113+');
    console.log();

    console.log('\n🎉 API testing completed!');
}

// Run the tests
testAPI().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});
