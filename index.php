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
$openAI = new OpenAIService($database);
$tracking = new TrackingService($database);

// Vérifier l'authentification
$currentUser = $userService->getCurrentUser();

// Log authentication status
error_log('Index page - User authenticated: ' . ($currentUser ? 'Yes (ID: ' . $currentUser['id'] . ')' : 'No'));

// Configuration du mois à afficher
$currentYear = (int)($_GET['year'] ?? date('Y'));
$currentMonth = (int)($_GET['month'] ?? date('n'));
$monthName = date('F', mktime(0, 0, 0, $currentMonth, 1, $currentYear));
$monthNameFr = [
    'January' => 'Janvier', 'February' => 'Février', 'March' => 'Mars',
    'April' => 'Avril', 'May' => 'Mai', 'June' => 'Juin',
    'July' => 'Juillet', 'August' => 'Août', 'September' => 'Septembre',
    'October' => 'Octobre', 'November' => 'Novembre', 'December' => 'Décembre'
][$monthName] ?? $monthName;

// Calculate previous and next month
$prevMonth = $currentMonth - 1;
$prevYear = $currentYear;
if ($prevMonth < 1) {
    $prevMonth = 12;
    $prevYear--;
}

$nextMonth = $currentMonth + 1;
$nextYear = $currentYear;
if ($nextMonth > 12) {
    $nextMonth = 1;
    $nextYear++;
}

// Générer les jours du mois
$daysInMonth = cal_days_in_month(CAL_GREGORIAN, $currentMonth, $currentYear);
$firstDayOfWeek = date('N', strtotime("$currentYear-$currentMonth-01"));

// Récupérer les données du mois si connecté
$monthData = [];
if ($currentUser) {
    try {
        $monthData = $tracking->getMonthData($currentYear, str_pad($currentMonth, 2, '0', STR_PAD_LEFT), $currentUser['id']);
    } catch (Exception $e) {
        // Log error but continue without month data
        error_log('Error loading month data: ' . $e->getMessage());
    }
}

$pageTitle = 'Shadow GPT - Guide Personnel';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?? 'Shadow GPT - Guide Personnel' ?> | <?= $monthNameFr ?> <?= $currentYear ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        body { font-family: 'Inter', sans-serif; }
        
        /* Ensure content is always visible */
        .max-w-4xl {
            display: block !important;
            opacity: 1 !important;
        }
        
        @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
            @page { size: A4; margin: 0.5in; }
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .checkbox-custom {
            appearance: none;
            width: 20px;
            height: 20px;
            border: 2px solid #4f46e5;
            border-radius: 4px;
            position: relative;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .checkbox-custom:checked {
            background-color: #4f46e5;
            transform: scale(1.1);
        }
        .checkbox-custom:checked::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-weight: bold;
            font-size: 14px;
        }
        .checkbox-custom:hover {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .calendar-day:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .modal-backdrop {
            backdrop-filter: blur(4px);
            animation: fadeIn 0.2s ease-out;
        }
        .modal-content {
            animation: slideIn 0.3s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: translateY(-20px) scale(0.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }
        .score-indicator {
            transition: all 0.3s ease;
        }
        .pulse {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body class="bg-gray-50">

<div class="max-w-4xl mx-auto p-6" style="display: block !important; opacity: 1 !important;">
    <!-- Barre de navigation -->
    <?php include 'components/navigation.php'; ?>

    <!-- En-tête -->
    <div class="gradient-bg text-white p-8 rounded-xl mb-8 text-center">
        <h1 class="text-4xl font-bold mb-4">🌟 Shadow GPT - Guide Personnel</h1>
        
        <!-- Month Navigation -->
        <div class="flex items-center justify-center mb-4 space-x-4">
            <button onclick="changeMonth(<?= $prevYear ?>, <?= $prevMonth ?>)" 
                    class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    id="prevMonthBtn">
                <span>←</span>
                <span class="hidden sm:inline"><?= date('M', mktime(0, 0, 0, $prevMonth, 1, $prevYear)) ?></span>
            </button>
            
            <h2 class="text-2xl font-semibold min-w-[200px]"><?= $monthNameFr ?> <?= $currentYear ?></h2>
            
            <button onclick="changeMonth(<?= $nextYear ?>, <?= $nextMonth ?>)" 
                    class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    id="nextMonthBtn">
                <span class="hidden sm:inline"><?= date('M', mktime(0, 0, 0, $nextMonth, 1, $nextYear)) ?></span>
                <span>→</span>
            </button>
        </div>
        
        <p class="text-lg opacity-90 max-w-2xl mx-auto" id="daily-affirmation">
            <?php 
            $todayAffirmation = $openAI->getDailyAffirmation(date('Y-m-d'));
            echo '"' . htmlspecialchars($todayAffirmation) . '"';
            ?>
        </p>
        
        <!-- Streak Container -->
        <?php if ($currentUser): ?>
            <div class="mt-6" data-auth-required="true" id="streakSection">
                <h3 class="text-lg font-semibold mb-4 text-white/90">🔥 Tes Séries Actuelles</h3>
                <div id="streakContainer">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="bg-white/20 rounded-lg p-4 text-center animate-pulse">
                            <div class="h-6 bg-white/20 rounded mb-2"></div>
                            <div class="h-4 bg-white/20 rounded mb-1"></div>
                            <div class="h-3 bg-white/20 rounded"></div>
                        </div>
                        <div class="bg-white/20 rounded-lg p-4 text-center animate-pulse">
                            <div class="h-6 bg-white/20 rounded mb-2"></div>
                            <div class="h-4 bg-white/20 rounded mb-1"></div>
                            <div class="h-3 bg-white/20 rounded"></div>
                        </div>
                        <div class="bg-white/20 rounded-lg p-4 text-center animate-pulse">
                            <div class="h-6 bg-white/20 rounded mb-2"></div>
                            <div class="h-4 bg-white/20 rounded mb-1"></div>
                            <div class="h-3 bg-white/20 rounded"></div>
                        </div>
                        <div class="bg-white/20 rounded-lg p-4 text-center animate-pulse">
                            <div class="h-6 bg-white/20 rounded mb-2"></div>
                            <div class="h-4 bg-white/20 rounded mb-1"></div>
                            <div class="h-3 bg-white/20 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        <?php endif; ?>
        
        <?php if ($currentUser): ?>
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" data-auth-required="true">
                <div class="bg-white/20 rounded-lg p-3">
                    <div class="font-semibold">🎯 Objectif SAVERS</div>
                    <div>6/6 activités quotidiennes</div>
                </div>
                <div class="bg-white/20 rounded-lg p-3">
                    <div class="font-semibold">🚫 Zéro Vice</div>
                    <div>Coca • Bière • Cannabis • SNS • Porno</div>
                </div>
                <div class="bg-white/20 rounded-lg p-3">
                    <div class="font-semibold">💪 Force Intérieure</div>
                    <div>Construire jour après jour</div>
                </div>
            </div>
        <?php else: ?>
            <div class="mt-6 bg-white/20 rounded-lg p-4 max-w-md mx-auto" data-auth-required="false">
                <p class="text-sm">Connectez-vous pour suivre vos progrès et débloquer toutes les fonctionnalités</p>
                <button onclick="showLoginModal()" class="mt-3 bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">
                    Se connecter
                </button>
            </div>
        <?php endif; ?>
    </div>

    <!-- Légende -->
    <div class="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h3 class="text-xl font-semibold mb-4 text-gray-800">📋 Légende de Tracking</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 class="font-semibold text-indigo-600 mb-3">🌅 SAVERS (Miracle Morning)</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex items-center"><span class="w-6 text-center">🧘</span> <strong>S</strong>ilence - Méditation/Respiration</div>
                    <div class="flex items-center"><span class="w-6 text-center">💬</span> <strong>A</strong>ffirmations - Mantras positifs</div>
                    <div class="flex items-center"><span class="w-6 text-center">👁️</span> <strong>V</strong>isualisation - Vision de tes objectifs</div>
                    <div class="flex items-center"><span class="w-6 text-center">🏃</span> <strong>E</strong>xercise - Sport/Mouvement</div>
                    <div class="flex items-center"><span class="w-6 text-center">📚</span> <strong>R</strong>eading - Lecture/Apprentissage</div>
                    <div class="flex items-center"><span class="w-6 text-center">✍️</span> <strong>S</strong>cribing - Écriture/Journal</div>
                </div>
            </div>
            <div>
                <h4 class="font-semibold text-red-600 mb-3">🚫 Vices à Éviter</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex items-center"><span class="w-6 text-center">🥤</span> <strong>Coca/Sodas</strong> - Zéro sucre industriel</div>
                    <div class="flex items-center"><span class="w-6 text-center">🍺</span> <strong>Bière/Alcool</strong> - Esprit clair</div>
                    <div class="flex items-center"><span class="w-6 text-center">🌿</span> <strong>Cannabis</strong> - Clarté mentale</div>
                    <div class="flex items-center"><span class="w-6 text-center">📱</span> <strong>SNS (+30min)</strong> - Temps précieux</div>
                    <div class="flex items-center"><span class="w-6 text-center">🔞</span> <strong>Contenu Porno</strong> - Énergie pure</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Calendrier -->
    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div class="bg-gray-50 p-4 border-b">
            <div class="flex justify-between items-center">
                <h3 class="text-xl font-semibold text-gray-800">📅 Calendrier de Transformation - <?= $monthNameFr ?> <?= $currentYear ?></h3>
                <?php if ($currentUser): ?>
                <div class="text-sm text-gray-600" id="monthStats">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">Chargement...</span>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        <!-- Jours de la semaine -->
        <div class="grid grid-cols-7 border-b">
            <?php 
            $weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
            foreach($weekDays as $day): ?>
                <div class="p-3 bg-gray-100 font-semibold text-center text-gray-700 border-r last:border-r-0">
                    <?= $day ?>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Grille du calendrier -->
        <div class="grid grid-cols-7">
            <?php
            // Cases vides pour aligner le premier jour
            for($i = 1; $i < $firstDayOfWeek; $i++): ?>
                <div class="h-32 border-r border-b bg-gray-50"></div>
            <?php endfor;

            // Jours du mois
            for($day = 1; $day <= $daysInMonth; $day++):
                $date = sprintf('%04d-%02d-%02d', $currentYear, $currentMonth, $day);
                $dayData = $monthData[$date] ?? null;
                $isWeekend = date('N', strtotime($date)) >= 6;
                $isToday = $date === date('Y-m-d');
                
                $dayClass = $isWeekend ? 'bg-blue-50' : 'bg-white';
                if ($isToday) $dayClass .= ' ring-2 ring-indigo-300';
            ?>
                <div class="h-32 border-r border-b p-2 <?= $dayClass ?> relative cursor-pointer hover:bg-gray-50 transition-colors calendar-day" 
                     data-date="<?= $date ?>"
                     data-action="<?= $currentUser ? 'open-day' : 'login' ?>">
                    <!-- Numéro du jour -->
                    <div class="font-bold text-lg text-gray-800 mb-1">
                        <?= $day ?>
                        <?php if ($isToday): ?>
                            <span class="text-xs text-indigo-600 ml-1">●</span>
                        <?php endif; ?>
                    </div>
                    
                    <?php if ($currentUser): ?>
                        <!-- Icônes SAVERS -->
                        <?php if ($dayData): ?>
                            <div class="savers-icons flex flex-wrap gap-1 mt-1">
                                <?php 
                                $saversFields = ['savers_silence', 'savers_affirmations', 'savers_visualization', 'savers_exercise', 'savers_reading', 'savers_scribing'];
                                $saversLabels = ['🧘', '💬', '👁️', '🏃', '📚', '✍️'];
                                
                                for($i = 0; $i < 6; $i++): 
                                    if ($dayData[$saversFields[$i]]):
                                ?>
                                    <span class="text-xs" id="<?= $date ?>-<?= $saversFields[$i] ?>-icon"><?= $saversLabels[$i] ?></span>
                                <?php 
                                    endif;
                                endfor; 
                                ?>
                            </div>
                            
                            <!-- Icônes Vices -->
                            <div class="vices-icons flex flex-wrap gap-1 mt-1">
                                <?php 
                                $vicesFields = ['vice_free_coke', 'vice_free_beer', 'vice_free_weed', 'vice_free_sns', 'vice_free_porn'];
                                $vicesLabels = ['🥤', '🍺', '🌿', '📱', '🔞'];
                                
                                for($i = 0; $i < 5; $i++): 
                                    if ($dayData[$vicesFields[$i]]):
                                ?>
                                    <span class="text-xs" id="<?= $date ?>-<?= $vicesFields[$i] ?>-icon"><?= $vicesLabels[$i] ?></span>
                                <?php 
                                    endif;
                                endfor; 
                                ?>
                            </div>
                        <?php else: ?>
                            <!-- Cellule vide -->
                            <div class="text-xs text-center text-gray-400 mt-4">
                                <div>Cliquez pour</div>
                                <div>enregistrer</div>
                            </div>
                        <?php endif; ?>
                        
                        <!-- Score du jour -->
                        <?php if($dayData): 
                            $saversScore = 0;
                            $vicesScore = 0;
                            foreach($saversFields as $field) {
                                if($dayData[$field]) $saversScore++;
                            }
                            foreach($vicesFields as $field) {
                                if($dayData[$field]) $vicesScore++;
                            }
                            $totalScore = $saversScore + $vicesScore;
                        ?>
                            <div class="absolute bottom-1 right-1 text-xs font-bold score-indicator <?= $totalScore >= 9 ? 'text-green-600' : ($totalScore >= 7 ? 'text-yellow-600' : 'text-red-600') ?>">
                                <?= $totalScore ?>/11
                            </div>
                        <?php endif; ?>
                    <?php else: ?>
                        <!-- Vue pour les non-connectés -->
                        <div class="text-xs text-gray-500 text-center mt-4">
                            <div class="lock-icon">🔒</div>
                            <div>Connectez-vous</div>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endfor;

            // Cases vides pour compléter la dernière semaine
            $lastDay = date('N', strtotime("$currentYear-$currentMonth-$daysInMonth"));
            for($i = $lastDay; $i < 7; $i++): ?>
                <div class="h-32 border-r border-b bg-gray-50"></div>
            <?php endfor; ?>
        </div>
    </div>

    <!-- Conseils et alternatives -->
    <div class="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <h3 class="text-xl font-semibold mb-4 text-gray-800">💡 Alternatives Saines & Conseils</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-4 bg-blue-50 rounded-lg">
                <h4 class="font-semibold text-blue-700 mb-3">🥤 Alternative au Coca</h4>
                <ul class="text-sm text-blue-600 space-y-1">
                    <li>• Eau pétillante + citron</li>
                    <li>• Kombucha maison</li>
                    <li>• Thé glacé non sucré</li>
                    <li>• Eau infusée fruits</li>
                </ul>
            </div>
            
            <div class="p-4 bg-green-50 rounded-lg">
                <h4 class="font-semibold text-green-700 mb-3">🍺 Alternative à l'Alcool</h4>
                <ul class="text-sm text-green-600 space-y-1">
                    <li>• Bière sans alcool artisanale</li>
                    <li>• Mocktails créatifs</li>
                    <li>• Thé en soirée</li>
                    <li>• Activité sportive</li>
                </ul>
            </div>
            
            <div class="p-4 bg-purple-50 rounded-lg">
                <h4 class="font-semibold text-purple-700 mb-3">🌿 Gestion du Stress</h4>
                <ul class="text-sm text-purple-600 space-y-1">
                    <li>• Méditation 10 min</li>
                    <li>• Exercices de respiration</li>
                    <li>• Marche en nature</li>
                    <li>• Appel à un ami</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-gray-500 text-sm">
        <p>🌟 "Chaque case cochée est une victoire. Chaque jour accompli est un pas vers ta liberté." 🌟</p>
        <p class="mt-2">Shadow GPT - Ton guide personnel vers la transformation</p>
    </div>
</div>

<!-- Modals -->
<?php 
if (file_exists('components/modals.php')) {
    include 'components/modals.php';
} else {
    echo '<script>console.error("Modals file not found!");</script>';
}
?>

<!-- JavaScript -->
<script src="assets/js/auth.js?v=<?= time() ?>"></script>
<script src="assets/js/tracking.js?v=<?= time() ?>"></script>
<script src="assets/js/streaks.js?v=<?= time() ?>"></script>

<script>
// Make current year and month available to JavaScript
window.currentDisplayYear = <?= $currentYear ?>;
window.currentDisplayMonth = <?= $currentMonth ?>;
</script>

<script>
// Month navigation functionality
window.changeMonth = function(year, month) {
    console.log('Changing to month:', year, month);
    
    // Navigate to new month
    window.location.href = `?year=${year}&month=${month}`;
};

// Load month statistics when authenticated
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = <?= $currentUser ? 'true' : 'false' ?>;
    const currentYear = <?= $currentYear ?>;
    const currentMonth = <?= $currentMonth ?>;
    
    if (currentUser) {
        loadMonthStats(currentYear, currentMonth);
        checkNavigationAvailability(currentYear, currentMonth);
    }
});

function loadMonthStats(year, month) {
    fetch(`api/tracking.php?action=get_month_summary&year=${year}&month=${month}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.summary) {
                const stats = data.summary;
                const monthStats = document.getElementById('monthStats');
                if (monthStats) {
                    monthStats.innerHTML = `
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                            📊 ${stats.total_days || 0} jours trackés
                        </span>
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            ⭐ Moy: ${stats.avg_score || 0}/11
                        </span>
                    `;
                }
            }
        })
        .catch(error => {
            console.error('Error loading month stats:', error);
            const monthStats = document.getElementById('monthStats');
            if (monthStats) {
                monthStats.innerHTML = '<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded">Stats indisponibles</span>';
            }
        });
}

function checkNavigationAvailability(year, month) {
    // Check if previous/next months have data to enable/disable navigation
    const prevMonth = month - 1;
    const prevYear = prevMonth < 1 ? year - 1 : year;
    const actualPrevMonth = prevMonth < 1 ? 12 : prevMonth;
    
    const nextMonth = month + 1;
    const nextYear = nextMonth > 12 ? year + 1 : year;
    const actualNextMonth = nextMonth > 12 ? 1 : nextMonth;
    
    // Always allow navigation for now - we'll let users explore any month
    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');
    
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
    
    // Don't allow navigation too far into the future
    const today = new Date();
    const maxYear = today.getFullYear() + 1;
    const maxMonth = nextYear > maxYear || (nextYear === maxYear && actualNextMonth > today.getMonth() + 1);
    
    if (nextBtn && maxMonth) {
        nextBtn.disabled = true;
        nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// Ensure content is visible immediately
document.documentElement.style.visibility = 'visible';
document.body.style.visibility = 'visible';

// Enhanced authentication state handling
window.addEventListener('load', function() {
    // Check for authentication status from PHP
    const isAuthenticated = <?= $currentUser ? 'true' : 'false' ?>;
    const userData = <?= $currentUser ? json_encode($currentUser) : 'null' ?>;
    
    console.log('Initial auth state:', { isAuthenticated, userData });
    
    // Sync with AuthManager when it's ready
    setTimeout(() => {
        if (window.authManager) {
            if (isAuthenticated && userData) {
                window.authManager.currentUser = userData;
                window.authManager.handleAuthenticatedState(userData);
            } else {
                window.authManager.handleUnauthenticatedState();
            }
        }
    }, 100);
});

// Global function definitions MUST be here to be available immediately
window.openDayModal = function(date) {
    console.log('=== GLOBAL openDayModal called ===', date);
    
    // Direct modal opening - no dependencies
    const modal = document.getElementById('dayModal');
    if (!modal) {
        console.error('Modal not found!');
        alert('Erreur: Modal introuvable');
        return;
    }
    
    console.log('Modal found, opening...');
    console.log('Before - classes:', modal.className);
    console.log('Before - style display:', modal.style.display);
    
    // Force open modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.zIndex = '9999';
    document.body.style.overflow = 'hidden';
    
    console.log('After - classes:', modal.className);
    console.log('After - style display:', modal.style.display);
    
    // Set title and date
    const titleEl = document.getElementById('dayModalTitle');
    const dateField = document.getElementById('dayDate');
    
    if (titleEl) {
        const formattedDate = new Date(date).toLocaleDateString('fr-FR', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        titleEl.textContent = `Détails du ${formattedDate}`;
    }
    
    if (dateField) {
        dateField.value = date;
    }
    
    // Load daily affirmation for this specific date
    const affirmationEl = document.getElementById('daily_affirmation_display');
    if (affirmationEl) {
        affirmationEl.textContent = '"Chargement de votre affirmation..."';
        
        fetch(`api/affirmations.php?action=get_affirmation&date=${date}`)
            .then(response => response.json())
            .then(data => {
                console.log('Affirmation response for', date, ':', data);
                if (data.success && data.affirmation) {
                    affirmationEl.textContent = `"${data.affirmation}"`;
                } else {
                    // Fallback affirmation
                    affirmationEl.textContent = '"Aujourd\'hui, je choisis de grandir et de me dépasser."';
                }
            })
            .catch(error => {
                console.error('Error loading affirmation for', date, ':', error);
                affirmationEl.textContent = '"Aujourd\'hui, je choisis de grandir et de me dépasser."';
            });
    }
    
    // Try to use TrackingManager if available
    if (window.trackingManager) {
        console.log('TrackingManager available, loading data...');
        window.trackingManager.currentDate = date;
        
        // Load data
        fetch(`api/tracking.php?action=get_day_data&date=${date}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.trackingManager.currentDayData = data.data || {};
                    window.trackingManager.populateDayForm(window.trackingManager.currentDayData);
                }
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });
    }
    
    // Load custom trackers
    if (typeof window.loadCustomTrackers === 'function') {
        window.loadCustomTrackers(date);
    }
    
    // Verify modal is visible
    setTimeout(() => {
        const computedStyle = window.getComputedStyle(modal);
        console.log('=== FINAL VERIFICATION ===');
        console.log('Hidden class present:', modal.classList.contains('hidden'));
        console.log('Computed display:', computedStyle.display);
        console.log('Computed visibility:', computedStyle.visibility);
        console.log('Computed opacity:', computedStyle.opacity);
        
        if (modal.classList.contains('hidden') || computedStyle.display === 'none') {
            console.error('MODAL STILL HIDDEN! Forcing with !important');
            modal.style.setProperty('display', 'flex', 'important');
            modal.style.setProperty('visibility', 'visible', 'important');
            modal.style.setProperty('opacity', '1', 'important');
        }
    }, 100);
};

window.closeDayModal = function() {
    console.log('=== GLOBAL closeDayModal called ===');
    const modal = document.getElementById('dayModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('Modal closed');
    }
};

window.toggleCheckbox = function(id) {
    console.log('=== GLOBAL toggleCheckbox called ===', id);
    const checkbox = document.getElementById(id);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        console.log('Checkbox toggled:', id, 'new state:', checkbox.checked);
    } else {
        console.error('Checkbox not found:', id);
    }
};

// Setup when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM CONTENT LOADED ===');
    
    // Test modal immediately
    const modal = document.getElementById('dayModal');
    console.log('Modal exists on DOM ready:', !!modal);
    if (modal) {
        console.log('Modal initial classes:', modal.className);
    }
    
    // Setup calendar event listeners
    const calendarDays = document.querySelectorAll('.calendar-day');
    console.log('Found calendar days:', calendarDays.length);
    
    calendarDays.forEach((day, index) => {
        console.log(`Setting up listener for day ${index + 1}`);
        day.addEventListener('click', function(e) {
            const date = this.getAttribute('data-date');
            const action = this.getAttribute('data-action');
            
            console.log('=== CALENDAR DAY CLICKED ===');
            console.log('Date:', date);
            console.log('Action:', action);
            
            if (action === 'open-day') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Calling openDayModal...');
                window.openDayModal(date);
            } else if (action === 'login') {
                console.log('Should show login modal');
                if (window.showLoginModal) {
                    window.showLoginModal();
                }
            }
        });
    });
});

// Also setup on window load as backup
window.addEventListener('load', function() {
    console.log('=== WINDOW LOADED ===');
    
    // Double check everything is ready
    console.log('Functions available:');
    console.log('- openDayModal:', typeof window.openDayModal);
    console.log('- closeDayModal:', typeof window.closeDayModal);
    console.log('- toggleCheckbox:', typeof window.toggleCheckbox);
    
    // Test function for manual testing
    window.testModalOpen = function() {
        console.log('=== MANUAL TEST ===');
        window.openDayModal('2025-06-15');
    };
    
    console.log('Available test: testModalOpen()');
});
</script>

</body>
</html>