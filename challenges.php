<?php
// Debug errors - REMOVE IN PRODUCTION
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Start session before any output
session_start();

require_once 'classes.php';

// Initialisation
$database = new Database();
$database->initTables();
$userService = new UserService($database);

// Vérifier l'authentification
$currentUser = $userService->getCurrentUser();

// Redirect to login if not authenticated
if (!$currentUser) {
    header('Location: index.php');
    exit;
}

$pageTitle = 'Mes Challenges';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?> | Shadow GPT</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="max-w-7xl mx-auto p-6">
        <!-- Navigation -->
        <?php include 'components/navigation.php'; ?>
        
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">🎯 Mes Challenges</h1>
                    <p class="text-gray-600">Transforme tes objectifs en réalité, un jour à la fois</p>
                </div>
                <div class="flex gap-3">
                    <a href="index.php" class="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-semibold">
                        ← Retour
                    </a>
                    <button onclick="challengeManager.showCreateModal()" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold">
                        ✨ Nouveau Challenge
                    </button>
                </div>
            </div>
        </div>

        <!-- Filter Tabs -->
        <div class="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <div class="flex gap-2">
                <button onclick="challengeManager.loadChallenges('active')" 
                        class="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200">
                    🔥 Actifs
                </button>
                <button onclick="challengeManager.loadChallenges('completed')" 
                        class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">
                    ✅ Complétés
                </button>
                <button onclick="challengeManager.loadChallenges('failed')" 
                        class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">
                    ❌ Échoués
                </button>
                <button onclick="challengeManager.loadChallenges()" 
                        class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">
                    📋 Tous
                </button>
            </div>
        </div>
        
        <!-- Challenges Grid -->
        <div id="challengesContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Challenges will be loaded here -->
            <div class="text-center py-12 col-span-full">
                <div class="animate-pulse">
                    <div class="text-4xl mb-4">⏳</div>
                    <p class="text-gray-600">Chargement des challenges...</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Create Challenge Modal -->
    <div id="createChallengeModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">✨ Créer un Nouveau Challenge</h2>
                    <button onclick="challengeManager.hideCreateModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <form id="createChallengeForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Titre du Challenge *
                        </label>
                        <input type="text" id="challengeTitle" required
                               placeholder="Ex: No Porn Challenge, 30 jours sans alcool..."
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea id="challengeDescription" rows="4"
                                  placeholder="Décris ton challenge et pourquoi tu veux le réaliser..."
                                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"></textarea>
                        <button type="button" id="enhanceDescriptionBtn"
                                class="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-semibold">
                            ✨ Améliorer avec AI
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Durée (jours) *
                            </label>
                            <select id="challengeDuration" required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                <option value="7">7 jours</option>
                                <option value="10">10 jours</option>
                                <option value="14">14 jours</option>
                                <option value="21">21 jours</option>
                                <option value="30" selected>30 jours</option>
                                <option value="60">60 jours</option>
                                <option value="90">90 jours</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Date de début
                            </label>
                            <input type="date" id="challengeStartDate"
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-start">
                            <span class="text-2xl mr-3">💡</span>
                            <div class="text-sm text-blue-800">
                                <p class="font-semibold mb-1">Conseil pour réussir</p>
                                <p>Choisis un challenge réaliste mais ambitieux. Commence petit si c'est ta première fois. La constance est plus importante que l'intensité!</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                        <button type="button" onclick="challengeManager.hideCreateModal()"
                                class="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-semibold">
                            Annuler
                        </button>
                        <button type="submit"
                                class="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold">
                            🎯 Créer le Challenge
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Challenge Details Modal -->
    <div id="challengeDetailsModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div id="challengeDetailsContent">
                <!-- Details will be loaded here -->
            </div>
        </div>
    </div>

    <script src="assets/js/challenges.js"></script>
</body>
</html>
