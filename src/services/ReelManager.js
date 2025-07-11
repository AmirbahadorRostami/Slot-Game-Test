import { GameConfig } from '../config/GameConfig.js';

export class ReelManager {
    constructor() {
        this.reelBands = GameConfig.REELS.BANDS;
        this.reelPositions = [...GameConfig.REELS.INITIAL_POSITIONS];
        this.columns = GameConfig.REELS.COLUMNS;
        this.rows = GameConfig.REELS.ROWS;
    }

    spin() {
        for (let i = 0; i < this.columns; i++) {
            this.reelPositions[i] = Math.floor(Math.random() * this.reelBands[i].length);
        }
        return this.reelPositions;
    }

    getVisibleSymbols() {
        const symbols = [];
        for (let row = 0; row < this.rows; row++) {
            symbols[row] = [];
            for (let col = 0; col < this.columns; col++) {
                const bandIndex = (this.reelPositions[col] + row) % this.reelBands[col].length;
                symbols[row][col] = this.reelBands[col][bandIndex];
            }
        }
        return symbols;
    }

    getSymbolAt(column, row) {
        if (column < 0 || column >= this.columns || row < 0 || row >= this.rows) {
            throw new Error(`Invalid position: column ${column}, row ${row}`);
        }
        
        const bandIndex = (this.reelPositions[column] + row) % this.reelBands[column].length;
        return this.reelBands[column][bandIndex];
    }

    setReelPosition(column, position) {
        if (column < 0 || column >= this.columns) {
            throw new Error(`Invalid column: ${column}`);
        }
        
        if (position < 0 || position >= this.reelBands[column].length) {
            throw new Error(`Invalid position: ${position} for column ${column}`);
        }
        
        this.reelPositions[column] = position;
    }

    getReelPosition(column) {
        if (column < 0 || column >= this.columns) {
            throw new Error(`Invalid column: ${column}`);
        }
        
        return this.reelPositions[column];
    }

    getAllReelPositions() {
        return [...this.reelPositions];
    }

    reset() {
        this.reelPositions = [...GameConfig.REELS.INITIAL_POSITIONS];
    }

    getReelBand(column) {
        if (column < 0 || column >= this.columns) {
            throw new Error(`Invalid column: ${column}`);
        }
        
        return [...this.reelBands[column]];
    }

    getAllReelBands() {
        return this.reelBands.map(band => [...band]);
    }

    getReelBandLength(column) {
        if (column < 0 || column >= this.columns) {
            throw new Error(`Invalid column: ${column}`);
        }
        
        return this.reelBands[column].length;
    }

    validateReelState() {
        if (this.reelPositions.length !== this.columns) {
            throw new Error('Reel positions array length mismatch');
        }
        
        for (let i = 0; i < this.columns; i++) {
            if (this.reelPositions[i] < 0 || this.reelPositions[i] >= this.reelBands[i].length) {
                throw new Error(`Invalid reel position at column ${i}: ${this.reelPositions[i]}`);
            }
        }
        
        return true;
    }
}