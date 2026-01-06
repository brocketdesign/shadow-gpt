<form id="dayForm">
    <input type="hidden" id="dayDate" name="date">
    
    <!-- SAVERS Section -->
    <div class="mb-6">
        <h4 class="text-lg font-semibold text-indigo-600 mb-4">🌅 SAVERS (Miracle Morning)</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center p-3 border rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer" onclick="toggleCheckbox('savers_silence')">
                <input type="checkbox" id="savers_silence" name="savers_silence" class="checkbox-custom mr-3">
                <div>
                    <label for="savers_silence" class="font-medium">🧘 Silence</label>
                    <p class="text-sm text-gray-600">Méditation/Respiration</p>
                </div>
            </div>
            
            <div class="flex items-center p-3 border rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer" onclick="toggleCheckbox('savers_affirmations')">
                <input type="checkbox" id="savers_affirmations" name="savers_affirmations" class="checkbox-custom mr-3">
                <div>
                    <label for="savers_affirmations" class="font-medium">💬 Affirmations</label>
                    <p class="text-sm text-gray-600">Mantras positifs</p>
                </div>
            </div>
            
            <div class="flex items-center p-3 border rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer" onclick="toggleCheckbox('savers_visualization')">
                <input type="checkbox" id="savers_visualization" name="savers_visualization" class="checkbox-custom mr-3">
                <div>
                    <label for="savers_visualization" class="font-medium">👁️ Visualisation</label>
                    <p class="text-sm text-gray-600">Vision des objectifs</p>
                </div>
            </div>
            
            <div class="flex items-center p-3 border rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer" onclick="toggleCheckbox('savers_exercise')">
                <input type="checkbox" id="savers_exercise" name="savers_exercise" class="checkbox-custom mr-3">
                <div>
                    <label for="savers_exercise" class="font-medium">🏃 Exercise</label>
                    <p class="text-sm text-gray-600">Sport/Mouvement</p>
                </div>
            </div>
            
            <div class="flex items-center p-3 border rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer" onclick="toggleCheckbox('savers_reading')">
                <input type="checkbox" id="savers_reading" name="savers_reading" class="checkbox-custom mr-3">
                <div>
                    <label for="savers_reading" class="font-medium">📚 Reading</label>
                    <p class="text-sm text-gray-600">Lecture/Apprentissage</p>
                </div>
            </div>
            
            <div class="flex items-center p-3 border rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer" onclick="toggleCheckbox('savers_scribing')">
                <input type="checkbox" id="savers_scribing" name="savers_scribing" class="checkbox-custom mr-3">
                <div>
                    <label for="savers_scribing" class="font-medium">✍️ Scribing</label>
                    <p class="text-sm text-gray-600">Écriture/Journal</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Vices Section -->
    <div class="mb-6">
        <h4 class="text-lg font-semibold text-red-600 mb-4">🚫 Vices à Éviter</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex items-center p-3 border rounded-lg hover:bg-red-50 transition-colors cursor-pointer" onclick="toggleCheckbox('vice_free_coke')">
                <input type="checkbox" id="vice_free_coke" name="vice_free_coke" class="checkbox-custom mr-3">
                <div>
                    <label for="vice_free_coke" class="font-medium">🥤 Sans Coca</label>
                    <p class="text-sm text-gray-600">Zéro sucre industriel</p>
                </div>
            </div>
            
            <div class="flex items-center p-3 border rounded-lg hover:bg-red-50 transition-colors cursor-pointer" onclick="toggleCheckbox('vice_free_beer')">
                <input type="checkbox" id="vice_free_beer" name="vice_free_beer" class="checkbox-custom mr-3">
                <div>
                    <label for="vice_free_beer" class="font-medium">🍺 Sans Alcool</label>
                    <p class="text-sm text-gray-600">Esprit clair</p>
                </div>
            </div>
            
            <div class="flex items-center p-3 border rounded-lg hover:bg-red-50 transition-colors cursor-pointer" onclick="toggleCheckbox('vice_free_weed')">
                <input type="checkbox" id="vice_free_weed" name="vice_free_weed" class="checkbox-custom mr-3">
                <div>
                    <label for="vice_free_weed" class="font-medium">🌿 Sans Cannabis</label>
                    <p class="text-sm text-gray-600">Clarté mentale</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Mood & Energy -->
    <div class="mb-6">
        <h4 class="text-lg font-semibold text-purple-600 mb-4">💭 État d'esprit</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Humeur (1-10)</label>
                <input type="range" id="mood_rating" name="mood_rating" min="1" max="10" class="w-full">
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>😞 Difficile</span>
                    <span>😊 Excellent</span>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Énergie (1-10)</label>
                <input type="range" id="energy_level" name="energy_level" min="1" max="10" class="w-full">
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>🔋 Faible</span>
                    <span>⚡ Élevée</span>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Notes -->
    <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Notes personnelles</label>
        <textarea id="notes" name="notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Réflexions, défis, victoires du jour..."></textarea>
    </div>
    
    <div class="flex justify-end space-x-3">
        <button type="button" onclick="closeDayModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Annuler
        </button>
        <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold">
            Sauvegarder
        </button>
    </div>
</form>
