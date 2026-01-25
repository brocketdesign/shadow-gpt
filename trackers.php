<?php
// Debug errors - REMOVE IN PRODUCTION
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();

require_once 'classes.php';

// Initialisation
$database = new Database();
$database->initTables();
$userService = new UserService($database);

// Vérifier l'authentification
$currentUser = $userService->getCurrentUser();

if (!$currentUser) {
    header('Location: index.php');
    exit;
}

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

$pageTitle = 'Dashboard Trackers';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?> | <?= $monthNameFr ?> <?= $currentYear ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg {
            background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
        }
        @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body class="bg-gray-50">

<div class="max-w-6xl mx-auto p-6">
    <!-- Navigation -->
    <div class="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <a href="index.php" class="text-gray-600 hover:text-gray-800">
                    ← Retour au calendrier
                </a>
            </div>
            <div class="flex items-center space-x-3">
                <span class="text-lg font-semibold text-gray-800">
                    👋 <?= htmlspecialchars($currentUser['name'] ?: explode('@', $currentUser['email'])[0]) ?>
                </span>
            </div>
        </div>
    </div>

    <!-- En-tête -->
    <div class="gradient-bg text-white p-8 rounded-xl mb-8">
        <h1 class="text-3xl font-bold mb-4 text-center">📊 Dashboard Trackers Personnalisés</h1>
        
        <!-- Month Navigation -->
        <div class="flex items-center justify-center mb-4 space-x-4">
            <a href="?year=<?= $prevYear ?>&month=<?= $prevMonth ?>" 
               class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <span>←</span>
                <span class="hidden sm:inline"><?= date('M', mktime(0, 0, 0, $prevMonth, 1, $prevYear)) ?></span>
            </a>
            
            <h2 class="text-2xl font-semibold min-w-[200px] text-center"><?= $monthNameFr ?> <?= $currentYear ?></h2>
            
            <a href="?year=<?= $nextYear ?>&month=<?= $nextMonth ?>" 
               class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <span class="hidden sm:inline"><?= date('M', mktime(0, 0, 0, $nextMonth, 1, $nextYear)) ?></span>
                <span>→</span>
            </a>
        </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" id="statsContainer">
        <div class="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div class="text-4xl font-bold text-teal-600" id="totalAmount">--</div>
            <div class="text-gray-600 mt-2">💰 Total du mois</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div class="text-4xl font-bold text-blue-600" id="daysWithEntries">--</div>
            <div class="text-gray-600 mt-2">📅 Jours avec entrées</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div class="text-4xl font-bold text-purple-600" id="totalEntries">--</div>
            <div class="text-gray-600 mt-2">📝 Nombre d'entrées</div>
        </div>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl shadow-sm border p-4 mb-6 no-print">
        <div class="flex flex-wrap items-center gap-4">
            <label class="font-semibold text-gray-700">🔍 Filtrer par tracker:</label>
            <select id="trackerFilter" onchange="filterEntries()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                <option value="">Tous les trackers</option>
            </select>
            <button onclick="window.print()" class="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                🖨️ Imprimer
            </button>
        </div>
    </div>

    <!-- Totals by Tracker -->
    <div class="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">📈 Totaux par Tracker</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="totalsContainer">
            <div class="text-gray-500 italic">Chargement...</div>
        </div>
    </div>

    <!-- Detailed Entries -->
    <div class="bg-white rounded-xl shadow-sm border p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">📋 Détail des Entrées</h3>
        
        <div class="overflow-x-auto">
            <table class="w-full" id="entriesTable">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                        <th class="px-4 py-3 text-left font-semibold text-gray-700">Tracker</th>
                        <th class="px-4 py-3 text-right font-semibold text-gray-700">Montant</th>
                        <th class="px-4 py-3 text-center font-semibold text-gray-700 no-print">Actions</th>
                    </tr>
                </thead>
                <tbody id="entriesBody">
                    <tr>
                        <td colspan="4" class="px-4 py-8 text-center text-gray-500 italic">Chargement...</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div id="noEntriesMessage" class="hidden text-center py-8 text-gray-500 italic">
            Aucune entrée pour ce mois. Ajoutez des trackers depuis le calendrier !
        </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-gray-500 text-sm no-print">
        <p>Shadow GPT - Dashboard Trackers Personnalisés</p>
    </div>
</div>

<script>
const currentYear = <?= $currentYear ?>;
const currentMonth = <?= $currentMonth ?>;
let allEntries = [];
let allTotals = [];

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch(`api/tracking.php?action=get_trackers_dashboard&year=${currentYear}&month=${currentMonth}`);
        const data = await response.json();
        
        if (data.success) {
            // Update stats
            updateStats(data.stats);
            
            // Update totals
            allTotals = data.totals;
            renderTotals(allTotals);
            
            // Update entries
            allEntries = data.entries;
            renderEntries(allEntries);
            
            // Populate filter
            populateFilter(allTotals);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function updateStats(stats) {
    document.getElementById('totalAmount').textContent = parseFloat(stats.total_amount || 0).toFixed(2) + ' €';
    document.getElementById('daysWithEntries').textContent = stats.days_with_entries || 0;
    document.getElementById('totalEntries').textContent = stats.total_entries || 0;
}

function renderTotals(totals) {
    const container = document.getElementById('totalsContainer');
    
    if (!totals || totals.length === 0) {
        container.innerHTML = '<div class="text-gray-500 italic col-span-full">Aucun tracker créé</div>';
        return;
    }
    
    let html = '';
    totals.forEach(tracker => {
        const total = parseFloat(tracker.monthly_total).toFixed(2);
        const hasEntries = parseFloat(tracker.monthly_total) > 0;
        html += `
            <div class="p-4 rounded-lg border ${hasEntries ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'}">
                <div class="font-semibold ${hasEntries ? 'text-teal-700' : 'text-gray-600'}">${escapeHtml(tracker.title)}</div>
                <div class="text-2xl font-bold ${hasEntries ? 'text-teal-600' : 'text-gray-400'}">${total} €</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderEntries(entries) {
    const tbody = document.getElementById('entriesBody');
    const noEntriesMsg = document.getElementById('noEntriesMessage');
    const table = document.getElementById('entriesTable');
    
    if (!entries || entries.length === 0) {
        tbody.innerHTML = '';
        table.classList.add('hidden');
        noEntriesMsg.classList.remove('hidden');
        return;
    }
    
    table.classList.remove('hidden');
    noEntriesMsg.classList.add('hidden');
    
    let html = '';
    let currentDate = '';
    
    entries.forEach(entry => {
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('fr-FR', { 
            weekday: 'short', day: 'numeric', month: 'short' 
        });
        const amount = parseFloat(entry.amount).toFixed(2);
        
        // Group by date with visual separator
        const isNewDate = entry.date !== currentDate;
        currentDate = entry.date;
        
        html += `
            <tr class="border-b hover:bg-gray-50 ${isNewDate ? 'border-t-2 border-t-gray-300' : ''}" data-tracker-id="${entry.tracker_id}">
                <td class="px-4 py-3 ${isNewDate ? 'font-semibold' : 'text-gray-400'}">${isNewDate ? formattedDate : ''}</td>
                <td class="px-4 py-3">
                    <span class="inline-block px-2 py-1 bg-teal-100 text-teal-700 rounded text-sm">
                        ${escapeHtml(entry.title)}
                    </span>
                </td>
                <td class="px-4 py-3 text-right font-mono font-semibold">${amount} €</td>
                <td class="px-4 py-3 text-center no-print">
                    <button onclick="deleteEntry(${entry.tracker_id}, '${entry.date}', '${escapeHtml(entry.title)}')" 
                            class="text-red-500 hover:text-red-700 text-sm">
                        🗑️ Supprimer
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function populateFilter(totals) {
    const select = document.getElementById('trackerFilter');
    let html = '<option value="">Tous les trackers</option>';
    
    totals.forEach(tracker => {
        html += `<option value="${tracker.tracker_id}">${escapeHtml(tracker.title)}</option>`;
    });
    
    select.innerHTML = html;
}

function filterEntries() {
    const trackerId = document.getElementById('trackerFilter').value;
    
    if (!trackerId) {
        renderEntries(allEntries);
    } else {
        const filtered = allEntries.filter(e => e.tracker_id == trackerId);
        renderEntries(filtered);
    }
}

async function deleteEntry(trackerId, date, title) {
    if (!confirm(`Supprimer l'entrée "${title}" du ${new Date(date).toLocaleDateString('fr-FR')} ?`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'delete_tracker_entry');
        formData.append('tracker_id', trackerId);
        formData.append('date', date);
        
        const response = await fetch('api/tracking.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reload dashboard
            loadDashboardData();
        } else {
            alert('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Erreur de connexion');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load data on page load
document.addEventListener('DOMContentLoaded', loadDashboardData);
</script>

</body>
</html>
