class ChallengeManager {
    constructor() {
        this.currentChallenge = null;
        console.log('ChallengeManager initialized');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChallenges();
    }

    setupEventListeners() {
        // Create challenge form
        const createForm = document.getElementById('createChallengeForm');
        if (createForm) {
            createForm.addEventListener('submit', (e) => this.handleCreateChallenge(e));
        }

        // Enhance with AI button
        const enhanceBtn = document.getElementById('enhanceDescriptionBtn');
        if (enhanceBtn) {
            enhanceBtn.addEventListener('click', () => this.enhanceDescription());
        }
    }

    async loadChallenges(status = null) {
        try {
            const url = status 
                ? `api/challenges.php?action=list&status=${status}`
                : 'api/challenges.php?action=list';
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                this.displayChallenges(data.challenges);
            } else {
                console.error('Error loading challenges:', data.message);
            }
        } catch (error) {
            console.error('Error loading challenges:', error);
        }
    }

    displayChallenges(challenges) {
        const container = document.getElementById('challengesContainer');
        if (!container) return;

        if (challenges.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">🎯</div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Aucun challenge actif</h3>
                    <p class="text-gray-600 mb-4">Crée ton premier challenge pour commencer ta transformation</p>
                    <button onclick="challengeManager.showCreateModal()" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold">
                        ✨ Créer un Challenge
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = challenges.map(challenge => this.createChallengeCard(challenge)).join('');
    }

    createChallengeCard(challenge) {
        const progress = challenge.progress || {};
        const isActive = challenge.status === 'active';
        const isCompleted = challenge.status === 'completed';
        const isFailed = challenge.status === 'failed';
        
        const statusBadge = isCompleted 
            ? '<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">✅ Complété</span>'
            : isFailed
            ? '<span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">❌ Échoué</span>'
            : '<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">🔥 En cours</span>';

        const today = new Date().toISOString().split('T')[0];
        const canCheckIn = isActive && today >= challenge.start_date && today <= challenge.end_date;

        return `
            <div class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-gray-800 mb-2">${this.escapeHtml(challenge.title)}</h3>
                        ${statusBadge}
                    </div>
                    <button onclick="challengeManager.showChallengeDetails(${challenge.id})" 
                            class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                </div>
                
                ${challenge.description ? `
                    <p class="text-gray-600 mb-4 line-clamp-2">${this.escapeHtml(challenge.description)}</p>
                ` : ''}
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="text-2xl font-bold text-indigo-600">${challenge.duration_days}</div>
                        <div class="text-sm text-gray-600">Jours total</div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">${progress.success_days || 0}</div>
                        <div class="text-sm text-gray-600">Jours réussis</div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progression</span>
                        <span>${progress.completion_rate || 0}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-indigo-600 h-2 rounded-full transition-all" 
                             style="width: ${progress.completion_rate || 0}%"></div>
                    </div>
                </div>
                
                ${progress.current_streak > 0 ? `
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                        <div class="flex items-center">
                            <span class="text-2xl mr-2">🔥</span>
                            <div>
                                <div class="font-bold text-orange-800">${progress.current_streak} jour${progress.current_streak > 1 ? 's' : ''} consécutif${progress.current_streak > 1 ? 's' : ''}</div>
                                <div class="text-sm text-orange-600">Record: ${progress.longest_streak} jours</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <div class="flex gap-2">
                    ${canCheckIn ? `
                        <button onclick="challengeManager.quickCheckIn(${challenge.id})" 
                                class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold">
                            ✅ Check-in Aujourd'hui
                        </button>
                    ` : ''}
                    <button onclick="challengeManager.showChallengeDetails(${challenge.id})" 
                            class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-semibold">
                        📊 Détails
                    </button>
                </div>
            </div>
        `;
    }

    async handleCreateChallenge(e) {
        e.preventDefault();
        
        const title = document.getElementById('challengeTitle').value;
        const description = document.getElementById('challengeDescription').value;
        const durationDays = document.getElementById('challengeDuration').value;
        const startDate = document.getElementById('challengeStartDate').value;
        
        const formData = new FormData();
        formData.append('action', 'create');
        formData.append('title', title);
        formData.append('description', description);
        formData.append('duration_days', durationDays);
        if (startDate) {
            formData.append('start_date', startDate);
        }
        
        try {
            const response = await fetch('api/challenges.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.hideCreateModal();
                this.loadChallenges();
                this.showNotification('Challenge créé avec succès! 🎉', 'success');
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error creating challenge:', error);
            this.showNotification('Erreur lors de la création', 'error');
        }
    }

    async enhanceDescription() {
        const titleInput = document.getElementById('challengeTitle');
        const descriptionInput = document.getElementById('challengeDescription');
        const enhanceBtn = document.getElementById('enhanceDescriptionBtn');
        
        const title = titleInput.value;
        const description = descriptionInput.value;
        
        if (!title && !description) {
            this.showNotification('Entrez au moins un titre ou une description', 'error');
            return;
        }
        
        // Show loading state
        const originalText = enhanceBtn.textContent;
        enhanceBtn.textContent = '✨ Amélioration en cours...';
        enhanceBtn.disabled = true;
        
        const formData = new FormData();
        formData.append('action', 'enhance_description');
        formData.append('title', title);
        formData.append('description', description);
        
        try {
            const response = await fetch('api/challenges.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                descriptionInput.value = data.description;
                this.showNotification('Description améliorée! ✨', 'success');
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error enhancing description:', error);
            this.showNotification('Erreur lors de l\'amélioration', 'error');
        } finally {
            enhanceBtn.textContent = originalText;
            enhanceBtn.disabled = false;
        }
    }

    async quickCheckIn(challengeId) {
        const formData = new FormData();
        formData.append('action', 'check_in');
        formData.append('challenge_id', challengeId);
        formData.append('date', new Date().toISOString().split('T')[0]);
        formData.append('status', 'success');
        
        try {
            const response = await fetch('api/challenges.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.loadChallenges();
                this.showNotification('Check-in enregistré! 🎉', 'success');
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error checking in:', error);
            this.showNotification('Erreur lors du check-in', 'error');
        }
    }

    async showChallengeDetails(challengeId) {
        try {
            const response = await fetch(`api/challenges.php?action=get&id=${challengeId}`);
            const data = await response.json();
            
            if (data.success) {
                this.displayChallengeDetails(data.challenge, data.check_ins, data.progress);
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error loading challenge details:', error);
            this.showNotification('Erreur lors du chargement', 'error');
        }
    }

    displayChallengeDetails(challenge, checkIns, progress) {
        const modal = document.getElementById('challengeDetailsModal');
        if (!modal) return;
        
        const checkInMap = {};
        checkIns.forEach(ci => {
            checkInMap[ci.date] = ci;
        });
        
        // Generate calendar grid
        let calendarHtml = '<div class="grid grid-cols-7 gap-2 mt-4">';
        
        const startDate = new Date(challenge.start_date);
        const endDate = new Date(challenge.end_date);
        const today = new Date().toISOString().split('T')[0];
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const checkIn = checkInMap[dateStr];
            const isPast = dateStr < today;
            const isToday = dateStr === today;
            
            let bgClass = 'bg-gray-100';
            let icon = '⚪';
            
            if (checkIn) {
                if (checkIn.status === 'success') {
                    bgClass = 'bg-green-100 border-green-500';
                    icon = '✅';
                } else if (checkIn.status === 'fail') {
                    bgClass = 'bg-red-100 border-red-500';
                    icon = '❌';
                } else {
                    bgClass = 'bg-gray-200';
                    icon = '⏭️';
                }
            } else if (isPast) {
                bgClass = 'bg-gray-200';
                icon = '⚫';
            } else if (isToday) {
                bgClass = 'bg-blue-100 border-blue-500';
                icon = '📍';
            }
            
            const dayNum = d.getDate();
            calendarHtml += `
                <div class="${bgClass} border-2 rounded-lg p-2 text-center ${isToday ? 'ring-2 ring-blue-400' : ''}">
                    <div class="text-2xl">${icon}</div>
                    <div class="text-xs text-gray-600 mt-1">${dayNum}</div>
                </div>
            `;
        }
        calendarHtml += '</div>';
        
        const detailsHtml = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">${this.escapeHtml(challenge.title)}</h2>
                    <button onclick="challengeManager.hideDetailsModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                ${challenge.description ? `
                    <div class="bg-gray-50 rounded-lg p-4 mb-4">
                        <p class="text-gray-700">${this.escapeHtml(challenge.description)}</p>
                    </div>
                ` : ''}
                
                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-indigo-600">${progress.success_days}</div>
                        <div class="text-sm text-gray-600">Jours réussis</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-orange-600">${progress.current_streak}</div>
                        <div class="text-sm text-gray-600">Série actuelle</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-600">${progress.completion_rate}%</div>
                        <div class="text-sm text-gray-600">Complété</div>
                    </div>
                </div>
                
                <h3 class="font-semibold text-gray-800 mb-2">📅 Calendrier de progression</h3>
                ${calendarHtml}
                
                <div class="mt-4 text-sm text-gray-600">
                    <div class="flex items-center gap-4">
                        <span>✅ Réussi</span>
                        <span>❌ Échoué</span>
                        <span>⚫ Non fait</span>
                        <span>📍 Aujourd'hui</span>
                    </div>
                </div>
                
                ${challenge.status === 'active' ? `
                    <div class="mt-6 flex gap-2">
                        <button onclick="challengeManager.recordCheckIn(${challenge.id}, 'success')" 
                                class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold">
                            ✅ Réussi aujourd'hui
                        </button>
                        <button onclick="challengeManager.recordCheckIn(${challenge.id}, 'fail')" 
                                class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold">
                            ❌ Échoué aujourd'hui
                        </button>
                    </div>
                ` : ''}
                
                <div class="mt-4 flex gap-2">
                    ${challenge.status === 'active' ? `
                        <button onclick="challengeManager.archiveChallenge(${challenge.id})" 
                                class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm">
                            📦 Archiver
                        </button>
                    ` : ''}
                    <button onclick="challengeManager.deleteChallenge(${challenge.id})" 
                            class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('challengeDetailsContent').innerHTML = detailsHtml;
        modal.classList.remove('hidden');
    }

    async recordCheckIn(challengeId, status) {
        const formData = new FormData();
        formData.append('action', 'check_in');
        formData.append('challenge_id', challengeId);
        formData.append('date', new Date().toISOString().split('T')[0]);
        formData.append('status', status);
        
        try {
            const response = await fetch('api/challenges.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.hideDetailsModal();
                this.loadChallenges();
                this.showNotification('Check-in enregistré! 🎉', 'success');
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error recording check-in:', error);
            this.showNotification('Erreur lors du check-in', 'error');
        }
    }

    async deleteChallenge(challengeId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce challenge?')) {
            return;
        }
        
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('challenge_id', challengeId);
        
        try {
            const response = await fetch('api/challenges.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.hideDetailsModal();
                this.loadChallenges();
                this.showNotification('Challenge supprimé', 'success');
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting challenge:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }

    async archiveChallenge(challengeId) {
        const formData = new FormData();
        formData.append('action', 'archive');
        formData.append('challenge_id', challengeId);
        
        try {
            const response = await fetch('api/challenges.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.hideDetailsModal();
                this.loadChallenges();
                this.showNotification('Challenge archivé', 'success');
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error archiving challenge:', error);
            this.showNotification('Erreur lors de l\'archivage', 'error');
        }
    }

    showCreateModal() {
        const modal = document.getElementById('createChallengeModal');
        if (modal) {
            modal.classList.remove('hidden');
            // Set default start date to today
            document.getElementById('challengeStartDate').value = new Date().toISOString().split('T')[0];
        }
    }

    hideCreateModal() {
        const modal = document.getElementById('createChallengeModal');
        if (modal) {
            modal.classList.add('hidden');
            document.getElementById('createChallengeForm').reset();
        }
    }

    hideDetailsModal() {
        const modal = document.getElementById('challengeDetailsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            'bg-blue-600'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
let challengeManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        challengeManager = new ChallengeManager();
    });
} else {
    challengeManager = new ChallengeManager();
}
