import { TestFramework } from './TestFramework.js';
import { setupTestEnvironment } from './utils/TestMocks.js';
import { framework as winningLogicTests } from './unit/WinningLogic.test.js';
import { framework as reelManagerTests } from './unit/ReelManager.test.js';
import { framework as assetLoaderTests } from './unit/AssetLoader.test.js';
import { framework as spritePoolTests } from './unit/SpritePool.test.js';
import { framework as performanceMonitorTests } from './unit/PerformanceMonitor.test.js';
import { framework as gameFlowTests } from './integration/GameFlow.test.js';

export class TestRunner {
    constructor() {
        this.frameworks = [];
        this.totalResults = {
            passed: 0,
            failed: 0,
            skipped: 0,
            total: 0,
            suites: 0,
            duration: 0
        };
    }

    registerFramework(framework, name) {
        this.frameworks.push({ framework, name });
    }

    async runAllTests() {
        console.log('🚀 Starting Test Suite Execution\n');
        console.log('='.repeat(80));
        
        setupTestEnvironment();
        
        const startTime = performance.now();
        
        for (const { framework, name } of this.frameworks) {
            console.log(`\n📦 Running ${name} Tests`);
            console.log('─'.repeat(60));
            
            try {
                const results = await framework.runTests();
                this.aggregateResults(results);
                this.totalResults.suites++;
            } catch (error) {
                console.error(`❌ Error running ${name} tests:`, error);
                this.totalResults.failed++;
            }
        }
        
        const endTime = performance.now();
        this.totalResults.duration = Math.round(endTime - startTime);
        
        this.printFinalResults();
        return this.totalResults;
    }

    aggregateResults(results) {
        this.totalResults.passed += results.passed;
        this.totalResults.failed += results.failed;
        this.totalResults.skipped += results.skipped;
        this.totalResults.total += results.total;
    }

    printFinalResults() {
        console.log(`\n${'='.repeat(80)}`);
        console.log('🏁 FINAL TEST RESULTS');
        console.log('='.repeat(80));
        
        const passRate = this.totalResults.total > 0 ? 
            Math.round((this.totalResults.passed / this.totalResults.total) * 100) : 0;

        console.log(`📊 Overall Summary:`);
        console.log(`   🗂️  Test Suites: ${this.totalResults.suites}`);
        console.log(`   📝 Total Tests:  ${this.totalResults.total}`);
        console.log(`   ✅ Passed:      ${this.totalResults.passed}`);
        console.log(`   ❌ Failed:      ${this.totalResults.failed}`);
        console.log(`   ⏭️  Skipped:     ${this.totalResults.skipped}`);
        console.log(`   📈 Pass Rate:    ${passRate}%`);
        console.log(`   ⏱️  Total Time:   ${this.totalResults.duration}ms`);

        if (this.totalResults.failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! 🎉');
            console.log('🌟 Excellent work! Your code is solid.');
        } else {
            console.log(`\n💥 ${this.totalResults.failed} TEST(S) FAILED`);
            console.log('🔧 Please review and fix the failing tests.');
        }

        console.log(`\n${'='.repeat(80)}`);
    }

    async runSpecificSuite(suiteName) {
        const suite = this.frameworks.find(f => f.name === suiteName);
        if (!suite) {
            console.error(`❌ Test suite '${suiteName}' not found`);
            return null;
        }

        console.log(`🎯 Running ${suiteName} Tests Only\n`);
        setupTestEnvironment();
        
        try {
            const results = await suite.framework.runTests();
            console.log(`\n✨ ${suiteName} Tests Completed`);
            return results;
        } catch (error) {
            console.error(`❌ Error running ${suiteName} tests:`, error);
            return null;
        }
    }

    listAvailableSuites() {
        console.log('📋 Available Test Suites:');
        this.frameworks.forEach(({ name }, index) => {
            console.log(`   ${index + 1}. ${name}`);
        });
    }

    generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.totalResults,
            suites: this.frameworks.map(({ name }) => name),
            environment: {
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
                platform: typeof process !== 'undefined' ? process.platform : 'Browser'
            }
        };

        return JSON.stringify(report, null, 2);
    }

    exportTestReport() {
        const report = this.generateTestReport();
        
        if (typeof document !== 'undefined') {
            const blob = new Blob([report], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `test-report-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            console.log('📄 Test report exported successfully');
        } else {
            console.log('📄 Test Report:\n', report);
        }
    }
}

const testRunner = new TestRunner();

testRunner.registerFramework(winningLogicTests, 'WinningLogic');
testRunner.registerFramework(reelManagerTests, 'ReelManager');
testRunner.registerFramework(assetLoaderTests, 'AssetLoader');
testRunner.registerFramework(spritePoolTests, 'SpritePool');
testRunner.registerFramework(performanceMonitorTests, 'PerformanceMonitor');
testRunner.registerFramework(gameFlowTests, 'GameFlow Integration');

if (typeof window !== 'undefined') {
    window.testRunner = testRunner;
    window.runAllTests = () => testRunner.runAllTests();
    window.runSpecificSuite = (suiteName) => testRunner.runSpecificSuite(suiteName);
    window.listTestSuites = () => testRunner.listAvailableSuites();
    window.exportTestReport = () => testRunner.exportTestReport();
    
    console.log('🧪 Test Runner loaded. Available commands:');
    console.log('   - window.runAllTests()');
    console.log('   - window.runSpecificSuite("SuiteName")');
    console.log('   - window.listTestSuites()');
    console.log('   - window.exportTestReport()');
}

export { testRunner };