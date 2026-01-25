<!-- Login Modal -->
<?php if (!$currentUser): ?>
<div id="loginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden modal-backdrop">
    <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 modal-content">
        <div class="flex justify-between items-center mb-6">
            <h2 id="modalTitle" class="text-2xl font-bold text-gray-800">Connexion</h2>
            <button onclick="closeLoginModal()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <form id="authForm" method="POST" action="javascript:void(0);">
            <div class="space-y-4">
                <div id="nameField" class="hidden">
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input type="text" id="name" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Votre nom">
                </div>
                
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="votre@email.com">
                </div>
                
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                    <input type="password" id="password" name="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••">
                </div>
            </div>
            
            <div id="authMessage" class="hidden mt-4 p-3 rounded-lg"></div>
            
            <div class="mt-6 space-y-3">
                <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    <span id="submitText">Se connecter</span>
                </button>
                
                <button type="button" id="toggleButton" onclick="toggleAuthMode()" class="w-full text-indigo-600 hover:text-indigo-800 text-sm">
                    Pas de compte ? S'inscrire
                </button>
            </div>
        </form>
    </div>
</div>
<?php endif; ?>

<!-- Day Modal -->
<?php if ($currentUser): ?>
<div id="dayModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden modal-backdrop">
    <div class="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 modal-content max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
            <h2 id="dayModalTitle" class="text-2xl font-bold text-gray-800">Détails du jour</h2>
            <button onclick="closeDayModal()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <!-- Daily Affirmation Display -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6 text-center">
            <h3 class="text-lg font-semibold text-purple-700 mb-3">🌟 Affirmation du Jour</h3>
            <p id="daily_affirmation_display" class="text-purple-600 italic text-lg leading-relaxed">
                "Chargement de votre affirmation..."
            </p>
        </div>
        
        <form id="dayForm" class="space-y-6">
            <input type="hidden" id="dayDate" name="date">
            
            <!-- SAVERS Section -->
            <div class="bg-indigo-50 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-indigo-700 mb-4 flex items-center">
                    🌅 SAVERS (Miracle Morning)
                    <span class="ml-3 text-sm font-normal text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full" id="savers-score">0/6</span>
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-indigo-100 p-3 rounded-lg transition-colors">
                        <input type="checkbox" name="savers_silence" id="savers_silence" class="checkbox-custom" onclick="updateScores()">
                        <div>
                            <div class="font-semibold text-indigo-700">🧘 Silence</div>
                            <div class="text-sm text-indigo-600">Méditation, respiration, prière</div>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-indigo-100 p-3 rounded-lg transition-colors">
                        <input type="checkbox" name="savers_affirmations" id="savers_affirmations" class="checkbox-custom" onclick="updateScores()">
                        <div>
                            <div class="font-semibold text-indigo-700">💬 Affirmations</div>
                            <div class="text-sm text-indigo-600">Mantras positifs, auto-suggestion</div>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-indigo-100 p-3 rounded-lg transition-colors">
                        <input type="checkbox" name="savers_visualization" id="savers_visualization" class="checkbox-custom" onclick="updateScores()">
                        <div>
                            <div class="font-semibold text-indigo-700">👁️ Visualisation</div>
                            <div class="text-sm text-indigo-600">Vision de tes objectifs</div>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-indigo-100 p-3 rounded-lg transition-colors">
                        <input type="checkbox" name="savers_exercise" id="savers_exercise" class="checkbox-custom" onclick="updateScores()">
                        <div>
                            <div class="font-semibold text-indigo-700">🏃 Exercise</div>
                            <div class="text-sm text-indigo-600">Sport, yoga, étirements</div>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-indigo-100 p-3 rounded-lg transition-colors">
                        <input type="checkbox" name="savers_reading" id="savers_reading" class="checkbox-custom" onclick="updateScores()">
                        <div>
                            <div class="font-semibold text-indigo-700">📚 Reading</div>
                            <div class="text-sm text-indigo-600">Lecture, apprentissage</div>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-indigo-100 p-3 rounded-lg transition-colors">
                        <input type="checkbox" name="savers_scribing" id="savers_scribing" class="checkbox-custom" onclick="updateScores()">
                        <div>
                            <div class="font-semibold text-indigo-700">✍️ Scribing</div>
                            <div class="text-sm text-indigo-600">Journal, écriture</div>
                        </div>
                    </label>
                </div>
            </div>
            
            <!-- Vices Section -->
            <div class="bg-red-50 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-red-700 mb-4 flex items-center">
                    🚫 Zéro Vice (Journée Clean)
                    <span class="ml-3 text-sm font-normal text-red-600 bg-red-100 px-2 py-1 rounded-full" id="vices-score">0/5</span>
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-red-100 p-3 rounded-lg transition-colors">
                        <input type="checkbox" name="vice_free_coke" id="vice_free_coke" class="checkbox-custom" onclick="updateScores()">
                        <div>
                            <div class="font-semibold text-red-700">🥤 Sans Coca/Sodas</div>
                            <div class="text-sm text-red-600">Zéro sucre industriel</div>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-red-100 p-3 rounded-lg transition-colors">
                        <input type="checkbox" name="vice_free_beer" id="vice_free_beer" class="checkbox-custom" onclick="updateScores()">
                        <div>
                            <div class="font-semibold text-red-700">🍺 Sans Bière/Alcool</div>
                            <div class="text-sm text-red-600">Esprit clair et alerte</div>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-red-100 p-3 rounded-lg transition-colors">
                        <input type="checkbox" name="vice_free_weed" id="vice_free_weed" class="checkbox-custom" onclick="updateScores()">
                        <div>
                            <div class="font-semibold text-red-700">🌿 Sans Cannabis</div>
                            <div class="text-sm text-red-600">Clarté mentale pure</div>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-red-100 p-3 rounded-lg transition-colors">
                        <input type="checkbox" name="vice_free_sns" id="vice_free_sns" class="checkbox-custom" onclick="updateScores()">
                        <div>
                            <div class="font-semibold text-red-700">📱 SNS Limité</div>
                            <div class="text-sm text-red-600">Moins de 30min/jour</div>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-red-100 p-3 rounded-lg transition-colors">
                        <input type="checkbox" name="vice_free_porn" id="vice_free_porn" class="checkbox-custom" onclick="updateScores()">
                        <div>
                            <div class="font-semibold text-red-700">🔞 Sans Porno</div>
                            <div class="text-sm text-red-600">Énergie pure et focalisée</div>
                        </div>
                    </label>
                </div>
            </div>
            
            <!-- Well-being Section -->
            <div class="bg-green-50 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-green-700 mb-4">📊 État du Jour</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-green-700 mb-2">🌈 Humeur (1-10)</label>
                        <select name="mood_rating" id="mood_rating" class="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                            <option value="">Non renseigné</option>
                            <?php for($i = 1; $i <= 10; $i++): ?>
                                <option value="<?= $i ?>"><?= $i ?> <?= $i <= 3 ? '😞' : ($i <= 6 ? '😐' : '😊') ?></option>
                            <?php endfor; ?>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-green-700 mb-2">⚡ Énergie (1-10)</label>
                        <select name="energy_level" id="energy_level" class="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                            <option value="">Non renseigné</option>
                            <?php for($i = 1; $i <= 10; $i++): ?>
                                <option value="<?= $i ?>"><?= $i ?> <?= $i <= 3 ? '🔋' : ($i <= 6 ? '🔋🔋' : '🔋🔋🔋') ?></option>
                            <?php endfor; ?>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Notes Section -->
            <div class="bg-yellow-50 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-yellow-700 mb-4">📝 Notes & Réflexions</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-yellow-700 mb-2">💭 Affirmation personnelle du jour</label>
                        <textarea name="daily_affirmation" id="daily_affirmation" rows="2" 
                                  class="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                                  placeholder="Quelle affirmation va te porter aujourd'hui ?"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-yellow-700 mb-2">📔 Notes libres</label>
                        <textarea name="notes" id="notes" rows="4" 
                                  class="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                                  placeholder="Victoires, défis, réflexions du jour..."></textarea>
                    </div>
                </div>
            </div>
            
            <!-- Custom Trackers Section -->
            <div class="bg-teal-50 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-teal-700 mb-4 flex items-center justify-between">
                    <span>📊 Mes Trackers Personnalisés</span>
                    <button type="button" onclick="openTrackerSelector()" class="text-sm bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700">
                        + Ajouter
                    </button>
                </h3>
                
                <!-- Tracker Selector Modal (hidden by default) -->
                <div id="trackerSelectorModal" class="hidden mb-4 p-4 bg-white rounded-lg border border-teal-200">
                    <h4 class="font-semibold text-teal-700 mb-3">Sélectionner un tracker existant ou en créer un nouveau</h4>
                    
                    <!-- Existing trackers list -->
                    <div id="existingTrackersList" class="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        <p class="text-sm text-gray-500 italic">Chargement...</p>
                    </div>
                    
                    <!-- Divider -->
                    <div class="border-t border-teal-200 my-4"></div>
                    
                    <!-- Create new tracker -->
                    <div class="flex items-center space-x-3">
                        <input type="text" id="newTrackerTitle" placeholder="Créer un nouveau tracker..." 
                               class="flex-1 px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                        <button type="button" onclick="createAndAddTracker()" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                            Créer
                        </button>
                    </div>
                    
                    <div class="mt-4 text-right">
                        <button type="button" onclick="closeTrackerSelector()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Fermer
                        </button>
                    </div>
                </div>
                
                <!-- Amount input modal (hidden by default) -->
                <div id="trackerAmountModal" class="hidden mb-4 p-4 bg-white rounded-lg border border-teal-200">
                    <h4 class="font-semibold text-teal-700 mb-3" id="amountModalTitle">Ajouter un montant</h4>
                    <input type="hidden" id="selectedTrackerId">
                    <div class="flex items-center space-x-3">
                        <input type="number" id="trackerAmountInput" step="0.01" placeholder="Montant" 
                               class="flex-1 px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                        <span class="text-teal-600">€</span>
                        <button type="button" onclick="confirmAddTrackerEntry()" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                            Ajouter
                        </button>
                        <button type="button" onclick="closeAmountModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Annuler
                        </button>
                    </div>
                </div>
                
                <!-- Tracker list for this day -->
                <div id="customTrackersList" class="space-y-3">
                    <p class="text-teal-600 text-sm italic">Chargement des trackers...</p>
                </div>
            </div>
            
            <!-- Score Display -->
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 text-center">
                <h3 class="text-xl font-semibold text-purple-700 mb-2">🎯 Score Total du Jour</h3>
                <div class="text-4xl font-bold text-purple-700" id="total-score">0/11</div>
                <div class="text-sm text-purple-600 mt-2" id="score-message">Commence par cocher tes victoires !</div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex justify-end space-x-4">
                <button type="button" onclick="closeDayModal()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Annuler
                </button>
                <button type="submit" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                    💾 Sauvegarder
                </button>
            </div>
        </form>
    </div>
</div>
<?php endif; ?>

<script>
// Unified login/register modal script
let isRegisterMode = false;

function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    
    const modalTitle = document.getElementById('modalTitle');
    const submitText = document.getElementById('submitText');
    const nameField = document.getElementById('nameField');
    const authMessage = document.getElementById('authMessage');
    
    if (isRegisterMode) {
        modalTitle.textContent = "Inscription";
        submitText.textContent = "Créer mon compte";
        nameField.classList.remove('hidden');
        authMessage.classList.add('hidden');
    } else {
        modalTitle.textContent = "Connexion";
        submitText.textContent = "Se connecter";
        nameField.classList.add('hidden');
        authMessage.classList.add('hidden');
    }
}

document.getElementById('authForm').onsubmit = async function() {
    const formData = new FormData(this);
    const url = isRegisterMode ? '/register' : '/login';
    
    const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    
    const result = await response.json();
    const authMessage = document.getElementById('authMessage');
    
    if (result.success) {
        authMessage.className = "mt-4 p-3 rounded-lg bg-green-50 text-green-700";
        authMessage.textContent = isRegisterMode ? "Compte créé avec succès ! Redirection..." : "Connexion réussie ! Redirection...";
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    } else {
        authMessage.className = "mt-4 p-3 rounded-lg bg-red-50 text-red-700";
        authMessage.textContent = result.message || "Une erreur est survenue. Veuillez réessayer.";
    }
}

// Update score display function
function updateScores() {
    const saversCheckboxes = document.querySelectorAll('input[name^="savers_"]:checked');
    const vicesCheckboxes = document.querySelectorAll('input[name^="vice_free_"]:checked');
    
    const saversScore = saversCheckboxes.length;
    const vicesScore = vicesCheckboxes.length;
    const totalScore = saversScore + vicesScore;
    
    // Update score displays
    document.getElementById('savers-score').textContent = `${saversScore}/6`;
    document.getElementById('vices-score').textContent = `${vicesScore}/5`;
    document.getElementById('total-score').textContent = `${totalScore}/11`;
    
    // Update score message
    const messageEl = document.getElementById('score-message');
    if (totalScore >= 9) {
        messageEl.textContent = "🌟 Journée exceptionnelle ! Tu es un warrior !";
        messageEl.className = "text-sm text-green-600 mt-2";
    } else if (totalScore >= 7) {
        messageEl.textContent = "💪 Très bonne journée ! Continue comme ça !";
        messageEl.className = "text-sm text-blue-600 mt-2";
    } else if (totalScore >= 4) {
        messageEl.textContent = "👍 Bon début, tu peux faire mieux !";
        messageEl.className = "text-sm text-yellow-600 mt-2";
    } else {
        messageEl.textContent = "🎯 Chaque case cochée est une victoire !";
        messageEl.className = "text-sm text-purple-600 mt-2";
    }
}

// Custom Trackers Functions

// Reset all tracker UI state (call this when opening a new date)
function resetTrackerState() {
    // Hide all modals/forms
    const selectorModal = document.getElementById('trackerSelectorModal');
    const amountModal = document.getElementById('trackerAmountModal');
    
    if (selectorModal) selectorModal.classList.add('hidden');
    if (amountModal) amountModal.classList.add('hidden');
    
    // Clear inputs
    const newTrackerTitle = document.getElementById('newTrackerTitle');
    const trackerAmountInput = document.getElementById('trackerAmountInput');
    const selectedTrackerId = document.getElementById('selectedTrackerId');
    
    if (newTrackerTitle) newTrackerTitle.value = '';
    if (trackerAmountInput) trackerAmountInput.value = '';
    if (selectedTrackerId) selectedTrackerId.value = '';
    
    // Reset the trackers list to loading state (use innerHTML, don't manipulate DOM nodes)
    const container = document.getElementById('customTrackersList');
    if (container) {
        container.innerHTML = '<p class="text-teal-600 text-sm italic">Chargement des trackers...</p>';
    }
    
    // Reset existing trackers list in selector
    const existingTrackersList = document.getElementById('existingTrackersList');
    if (existingTrackersList) {
        existingTrackersList.innerHTML = '<p class="text-sm text-gray-500 italic">Chargement...</p>';
    }
}

// Make it globally available
window.resetTrackerState = resetTrackerState;

// Open the tracker selector (shows all user's trackers with monthly totals)
async function openTrackerSelector() {
    const selectorModal = document.getElementById('trackerSelectorModal');
    selectorModal.classList.remove('hidden');
    
    const currentDate = document.getElementById('dayDate').value;
    
    try {
        const response = await fetch(`api/tracking.php?action=get_all_trackers&date=${currentDate}`);
        const data = await response.json();
        
        if (data.success) {
            renderTrackerSelector(data.trackers);
        }
    } catch (error) {
        console.error('Error loading trackers:', error);
    }
}

function closeTrackerSelector() {
    document.getElementById('trackerSelectorModal').classList.add('hidden');
    document.getElementById('newTrackerTitle').value = '';
}

function renderTrackerSelector(trackers) {
    const container = document.getElementById('existingTrackersList');
    
    if (!trackers || trackers.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 italic">Aucun tracker créé. Créez-en un nouveau ci-dessous.</p>';
        return;
    }
    
    let html = '';
    trackers.forEach(tracker => {
        const trackerId = parseInt(tracker.tracker_id, 10);
        const monthlyTotal = parseFloat(tracker.monthly_total).toFixed(2);
        html += `
            <div class="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200 hover:bg-teal-100 cursor-pointer transition-colors"
                 onclick="selectTrackerForEntry(${trackerId}, '${escapeHtml(tracker.title)}')">
                <div>
                    <div class="font-semibold text-teal-700">${escapeHtml(tracker.title)}</div>
                    <div class="text-xs text-teal-600">Total ce mois: <span class="font-bold">${monthlyTotal} €</span></div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-teal-500">➕</span>
                    <button type="button" onclick="event.stopPropagation(); deleteTrackerDefinition(${trackerId}, '${escapeHtml(tracker.title)}')" 
                            class="text-red-500 hover:text-red-700 p-1" title="Supprimer ce tracker définitivement">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Select a tracker to add an entry for this date
function selectTrackerForEntry(trackerId, trackerTitle) {
    closeTrackerSelector();
    
    document.getElementById('selectedTrackerId').value = trackerId;
    document.getElementById('amountModalTitle').textContent = `Ajouter un montant pour "${trackerTitle}"`;
    document.getElementById('trackerAmountInput').value = '';
    document.getElementById('trackerAmountModal').classList.remove('hidden');
    document.getElementById('trackerAmountInput').focus();
}

function closeAmountModal() {
    document.getElementById('trackerAmountModal').classList.add('hidden');
    document.getElementById('trackerAmountInput').value = '';
}

// Confirm adding a tracker entry for this date
async function confirmAddTrackerEntry() {
    const trackerId = document.getElementById('selectedTrackerId').value;
    const amount = parseFloat(document.getElementById('trackerAmountInput').value) || 0;
    const currentDate = document.getElementById('dayDate').value;
    
    if (amount === 0) {
        alert('Veuillez entrer un montant');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'update_custom_tracker_entry');
        formData.append('tracker_id', trackerId);
        formData.append('date', currentDate);
        formData.append('amount', amount);
        
        const response = await fetch('api/tracking.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeAmountModal();
            loadCustomTrackers(currentDate);
        } else {
            alert(data.message || 'Erreur lors de l\'ajout');
        }
    } catch (error) {
        console.error('Error adding tracker entry:', error);
        alert('Erreur de connexion');
    }
}

// Create a new tracker and immediately add an entry
async function createAndAddTracker() {
    const titleInput = document.getElementById('newTrackerTitle');
    const title = titleInput.value.trim();
    
    if (!title) {
        alert('Veuillez entrer un titre pour le tracker');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'create_custom_tracker');
        formData.append('title', title);
        
        const response = await fetch('api/tracking.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            titleInput.value = '';
            // Now ask for the amount
            selectTrackerForEntry(data.tracker_id, title);
        } else {
            alert(data.message || 'Erreur lors de la création du tracker');
        }
    } catch (error) {
        console.error('Error creating tracker:', error);
        alert('Erreur de connexion');
    }
}

// Delete a tracker definition (and all its entries)
async function deleteTrackerDefinition(trackerId, trackerTitle) {
    if (!confirm(`Supprimer définitivement le tracker "${trackerTitle}" ?\n\nCette action supprimera le tracker ET toutes ses entrées sur toutes les dates.`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'delete_custom_tracker');
        formData.append('tracker_id', trackerId);
        
        const response = await fetch('api/tracking.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            const currentDate = document.getElementById('dayDate').value;
            // Refresh both the selector and the list
            openTrackerSelector();
            loadCustomTrackers(currentDate);
        } else {
            alert('Erreur lors de la suppression du tracker');
        }
    } catch (error) {
        console.error('Error deleting tracker:', error);
        alert('Erreur de connexion');
    }
}

// Remove a tracker entry from this specific date only
async function removeTrackerEntry(trackerId, trackerTitle) {
    if (!confirm(`Retirer "${trackerTitle}" de cette journée ?\n\nLe tracker restera disponible pour d'autres dates.`)) {
        return;
    }
    
    const currentDate = document.getElementById('dayDate').value;
    
    try {
        const formData = new FormData();
        formData.append('action', 'delete_tracker_entry');
        formData.append('tracker_id', trackerId);
        formData.append('date', currentDate);
        
        const response = await fetch('api/tracking.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadCustomTrackers(currentDate);
        } else {
            alert('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Error removing tracker entry:', error);
        alert('Erreur de connexion');
    }
}

// Update a tracker entry amount
async function updateTrackerEntry(trackerId, inputElement) {
    const amount = parseFloat(inputElement.value) || 0;
    const currentDate = document.getElementById('dayDate').value;
    
    try {
        const formData = new FormData();
        formData.append('action', 'update_custom_tracker_entry');
        formData.append('tracker_id', trackerId);
        formData.append('date', currentDate);
        formData.append('amount', amount);
        
        const response = await fetch('api/tracking.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update monthly total display
            const totalElement = document.getElementById(`tracker-total-${trackerId}`);
            if (totalElement) {
                totalElement.textContent = parseFloat(data.monthly_total).toFixed(2);
            }
        }
    } catch (error) {
        console.error('Error updating tracker entry:', error);
    }
}

// Load trackers for this specific date
async function loadCustomTrackers(date) {
    try {
        const response = await fetch(`api/tracking.php?action=get_custom_trackers&date=${date}`);
        const data = await response.json();
        
        if (data.success) {
            renderCustomTrackers(data.trackers);
        }
    } catch (error) {
        console.error('Error loading custom trackers:', error);
    }
}

// Render trackers added for this day
function renderCustomTrackers(trackers) {
    const container = document.getElementById('customTrackersList');
    
    if (!trackers || trackers.length === 0) {
        container.innerHTML = '<p class="text-teal-600 text-sm italic">Aucun tracker ajouté pour cette journée. Cliquez sur "+ Ajouter" pour en ajouter un.</p>';
        return;
    }
    
    let html = '';
    trackers.forEach(tracker => {
        const trackerId = parseInt(tracker.tracker_id, 10);
        html += `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200 hover:border-teal-400 transition-colors">
                <div class="flex-1">
                    <div class="font-semibold text-teal-700">${escapeHtml(tracker.title)}</div>
                    <div class="text-xs text-teal-600">
                        Total ce mois: <span id="tracker-total-${trackerId}" class="font-bold">${parseFloat(tracker.monthly_total).toFixed(2)}</span> €
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="flex items-center">
                        <input type="number" 
                               step="0.01" 
                               value="${parseFloat(tracker.amount).toFixed(2)}" 
                               onchange="updateTrackerEntry(${trackerId}, this)"
                               class="w-24 px-2 py-1 text-right border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                        <span class="ml-1 text-teal-600">€</span>
                    </div>
                    <button type="button" onclick="removeTrackerEntry(${trackerId}, '${escapeHtml(tracker.title)}')" 
                            class="text-orange-500 hover:text-orange-700 p-1" title="Retirer de cette journée">
                        ❌
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make loadCustomTrackers available globally
window.loadCustomTrackers = loadCustomTrackers;
</script>
