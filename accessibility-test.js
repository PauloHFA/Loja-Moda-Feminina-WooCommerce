const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs');
const path = require('path');

const PAGES = [
    { name: 'Homepage', url: 'http://localhost:8088/' },
    { name: 'Shop Page', url: 'http://localhost:8088/loja/' },
    { name: 'Product Page', url: 'http://localhost:8088/product/blusa-de-seda-off-white/' },
    { name: 'Cart Page', url: 'http://localhost:8088/carrinho/' },
    { name: 'Checkout Page', url: 'http://localhost:8088/finalizar-compra/' },
    { name: 'My Account Page', url: 'http://localhost:8088/minha-conta/' },
];

const RESULTS_DIR = path.join(__dirname, 'accessibility-results');

if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

async function runAxeTest(page, url) {
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        const results = await new AxePuppeteer(page).analyze();
        return results;
    } catch (error) {
        console.error(`  ❌ axe-core error for ${url}:`, error.message);
        return { violations: [], passes: [], incomplete: [], inapplicable: [] };
    }
}

async function runLighthouseTest(url) {
    try {
        const { lhr } = await lighthouse(url, {
            port: 9222,
            output: 'json',
            onlyCategories: ['accessibility'],
            settings: {
                formFactor: 'desktop',
                screenEmulation: { disabled: true },
                throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
            },
        }, { logLevel: 'silent' });
        
        return {
            score: Math.round(lhr.categories.accessibility.score * 100),
            audits: lhr.audits,
        };
    } catch (error) {
        console.error(`  ❌ Lighthouse error for ${url}:`, error.message);
        return { score: 0, audits: {} };
    }
}

async function main() {
    console.log('🚀 Starting Accessibility Validation for Moda Feminina E-commerce');
    console.log('================================================================\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--remote-debugging-port=9222'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const allResults = [];

    for (const pageInfo of PAGES) {
        console.log(`📄 Testing: ${pageInfo.name}`);
        console.log('──────────────────────────────────────────────────\n');

        console.log(`🔍 Running axe-core test on: ${pageInfo.name} (${pageInfo.url})`);
        const axeResults = await runAxeTest(page, pageInfo.url);

        console.log(`🔍 Running Lighthouse test on: ${pageInfo.name} (${pageInfo.url})`);
        const lighthouseResults = await runLighthouseTest(pageInfo.url);

        console.log('\n  axe-core Results:');
        console.log(`    Violations: ${axeResults.violations.length}`);
        console.log(`    Passes: ${axeResults.passes.length}`);
        console.log(`    Incomplete: ${axeResults.incomplete.length}`);

        if (axeResults.violations.length > 0) {
            console.log('\n  Top Violations:');
            axeResults.violations.slice(0, 5).forEach((v, i) => {
                console.log(`    ${i + 1}. [${v.impact}] ${v.id}: ${v.description}`);
                console.log(`       Nodes affected: ${v.nodes.length}`);
                if (v.nodes[0]) {
                    console.log(`       Example HTML: ${v.nodes[0].html.substring(0, 200)}...`);
                }
            });
        }

        console.log(`\n  Lighthouse Accessibility Score: ${lighthouseResults.score}/100`);

        const failedAudits = Object.entries(lighthouseResults.audits)
            .filter(([_, audit]) => audit.score === 0 || audit.score === null)
            .slice(0, 5);

        if (failedAudits.length > 0) {
            console.log('\n  Failed Lighthouse Audits:');
            failedAudits.forEach(([id, audit]) => {
                console.log(`    - ${id} (${audit.score === null ? 'N/A' : audit.score * 100}%): ${audit.title}`);
                console.log(`      ${audit.description}`);
            });
        }

        console.log('\n');

        allResults.push({
            page: pageInfo.name,
            url: pageInfo.url,
            axe: axeResults,
            lighthouse: lighthouseResults,
        });
    }

    await browser.close();

    // Save JSON report
    const jsonReport = {
        timestamp: new Date().toISOString(),
        target: 'WCAG 2.1 AA Compliance',
        results: allResults,
    };

    fs.writeFileSync(
        path.join(RESULTS_DIR, 'accessibility-report.json'),
        JSON.stringify(jsonReport, null, 2)
    );

    // Generate Markdown report
    let mdReport = `# Accessibility Audit Report - Moda Feminina E-commerce\n\n`;
    mdReport += `**Date:** ${new Date().toLocaleString('pt-BR')}\n\n`;
    mdReport += `**Target:** WCAG 2.1 AA Compliance\n\n`;
    mdReport += `---\n\n`;

    allResults.forEach(result => {
        mdReport += `## ${result.page}\n\n`;
        mdReport += `**URL:** ${result.url}\n\n`;

        mdReport += `### axe-core Results\n\n`;
        mdReport += `- **Violations:** ${result.axe.violations.length}\n`;
        mdReport += `- **Passes:** ${result.axe.passes.length}\n`;
        mdReport += `- **Incomplete:** ${result.axe.incomplete.length}\n`;
        mdReport += `- **Inapplicable:** ${result.axe.inapplicable.length}\n\n`;

        if (result.axe.violations.length > 0) {
            mdReport += `#### Violations Found\n\n`;
            result.axe.violations.forEach((v, i) => {
                mdReport += `##### ${i + 1}. ${v.id} (${v.impact})\n\n`;
                mdReport += `**Description:** ${v.description}\n\n`;
                mdReport += `**Help:** ${v.help}\n\n`;
                mdReport += `**Help URL:** ${v.helpUrl}\n\n`;
                mdReport += `**Nodes Affected:** ${v.nodes.length}\n\n`;
                if (v.nodes[0]) {
                    mdReport += `**Example HTML:**\n\`\`\`html\n${v.nodes[0].html}\n\`\`\`\n\n`;
                }
                mdReport += `**Target:** \`${v.nodes[0]?.target?.join(' > ') || 'N/A'}\`\n\n`;
            });
        }

        mdReport += `### Lighthouse Accessibility Score: ${result.lighthouse.score}/100\n\n`;

        const failedAudits = Object.entries(result.lighthouse.audits)
            .filter(([_, audit]) => audit.score === 0 || audit.score === null)
            .slice(0, 10);

        if (failedAudits.length > 0) {
            mdReport += `#### Failed Lighthouse Audits\n\n`;
            failedAudits.forEach(([id, audit]) => {
                mdReport += `- **${id}** (${audit.score === null ? 'N/A' : audit.score * 100}%): ${audit.title}\n`;
                mdReport += `  - ${audit.description}\n`;
            });
            mdReport += `\n`;
        }

        mdReport += `---\n\n`;
    });

    // Summary
    mdReport += `## Summary\n\n`;
    allResults.forEach(result => {
        mdReport += `- **${result.page}:** ${result.axe.violations.length} axe violations, Lighthouse: ${result.lighthouse.score}/100\n`;
    });
    mdReport += `\n**Total Violations Across All Pages:** ${allResults.reduce((sum, r) => sum + r.axe.violations.length, 0)}\n`;
    mdReport += `**Pages Tested:** ${allResults.length}\n`;

    fs.writeFileSync(
        path.join(RESULTS_DIR, 'accessibility-report.md'),
        mdReport
    );

    console.log(`✅ Full report saved to: ${path.join(RESULTS_DIR, 'accessibility-report.json')}`);
    console.log(`✅ Markdown report saved to: ${path.join(RESULTS_DIR, 'accessibility-report.md')}`);
}

main().catch(console.error);