import { GameConfig } from '../config/GameConfig.js';

export class WinningLogic {
    constructor() {
        this.payTable = GameConfig.PAY_TABLE;
        this.payLines = GameConfig.PAY_LINES;
        this.minMatchCount = GameConfig.GAME_RULES.MIN_MATCH_COUNT;
    }

    calculateWins(symbols) {
        let totalWins = 0;
        const winDetails = [];

        this.payLines.forEach((payLine, payLineIndex) => {
            const lineSymbols = payLine.map(([row, col]) => symbols[row][col]);
            const winResult = this.checkPayLine(lineSymbols, payLineIndex + 1);
            
            if (winResult) {
                totalWins += winResult.payout;
                winDetails.push(winResult);
            }
        });

        return {
            totalWins,
            winDetails
        };
    }

    checkPayLine(lineSymbols, payLineNumber) {
        const firstSymbol = lineSymbols[0];
        let matchCount = 1;

        for (let i = 1; i < lineSymbols.length; i++) {
            if (lineSymbols[i] === firstSymbol) {
                matchCount++;
            } else {
                break;
            }
        }

        if (matchCount >= this.minMatchCount && this.payTable[firstSymbol]) {
            const payout = this.payTable[firstSymbol][matchCount] || 0;
            if (payout > 0) {
                return {
                    payLine: payLineNumber,
                    symbol: firstSymbol,
                    count: matchCount,
                    payout: payout
                };
            }
        }

        return null;
    }

    formatWinDisplay(totalWins, winDetails) {
        let winString = `Total wins: ${totalWins}`;
        
        if (winDetails.length > 0) {
            winString += '\n';
            winDetails.forEach(win => {
                winString += `- payline ${win.payLine}, ${win.symbol} x${win.count}, ${win.payout}\n`;
            });
        }

        return winString;
    }

    getPayTable() {
        return this.payTable;
    }

    getPayLines() {
        return this.payLines;
    }

    validateSymbols(symbols) {
        if (!symbols || symbols.length !== GameConfig.REELS.ROWS) {
            throw new Error('Invalid symbols array structure');
        }

        for (let row = 0; row < symbols.length; row++) {
            if (!symbols[row] || symbols[row].length !== GameConfig.REELS.COLUMNS) {
                throw new Error(`Invalid symbols row ${row} structure`);
            }
        }

        return true;
    }
}