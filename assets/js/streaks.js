class StreakManager {
    constructor(year = null, month = null) {
        this.currentStreaks = null;
        this.isLoading = false;
        this.currentYear = year !== null ? year : new Date().getFullYear();
        this.currentMonth = month !== null ? month : new Date().getMonth() + 1;
        this.init();
    }

    init() {
        this.loadCurrentStreaks();
        // Refresh streaks every 5 minutes
        setInterval(() => this.loadCurrentStreaks(), 5 * 60 * 1000);
    }

    setMonth(year, month) {
        this.currentYear = year;
        this.currentMonth = month;
        this.loadCurrentStreaks();
    }

    async loadCurrentStreaks() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const response = await fetch(`api/streaks.php?action=get_current_streaks&year=${this.currentYear}&month=${this.currentMonth}`);
            const data = await response.json();

            if (data.success) {
                this.currentStreaks = data.streaks;
                this.displayStreaks();
            } else {
                console.error('Error loading streaks:', data.message);
            }
        } catch (error) {
            console.error('Error loading streaks:', error);
        } finally {
            this.isLoading = false;
        }
    }

    displayStreaks() {
        const container = document.getElementById('streakContainer');
        if (!container || !this.currentStreaks) return;

        const streaks = this.currentStreaks;

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white/20 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold">${streaks.savers_total || 0}</div>
                    <div class="text-sm opacity-90">🌅 SAVERS</div>
                    <div class="text-xs opacity-75">activités du mois</div>
                </div>
                <div class="bg-white/20 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold">${streaks.vice_free_total || 0}</div>
                    <div class="text-sm opacity-90">🚫 Sans Vice</div>
                    <div class="text-xs opacity-75">évitances du mois</div>
                </div>
                <div class="bg-white/20 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold">${streaks.perfect_day_count || 0}</div>
                    <div class="text-sm opacity-90">⭐ Jour Parfait</div>
                    <div class="text-xs opacity-75">(11/11 points)</div>
                </div>
                <div class="bg-white/20 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold">${streaks.tracking_days || 0}</div>
                    <div class="text-sm opacity-90">📊 Tracking</div>
                    <div class="text-xs opacity-75">jours actifs</div>
                </div>
            </div>
        `;
    }

    async getBestStreaks() {
        try {
            const response = await fetch('api/streaks.php?action=get_best_streaks');
            const data = await response.json();
            return data.success ? data.best_streaks : null;
        } catch (error) {
            console.error('Error loading best streaks:', error);
            return null;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = document.querySelector('[data-auth-required="true"]');
    if (currentUser && !currentUser.style.display.includes('none')) {
        // Try to get year/month from window variables set by index.php, otherwise use current
        const year = typeof window.currentDisplayYear !== 'undefined' ? window.currentDisplayYear : new Date().getFullYear();
        const month = typeof window.currentDisplayMonth !== 'undefined' ? window.currentDisplayMonth : new Date().getMonth() + 1;
        window.streakManager = new StreakManager(year, month);
    }
});

// Global function for manual refresh
window.refreshStreaks = function() {
    if (window.streakManager) {
        window.streakManager.loadCurrentStreaks();
    }
};
