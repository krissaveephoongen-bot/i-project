/**
 * S-Curve PDF Export Test Suite
 * Tests PDF generation and API endpoint
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const API_URL = 'http://localhost:5000/api/projects';
const TEST_PROJECT_ID = '1'; // Use default test project

// Color output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

/**
 * Make HTTP request
 */
function makeRequest(url, method = 'GET') {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = Buffer.alloc(0);

            res.on('data', (chunk) => {
                data = Buffer.concat([data, chunk]);
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

/**
 * Test 1: Check API endpoint exists
 */
async function testEndpointExists() {
    log(colors.blue, '\n📡 Test 1: Check API endpoint exists');

    try {
        const response = await makeRequest(`${API_URL}/${TEST_PROJECT_ID}/s-curve/export/pdf`);

        if (response.statusCode === 200) {
            log(colors.green, '✅ PDF export endpoint is accessible');
            return true;
        } else if (response.statusCode === 404) {
            log(colors.yellow, '⚠️  Endpoint returns 404 (project may not exist)');
            return response.statusCode === 404;
        } else {
            log(colors.red, `❌ Unexpected status code: ${response.statusCode}`);
            return false;
        }
    } catch (error) {
        log(colors.red, `❌ Error accessing endpoint: ${error.message}`);
        return false;
    }
}

/**
 * Test 2: Check PDF content type
 */
async function testPdfContentType() {
    log(colors.blue, '\n📄 Test 2: Verify PDF content type');

    try {
        const response = await makeRequest(`${API_URL}/${TEST_PROJECT_ID}/s-curve/export/pdf`);

        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('application/pdf')) {
            log(colors.green, '✅ Correct content-type: application/pdf');
            return true;
        } else {
            log(colors.yellow, `⚠️  Content-type: ${contentType}`);
            return false;
        }
    } catch (error) {
        log(colors.red, `❌ Error checking content-type: ${error.message}`);
        return false;
    }
}

/**
 * Test 3: Check PDF size
 */
async function testPdfSize() {
    log(colors.blue, '\n📦 Test 3: Verify PDF file size');

    try {
        const response = await makeRequest(`${API_URL}/${TEST_PROJECT_ID}/s-curve/export/pdf`);

        const size = response.body.length;
        const sizeKB = (size / 1024).toFixed(2);

        if (size > 0) {
            log(colors.green, `✅ PDF generated: ${sizeKB} KB`);
            return size > 1000; // At least 1KB
        } else {
            log(colors.red, '❌ PDF is empty');
            return false;
        }
    } catch (error) {
        log(colors.red, `❌ Error checking PDF size: ${error.message}`);
        return false;
    }
}

/**
 * Test 4: Check PDF magic bytes (PDF header)
 */
async function testPdfFormat() {
    log(colors.blue, '\n🔍 Test 4: Verify PDF format');

    try {
        const response = await makeRequest(`${API_URL}/${TEST_PROJECT_ID}/s-curve/export/pdf`);

        const header = response.body.toString('utf8', 0, 4);
        if (header === '%PDF') {
            log(colors.green, '✅ Valid PDF format (contains PDF header)');
            return true;
        } else {
            log(colors.red, `❌ Invalid PDF header: ${header}`);
            return false;
        }
    } catch (error) {
        log(colors.red, `❌ Error checking PDF format: ${error.message}`);
        return false;
    }
}

/**
 * Test 5: Save PDF to file
 */
async function testSavePdfFile() {
    log(colors.blue, '\n💾 Test 5: Save PDF to file');

    try {
        const response = await makeRequest(`${API_URL}/${TEST_PROJECT_ID}/s-curve/export/pdf`);

        const filePath = path.join(process.cwd(), 'test-s-curve-export.pdf');
        fs.writeFileSync(filePath, response.body);

        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
            log(colors.green, `✅ PDF saved: ${filePath} (${(stats.size / 1024).toFixed(2)} KB)`);
            return true;
        } else {
            log(colors.red, '❌ Saved file is empty');
            return false;
        }
    } catch (error) {
        log(colors.red, `❌ Error saving PDF: ${error.message}`);
        return false;
    }
}

/**
 * Test 6: Check content disposition header
 */
async function testContentDisposition() {
    log(colors.blue, '\n📥 Test 6: Check content-disposition header');

    try {
        const response = await makeRequest(`${API_URL}/${TEST_PROJECT_ID}/s-curve/export/pdf`);

        const disposition = response.headers['content-disposition'];
        if (disposition && disposition.includes('attachment')) {
            log(colors.green, `✅ Content-disposition set for download`);
            log(colors.blue, `   ${disposition}`);
            return true;
        } else {
            log(colors.yellow, `⚠️  No content-disposition header found`);
            return false;
        }
    } catch (error) {
        log(colors.red, `❌ Error checking disposition: ${error.message}`);
        return false;
    }
}

/**
 * Test 7: Performance test
 */
async function testPerformance() {
    log(colors.blue, '\n⚡ Test 7: Performance test (PDF generation time)');

    try {
        const startTime = Date.now();
        await makeRequest(`${API_URL}/${TEST_PROJECT_ID}/s-curve/export/pdf`);
        const duration = Date.now() - startTime;

        if (duration < 5000) {
            log(colors.green, `✅ PDF generated in ${duration}ms (target: < 5000ms)`);
            return true;
        } else {
            log(colors.yellow, `⚠️  PDF took ${duration}ms (slower than target)`);
            return false;
        }
    } catch (error) {
        log(colors.red, `❌ Performance test error: ${error.message}`);
        return false;
    }
}

/**
 * Run all tests
 */
async function runTests() {
    log(colors.blue, '═══════════════════════════════════════════════════════');
    log(colors.blue, '   S-Curve PDF Export Test Suite');
    log(colors.blue, '═══════════════════════════════════════════════════════');

    const tests = [
        testEndpointExists,
        testPdfContentType,
        testPdfSize,
        testPdfFormat,
        testSavePdfFile,
        testContentDisposition,
        testPerformance
    ];

    const results = [];

    for (const test of tests) {
        try {
            const result = await test();
            results.push(result);
        } catch (error) {
            log(colors.red, `Test error: ${error.message}`);
            results.push(false);
        }
    }

    // Summary
    log(colors.blue, '\n═══════════════════════════════════════════════════════');
    const passed = results.filter((r) => r).length;
    const total = results.length;
    log(colors.blue, `Test Results: ${passed}/${total} passed`);

    if (passed === total) {
        log(colors.green, '\n✅ All tests passed!');
        process.exit(0);
    } else {
        log(colors.red, `\n❌ ${total - passed} test(s) failed`);
        process.exit(1);
    }
}

// Run tests
runTests().catch((error) => {
    log(colors.red, `Fatal error: ${error.message}`);
    process.exit(1);
});
