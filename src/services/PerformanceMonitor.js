export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            frameRate: {
                current: 0,
                average: 0,
                min: 60,
                max: 0,
                samples: []
            },
            memory: {
                used: 0,
                total: 0,
                peak: 0
            },
            rendering: {
                drawCalls: 0,
                textureSwaps: 0,
                verticesDrawn: 0,
                batchesDrawn: 0
            },
            gameSpecific: {
                spinsPerformed: 0,
                symbolsUpdated: 0,
                winsCalculated: 0
            }
        };
        
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        this.frameCount = 0;
        this.sampleSize = 60;
        this.isMonitoring = false;
        this.monitoringInterval = null;
    }

    startMonitoring(updateInterval = 1000) {
        if (this.isMonitoring) {
            console.warn('Performance monitoring is already active');
            return;
        }

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.updateMetrics();
        }, updateInterval);

        console.log('Performance monitoring started');
    }

    stopMonitoring() {
        if (!this.isMonitoring) {
            console.warn('Performance monitoring is not active');
            return;
        }

        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        console.log('Performance monitoring stopped');
    }

    updateMetrics() {
        this.updateFrameRate();
        this.updateMemoryUsage();
    }

    updateFrameRate() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        if (deltaTime > 0) {
            const fps = 1000 / deltaTime;
            this.metrics.frameRate.current = fps;
            
            this.metrics.frameRate.samples.push(fps);
            if (this.metrics.frameRate.samples.length > this.sampleSize) {
                this.metrics.frameRate.samples.shift();
            }
            
            this.metrics.frameRate.average = this.metrics.frameRate.samples.reduce((a, b) => a + b, 0) / this.metrics.frameRate.samples.length;
            this.metrics.frameRate.min = Math.min(this.metrics.frameRate.min, fps);
            this.metrics.frameRate.max = Math.max(this.metrics.frameRate.max, fps);
        }
        
        this.lastFrameTime = currentTime;
        this.frameCount++;
    }

    updateMemoryUsage() {
        if (performance.memory) {
            this.metrics.memory.used = performance.memory.usedJSHeapSize / 1024 / 1024;
            this.metrics.memory.total = performance.memory.totalJSHeapSize / 1024 / 1024;
            this.metrics.memory.peak = Math.max(this.metrics.memory.peak, this.metrics.memory.used);
        }
    }

    recordRenderingMetrics(drawCalls, textureSwaps, verticesDrawn, batchesDrawn) {
        this.metrics.rendering.drawCalls = drawCalls;
        this.metrics.rendering.textureSwaps = textureSwaps;
        this.metrics.rendering.verticesDrawn = verticesDrawn;
        this.metrics.rendering.batchesDrawn = batchesDrawn;
    }

    recordGameEvent(eventType, data = {}) {
        switch (eventType) {
            case 'spin':
                this.metrics.gameSpecific.spinsPerformed++;
                break;
            case 'symbolUpdate':
                this.metrics.gameSpecific.symbolsUpdated += data.count || 1;
                break;
            case 'winCalculation':
                this.metrics.gameSpecific.winsCalculated++;
                break;
        }
    }

    getMetrics() {
        return {
            ...this.metrics,
            uptime: (performance.now() - this.startTime) / 1000,
            totalFrames: this.frameCount,
            isMonitoring: this.isMonitoring
        };
    }

    getFormattedMetrics() {
        const metrics = this.getMetrics();
        
        return {
            'Frame Rate': {
                'Current FPS': Math.round(metrics.frameRate.current),
                'Average FPS': Math.round(metrics.frameRate.average),
                'Min FPS': Math.round(metrics.frameRate.min),
                'Max FPS': Math.round(metrics.frameRate.max)
            },
            'Memory Usage': {
                'Used (MB)': Math.round(metrics.memory.used * 100) / 100,
                'Total (MB)': Math.round(metrics.memory.total * 100) / 100,
                'Peak (MB)': Math.round(metrics.memory.peak * 100) / 100
            },
            'Rendering': {
                'Draw Calls': metrics.rendering.drawCalls,
                'Texture Swaps': metrics.rendering.textureSwaps,
                'Vertices Drawn': metrics.rendering.verticesDrawn,
                'Batches Drawn': metrics.rendering.batchesDrawn
            },
            'Game Stats': {
                'Spins Performed': metrics.gameSpecific.spinsPerformed,
                'Symbols Updated': metrics.gameSpecific.symbolsUpdated,
                'Wins Calculated': metrics.gameSpecific.winsCalculated
            },
            'System': {
                'Uptime (s)': Math.round(metrics.uptime),
                'Total Frames': metrics.totalFrames,
                'Monitoring': metrics.isMonitoring
            }
        };
    }

    logMetrics() {
        const formatted = this.getFormattedMetrics();
        console.group('Performance Metrics');
        
        for (const [category, data] of Object.entries(formatted)) {
            console.group(category);
            for (const [key, value] of Object.entries(data)) {
                console.log(`${key}: ${value}`);
            }
            console.groupEnd();
        }
        
        console.groupEnd();
    }

    getPerformanceWarnings() {
        const warnings = [];
        const metrics = this.getMetrics();
        
        if (metrics.frameRate.average < 30) {
            warnings.push('Low average frame rate detected');
        }
        
        if (metrics.memory.used > 100) {
            warnings.push('High memory usage detected');
        }
        
        if (metrics.rendering.drawCalls > 1000) {
            warnings.push('High number of draw calls');
        }
        
        if (metrics.rendering.textureSwaps > 100) {
            warnings.push('High number of texture swaps');
        }
        
        return warnings;
    }

    exportMetrics() {
        const metrics = this.getMetrics();
        const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-metrics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    reset() {
        this.metrics = {
            frameRate: {
                current: 0,
                average: 0,
                min: 60,
                max: 0,
                samples: []
            },
            memory: {
                used: 0,
                total: 0,
                peak: 0
            },
            rendering: {
                drawCalls: 0,
                textureSwaps: 0,
                verticesDrawn: 0,
                batchesDrawn: 0
            },
            gameSpecific: {
                spinsPerformed: 0,
                symbolsUpdated: 0,
                winsCalculated: 0
            }
        };
        
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        this.frameCount = 0;
    }

    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'performance-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            min-width: 200px;
        `;
        
        document.body.appendChild(panel);
        
        const updatePanel = () => {
            const formatted = this.getFormattedMetrics();
            panel.innerHTML = `
                <div><strong>Performance Monitor</strong></div>
                <div>FPS: ${formatted['Frame Rate']['Current FPS']}</div>
                <div>Avg FPS: ${formatted['Frame Rate']['Average FPS']}</div>
                <div>Memory: ${formatted['Memory Usage']['Used (MB)']} MB</div>
                <div>Spins: ${formatted['Game Stats']['Spins Performed']}</div>
                <div>Uptime: ${formatted['System']['Uptime (s)']}s</div>
            `;
        };
        
        setInterval(updatePanel, 1000);
        return panel;
    }
}