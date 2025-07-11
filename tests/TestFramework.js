export class TestFramework {
    constructor() {
        this.tests = [];
        this.suites = new Map();
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            total: 0
        };
        this.currentSuite = null;
        this.hooks = {
            beforeEach: [],
            afterEach: [],
            beforeAll: [],
            afterAll: []
        };
    }

    describe(suiteName, callback) {
        const previousSuite = this.currentSuite;
        this.currentSuite = {
            name: suiteName,
            tests: [],
            hooks: {
                beforeEach: [],
                afterEach: [],
                beforeAll: [],
                afterAll: []
            },
            results: {
                passed: 0,
                failed: 0,
                skipped: 0,
                total: 0
            }
        };

        this.suites.set(suiteName, this.currentSuite);
        
        try {
            callback();
        } catch (error) {
            console.error(`Error in test suite '${suiteName}':`, error);
        }
        
        this.currentSuite = previousSuite;
    }

    it(testName, testFunction, options = {}) {
        const test = {
            name: testName,
            function: testFunction,
            suite: this.currentSuite?.name || 'Global',
            skip: options.skip || false,
            timeout: options.timeout || 5000,
            only: options.only || false
        };

        if (this.currentSuite) {
            this.currentSuite.tests.push(test);
        } else {
            this.tests.push(test);
        }
    }

    beforeEach(hookFunction) {
        if (this.currentSuite) {
            this.currentSuite.hooks.beforeEach.push(hookFunction);
        } else {
            this.hooks.beforeEach.push(hookFunction);
        }
    }

    afterEach(hookFunction) {
        if (this.currentSuite) {
            this.currentSuite.hooks.afterEach.push(hookFunction);
        } else {
            this.hooks.afterEach.push(hookFunction);
        }
    }

    beforeAll(hookFunction) {
        if (this.currentSuite) {
            this.currentSuite.hooks.beforeAll.push(hookFunction);
        } else {
            this.hooks.beforeAll.push(hookFunction);
        }
    }

    afterAll(hookFunction) {
        if (this.currentSuite) {
            this.currentSuite.hooks.afterAll.push(hookFunction);
        } else {
            this.hooks.afterAll.push(hookFunction);
        }
    }

    async runTests() {
        console.log('🚀 Starting test execution...\n');
        const startTime = performance.now();

        await this.runHooks(this.hooks.beforeAll);

        for (const [suiteName, suite] of this.suites) {
            await this.runTestSuite(suite);
        }

        if (this.tests.length > 0) {
            await this.runGlobalTests();
        }

        await this.runHooks(this.hooks.afterAll);

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        this.printResults(duration);
        return this.results;
    }

    async runTestSuite(suite) {
        console.log(`\n📁 ${suite.name}`);
        console.log('─'.repeat(50));

        await this.runHooks(suite.hooks.beforeAll);

        for (const test of suite.tests) {
            if (test.skip) {
                console.log(`  ⏭️  ${test.name} (skipped)`);
                suite.results.skipped++;
                this.results.skipped++;
                continue;
            }

            await this.runHooks(this.hooks.beforeEach);
            await this.runHooks(suite.hooks.beforeEach);

            const result = await this.runSingleTest(test);
            
            if (result.passed) {
                console.log(`  ✅ ${test.name}`);
                suite.results.passed++;
                this.results.passed++;
            } else {
                console.log(`  ❌ ${test.name}`);
                console.log(`     ${result.error}`);
                suite.results.failed++;
                this.results.failed++;
            }

            suite.results.total++;
            this.results.total++;

            await this.runHooks(suite.hooks.afterEach);
            await this.runHooks(this.hooks.afterEach);
        }

        await this.runHooks(suite.hooks.afterAll);
    }

    async runGlobalTests() {
        console.log(`\n📁 Global Tests`);
        console.log('─'.repeat(50));

        for (const test of this.tests) {
            if (test.skip) {
                console.log(`  ⏭️  ${test.name} (skipped)`);
                this.results.skipped++;
                continue;
            }

            await this.runHooks(this.hooks.beforeEach);

            const result = await this.runSingleTest(test);
            
            if (result.passed) {
                console.log(`  ✅ ${test.name}`);
                this.results.passed++;
            } else {
                console.log(`  ❌ ${test.name}`);
                console.log(`     ${result.error}`);
                this.results.failed++;
            }

            this.results.total++;

            await this.runHooks(this.hooks.afterEach);
        }
    }

    async runSingleTest(test) {
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Test timeout: ${test.timeout}ms`)), test.timeout);
            });

            const testPromise = test.function();
            
            if (testPromise && typeof testPromise.then === 'function') {
                await Promise.race([testPromise, timeoutPromise]);
            }

            return { passed: true };
        } catch (error) {
            return { 
                passed: false, 
                error: error.message || error.toString() 
            };
        }
    }

    async runHooks(hooks) {
        for (const hook of hooks) {
            try {
                await hook();
            } catch (error) {
                console.error('Hook execution failed:', error);
            }
        }
    }

    printResults(duration) {
        console.log(`\n${'='.repeat(60)}`);
        console.log('🧪 TEST RESULTS');
        console.log('='.repeat(60));
        
        const passRate = this.results.total > 0 ? 
            Math.round((this.results.passed / this.results.total) * 100) : 0;

        console.log(`📊 Summary:`);
        console.log(`   Total:   ${this.results.total}`);
        console.log(`   ✅ Passed:  ${this.results.passed}`);
        console.log(`   ❌ Failed:  ${this.results.failed}`);
        console.log(`   ⏭️  Skipped: ${this.results.skipped}`);
        console.log(`   📈 Pass Rate: ${passRate}%`);
        console.log(`   ⏱️  Duration: ${duration}ms`);

        console.log('\n📋 Suite Breakdown:');
        for (const [suiteName, suite] of this.suites) {
            const suitePassRate = suite.results.total > 0 ? 
                Math.round((suite.results.passed / suite.results.total) * 100) : 0;
            console.log(`   ${suiteName}: ${suite.results.passed}/${suite.results.total} (${suitePassRate}%)`);
        }

        console.log(`\n${'='.repeat(60)}`);
        
        if (this.results.failed === 0) {
            console.log('🎉 All tests passed!');
        } else {
            console.log(`💥 ${this.results.failed} test(s) failed.`);
        }
    }
}

export class Assert {
    static equal(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
        }
    }

    static deepEqual(actual, expected, message = '') {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
        }
    }

    static true(value, message = '') {
        if (value !== true) {
            throw new Error(`${message}\nExpected: true\nActual: ${value}`);
        }
    }

    static false(value, message = '') {
        if (value !== false) {
            throw new Error(`${message}\nExpected: false\nActual: ${value}`);
        }
    }

    static throws(fn, expectedError, message = '') {
        try {
            fn();
            throw new Error(`${message}\nExpected function to throw, but it didn't`);
        } catch (error) {
            if (expectedError && !(error instanceof expectedError)) {
                throw new Error(`${message}\nExpected: ${expectedError.name}\nActual: ${error.constructor.name}`);
            }
        }
    }

    static async throwsAsync(fn, expectedError, message = '') {
        try {
            await fn();
            throw new Error(`${message}\nExpected async function to throw, but it didn't`);
        } catch (error) {
            if (expectedError && !(error instanceof expectedError)) {
                throw new Error(`${message}\nExpected: ${expectedError.name}\nActual: ${error.constructor.name}`);
            }
        }
    }

    static greaterThan(actual, expected, message = '') {
        if (actual <= expected) {
            throw new Error(`${message}\nExpected ${actual} to be greater than ${expected}`);
        }
    }

    static lessThan(actual, expected, message = '') {
        if (actual >= expected) {
            throw new Error(`${message}\nExpected ${actual} to be less than ${expected}`);
        }
    }

    static contains(array, value, message = '') {
        if (!array.includes(value)) {
            throw new Error(`${message}\nExpected array to contain: ${value}`);
        }
    }

    static notNull(value, message = '') {
        if (value === null || value === undefined) {
            throw new Error(`${message}\nExpected value to not be null or undefined`);
        }
    }

    static isNull(value, message = '') {
        if (value !== null) {
            throw new Error(`${message}\nExpected value to be null\nActual: ${value}`);
        }
    }

    static instanceOf(object, constructor, message = '') {
        if (!(object instanceof constructor)) {
            throw new Error(`${message}\nExpected instance of ${constructor.name}\nActual: ${object.constructor.name}`);
        }
    }
}