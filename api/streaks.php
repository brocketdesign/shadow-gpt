<?php
require_once '../classes.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Initialisation
$database = new Database();
$userService = new UserService($database);
$streakService = new StreakService($database);

// Gérer les requêtes
$action = $_POST['action'] ?? $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get_current_streaks':
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            // Get year and month from request, default to current month
            $year = (int)($_GET['year'] ?? $_POST['year'] ?? date('Y'));
            $month = (int)($_GET['month'] ?? $_POST['month'] ?? date('m'));
            
            error_log("Getting streaks for user {$user['id']}, year {$year}, month {$month}");
            
            $streaks = $streakService->getCurrentStreaks($user['id'], $year, $month);
            error_log("Streaks result: " . json_encode($streaks));
            
            echo json_encode(['success' => true, 'streaks' => $streaks]);
            break;
            
        case 'get_streak_history':
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $days = (int)($_GET['days'] ?? 30);
            $history = $streakService->getStreakHistory($user['id'], $days);
            echo json_encode(['success' => true, 'history' => $history]);
            break;
            
        case 'get_best_streaks':
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $bestStreaks = $streakService->getBestStreaks($user['id']);
            echo json_encode(['success' => true, 'best_streaks' => $bestStreaks]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Action non reconnue: ' . $action]);
            break;
    }
} catch (Exception $e) {
    error_log('Streaks API Error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>
