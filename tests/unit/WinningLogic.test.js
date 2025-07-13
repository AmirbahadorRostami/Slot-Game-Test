import { TestFramework, Assert } from '../TestFramework.js';
import { WinningLogic } from '../../src/services/WinningLogic.js';
import { TestData, setupTestEnvironment } from '../utils/TestMocks.js';

setupTestEnvironment();

const framework = new TestFramework();
const { describe, it, beforeEach } = framework;

describe('WinningLogic', () => {
    let winningLogic;
    let mockConfig;

    beforeEach(() => {
        mockConfig = TestData.getMockGameConfig();
        
        global.GameConfig = mockConfig;
        winningLogic = new WinningLogic();
    });

    describe('calculateWins', () => {
        it('should calculate wins correctly for winning symbols', () => {
            const symbols = TestData.getWinningSymbols();
            const result = winningLogic.calculateWins(symbols);

            Assert.greaterThan(result.totalWins, 0, 'Should have wins');
            Assert.true(Array.isArray(result.winDetails), 'Should return win details array');
            Assert.greaterThan(result.winDetails.length, 0, 'Should have win details');
        });

        it('should return zero wins for non-winning symbols', () => {
            const symbols = TestData.getNoWinSymbols();
            const result = winningLogic.calculateWins(symbols);

            Assert.equal(result.totalWins, 0, 'Should have no wins');
            Assert.equal(result.winDetails.length, 0, 'Should have no win details');
        });

        it('should calculate correct payout for 5 of a kind', () => {
            const symbols = [
                ['hv1', 'hv1', 'hv1', 'hv1', 'hv1'],
                ['lv2', 'lv3', 'lv4', 'hv2', 'hv3'],
                ['lv3', 'lv4', 'hv4', 'hv4', 'hv4']
            ];
            
            const result = winningLogic.calculateWins(symbols);
            const hv1Win = result.winDetails.find(win => win.symbol === 'hv1' && win.count === 5);
            
            Assert.notNull(hv1Win, 'Should find hv1 5-of-a-kind win');
            Assert.equal(hv1Win.payout, 50, 'Should have correct payout for hv1 5-of-a-kind');
        });

        it('should validate symbols array structure', () => {
            Assert.throws(() => {
                winningLogic.validateSymbols(null);
            }, Error, 'Should throw error for null symbols');

            Assert.throws(() => {
                winningLogic.validateSymbols([]);
            }, Error, 'Should throw error for empty symbols');

            Assert.throws(() => {
                winningLogic.validateSymbols([['hv1'], ['hv2']]);
            }, Error, 'Should throw error for incorrect structure');
        });
    });

    describe('checkPayLine', () => {
        it('should detect 3 of a kind', () => {
            const lineSymbols = ['hv1', 'hv1', 'hv1', 'hv2', 'hv3'];
            const result = winningLogic.checkPayLine(lineSymbols, 1);

            Assert.notNull(result, 'Should detect 3 of a kind');
            Assert.equal(result.symbol, 'hv1', 'Should identify correct symbol');
            Assert.equal(result.count, 3, 'Should count correctly');
            Assert.equal(result.payLine, 1, 'Should set correct payline number');
        });

        it('should detect 4 of a kind', () => {
            const lineSymbols = ['hv2', 'hv2', 'hv2', 'hv2', 'lv1'];
            const result = winningLogic.checkPayLine(lineSymbols, 2);

            Assert.notNull(result, 'Should detect 4 of a kind');
            Assert.equal(result.count, 4, 'Should count correctly');
            Assert.equal(result.payout, 10, 'Should have correct payout');
        });

        it('should detect 5 of a kind', () => {
            const lineSymbols = ['lv1', 'lv1', 'lv1', 'lv1', 'lv1'];
            const result = winningLogic.checkPayLine(lineSymbols, 3);

            Assert.notNull(result, 'Should detect 5 of a kind');
            Assert.equal(result.count, 5, 'Should count correctly');
            Assert.equal(result.payout, 10, 'Should have correct payout');
        });

        it('should return null for less than 3 matches', () => {
            const lineSymbols = ['hv1', 'hv1', 'hv2', 'hv3', 'hv4'];
            const result = winningLogic.checkPayLine(lineSymbols, 1);

            Assert.isNull(result, 'Should return null for insufficient matches');
        });

        it('should return null for non-consecutive matches', () => {
            const lineSymbols = ['hv1', 'hv2', 'hv1', 'hv1', 'hv1'];
            const result = winningLogic.checkPayLine(lineSymbols, 1);

            Assert.isNull(result, 'Should return null for non-consecutive matches');
        });
    });

    describe('formatWinDisplay', () => {
        it('should format win display correctly', () => {
            const totalWins = 25;
            const winDetails = [
                { payLine: 1, symbol: 'hv1', count: 3, payout: 10 },
                { payLine: 2, symbol: 'hv2', count: 4, payout: 15 }
            ];

            const result = winningLogic.formatWinDisplay(totalWins, winDetails);

            Assert.contains(result, 'Total wins: 25', 'Should include total wins');
            Assert.contains(result, 'payline 1', 'Should include payline info');
            Assert.contains(result, 'hv1 x3', 'Should include symbol and count');
        });

        it('should format zero wins correctly', () => {
            const result = winningLogic.formatWinDisplay(0, []);
            Assert.equal(result, 'Total wins: 0', 'Should show zero wins');
        });
    });

    describe('getters', () => {
        it('should return pay table', () => {
            const payTable = winningLogic.getPayTable();
            Assert.notNull(payTable, 'Should return pay table');
            Assert.notNull(payTable.hv1, 'Should contain hv1 symbol');
        });

        it('should return pay lines', () => {
            const payLines = winningLogic.getPayLines();
            Assert.true(Array.isArray(payLines), 'Should return array');
            Assert.greaterThan(payLines.length, 0, 'Should have pay lines');
        });
    });
});

export { framework };