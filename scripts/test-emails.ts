/**
 * Email Integration Test Script
 * 
 * Run with: npx tsx scripts/test-emails.ts
 * 
 * Make sure you have:
 * 1. RESEND_API_KEY set in .env.local
 * 2. ADMIN_EMAIL set in .env.local
 * 3. Dev server running (npm run dev)
 */

import 'dotenv/config';

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
};

function log(status: 'pass' | 'fail' | 'info' | 'warn', message: string) {
    const icons = {
        pass: `${colors.green}✓${colors.reset}`,
        fail: `${colors.red}✗${colors.reset}`,
        info: `${colors.blue}ℹ${colors.reset}`,
        warn: `${colors.yellow}⚠${colors.reset}`,
    };
    console.log(`${icons[status]} ${message}`);
}

async function testContactFormEmail() {
    console.log('\n--- Testing Contact Form Email ---');

    try {
        const response = await fetch(`${BASE_URL}/api/email/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                company: 'Test Company',
                phone: '555-1234',
                message: 'This is a test message from the email test script.',
            }),
        });

        if (response.ok) {
            log('pass', 'Contact form email API responded successfully');
            return true;
        } else {
            const data = await response.json();
            log('fail', `Contact form email failed: ${data.error}`);
            return false;
        }
    } catch (err) {
        log('fail', `Contact form email error: ${err}`);
        return false;
    }
}

async function testQuoteFormEmail() {
    console.log('\n--- Testing Quote Form Email ---');

    try {
        const response = await fetch(`${BASE_URL}/api/email/quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'buy',
                data: {
                    name: 'Test Buyer',
                    email: 'buyer@example.com',
                    company: 'Buyer Corp',
                    phone: '555-5678',
                    palletType: '48x40 GMA',
                    quantity: '100',
                    frequency: 'monthly',
                    deliveryLocation: 'Atlanta, GA',
                    notes: 'Test quote from email test script',
                },
            }),
        });

        if (response.ok) {
            log('pass', 'Quote form email API responded successfully');
            return true;
        } else {
            const data = await response.json();
            log('fail', `Quote form email failed: ${data.error}`);
            return false;
        }
    } catch (err) {
        log('fail', `Quote form email error: ${err}`);
        return false;
    }
}

async function checkEnvironmentVariables() {
    console.log('\n--- Checking Environment Variables ---');

    let allGood = true;

    if (process.env.RESEND_API_KEY) {
        log('pass', `RESEND_API_KEY is set (${process.env.RESEND_API_KEY.slice(0, 10)}...)`);
    } else {
        log('fail', 'RESEND_API_KEY is NOT set');
        allGood = false;
    }

    if (process.env.ADMIN_EMAIL) {
        log('pass', `ADMIN_EMAIL is set (${process.env.ADMIN_EMAIL})`);
    } else {
        log('fail', 'ADMIN_EMAIL is NOT set');
        allGood = false;
    }

    return allGood;
}

async function checkServerRunning() {
    console.log('\n--- Checking Server Status ---');

    try {
        const response = await fetch(`${BASE_URL}/api/profile`);
        // 401 is expected since we're not logged in, but it means server is running
        if (response.status === 401 || response.ok) {
            log('pass', 'Dev server is running');
            return true;
        }
    } catch (err) {
        log('fail', `Dev server is NOT running at ${BASE_URL}`);
        log('info', 'Start the server with: npm run dev');
        return false;
    }
    return false;
}

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   Grunge Pallets Email Test Suite     ║');
    console.log('╚═══════════════════════════════════════╝');

    // Check prerequisites
    const envOk = await checkEnvironmentVariables();
    const serverOk = await checkServerRunning();

    if (!envOk || !serverOk) {
        console.log('\n' + colors.red + '⛔ Prerequisites not met. Fix the issues above and try again.' + colors.reset);
        process.exit(1);
    }

    // Run tests
    const results: { name: string; passed: boolean }[] = [];

    results.push({ name: 'Contact Form Email', passed: await testContactFormEmail() });
    results.push({ name: 'Quote Form Email', passed: await testQuoteFormEmail() });

    // Summary
    console.log('\n═══════════════════════════════════════');
    console.log('                SUMMARY                 ');
    console.log('═══════════════════════════════════════');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    results.forEach(r => {
        log(r.passed ? 'pass' : 'fail', r.name);
    });

    console.log('\n' + colors.blue + `Results: ${passed} passed, ${failed} failed` + colors.reset);

    if (failed === 0) {
        console.log(colors.green + '\n✅ All tests passed! Check your ADMIN_EMAIL inbox for the test emails.' + colors.reset);
    } else {
        console.log(colors.red + '\n❌ Some tests failed. Check the errors above.' + colors.reset);
    }

    console.log('\n' + colors.yellow + 'Note: This tests the API endpoints. For full testing, also manually:' + colors.reset);
    console.log('  • Place an order (tests order confirmation + admin notification)');
    console.log('  • Change order status in admin (tests status update email)');
    console.log('  • Approve a user in admin (tests user approval email)');
    console.log('  • Sign up as new user (tests new user admin notification)');
}

main().catch(console.error);
