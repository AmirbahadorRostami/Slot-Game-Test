#!/usr/bin/env node

/**
 * Node.js Test Runner for Slot Machine Game
 * Runs all unit and integration tests in Node.js environment
 */

import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class NodeTestRunner {
    constructor() {
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.results = [];
    }

    async runAllTests() {
        console.log('🚀 Starting Node.js test execution...\n');
        
        try {
            // Run unit tests
            await this.runTestDirectory('unit', 'Unit Tests');
            
            // Run integration tests
            await this.runTestDirectory('integration', 'Integration Tests');
            
            this.printSummary();
            
            // Exit with error code if tests failed
            process.exit(this.failedTests > 0 ? 1 : 0);
            
        } catch (error) {
            console.error('❌ Test runner failed:', error.message);
            process.exit(1);
        }
    }

    async runTestDirectory(directory, title) {
        console.log(`📁 Running ${title}:`);
        console.log('━'.repeat(50));
        
        const testDir = join(__dirname, directory);
        
        try {
            const files = await readdir(testDir);
            const testFiles = files.filter(file => file.endsWith('.test.js'));
            
            for (const file of testFiles) {
                await this.runTestFile(join(testDir, file), file);
            }
        } catch (error) {
            console.log(`⚠️  No ${directory} tests found or directory error:`, error.message);
        }
        
        console.log('');
    }

    async runTestFile(filePath, fileName) {
        try {
            console.log(`📄 ${fileName.replace('.test.js', '')}:`);
            
            // Import and run the test file
            const testModule = await import(filePath);
            
            if (testModule.framework) {
                const framework = testModule.framework;
                await framework.run();
                
                const results = framework.getResults();
                this.aggregateResults(results, fileName);
                this.printFileResults(results);
            } else {
                console.log('   ⚠️  No test framework found in file');
            }
            
        } catch (error) {
            console.log(`   ❌ Failed to run ${fileName}: ${error.message}`);
            this.failedTests++;
        }
    }

    aggregateResults(results, fileName) {
        this.totalTests += results.total;
        this.passedTests += results.passed;
        this.failedTests += results.failed;
        
        this.results.push({
            file: fileName,
            ...results
        });
    }

    printFileResults(results) {
        const passedStr = results.passed > 0 ? `✅ ${results.passed} passed` : '';
        const failedStr = results.failed > 0 ? `❌ ${results.failed} failed` : '';
        const parts = [passedStr, failedStr].filter(Boolean);
        
        console.log(`   ${parts.join(', ')}`);
        
        // Print failed test details
        if (results.failures && results.failures.length > 0) {
            results.failures.forEach(failure => {
                console.log(`     💥 ${failure.test}: ${failure.error}`);
            });
        }
    }

    printSummary() {
        console.log('📊 Test Summary:');
        console.log('━'.repeat(50));
        console.log(`Total tests: ${this.totalTests}`);
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📈 Success rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
        
        if (this.failedTests === 0) {
            console.log('\n🎉 All tests passed!');
        } else {
            console.log(`\n💔 ${this.failedTests} test(s) failed`);
        }
    }
}

// Self-executing async function
(async () => {
    const runner = new NodeTestRunner();
    await runner.runAllTests();
})();