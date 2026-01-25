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
$tracking = new TrackingService($database);

// Gérer les requêtes
$action = $_POST['action'] ?? $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'update_tracking':
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $date = $_POST['date'] ?? '';
            $field = $_POST['field'] ?? '';
            $value = isset($_POST['value']) ? (bool)$_POST['value'] : false;
            
            if (empty($date) || empty($field)) {
                echo json_encode(['success' => false, 'message' => 'Données manquantes']);
                exit;
            }
            
            $tracking->getOrCreateDayData($date, $user['id']);
            $result = $tracking->updateDayData($date, $user['id'], [$field => $value]);
            
            echo json_encode(['success' => $result]);
            break;
            
        case 'update_day_details':
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $date = $_POST['date'] ?? '';
            if (empty($date)) {
                echo json_encode(['success' => false, 'message' => 'Date manquante']);
                exit;
            }
            
            // Debug: Log the user and date
            error_log("Updating day details for user " . $user['id'] . " and date " . $date);
            
            $data = [];
            
            // SAVERS - Les checkboxes non cochées ne sont pas envoyées dans $_POST
            $saversFields = ['savers_silence', 'savers_affirmations', 'savers_visualization', 'savers_exercise', 'savers_reading', 'savers_scribing'];
            foreach ($saversFields as $field) {
                $data[$field] = isset($_POST[$field]) ? 1 : 0;
            }
            
            // Vices
            $vicesFields = ['vice_free_coke', 'vice_free_beer', 'vice_free_weed', 'vice_free_sns', 'vice_free_porn'];
            foreach ($vicesFields as $field) {
                $data[$field] = isset($_POST[$field]) ? 1 : 0;
            }
            
            // Autres champs
            if (isset($_POST['notes'])) {
                $data['notes'] = trim($_POST['notes']);
            }
            if (isset($_POST['mood_rating'])) {
                $data['mood_rating'] = max(1, min(10, (int)$_POST['mood_rating']));
            }
            if (isset($_POST['energy_level'])) {
                $data['energy_level'] = max(1, min(10, (int)$_POST['energy_level']));
            }
            if (isset($_POST['daily_affirmation'])) {
                $data['daily_affirmation'] = $_POST['daily_affirmation'];
            }
            
            // Debug: Log the data to be saved
            error_log("Data to save: " . json_encode($data));
            
            try {
                // Créer ou mettre à jour les données du jour
                $tracking->getOrCreateDayData($date, $user['id']);
                $result = $tracking->updateDayData($date, $user['id'], $data);
                
                error_log("Update result: " . ($result ? 'success' : 'failed'));
                echo json_encode(['success' => $result, 'message' => $result ? 'Sauvegardé' : 'Erreur de sauvegarde']);
            } catch (Exception $e) {
                error_log("Database error in update_day_details: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erreur base de données: ' . $e->getMessage()]);
            }
            break;
            
        case 'get_day_data':
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $date = $_GET['date'] ?? '';
            if (empty($date)) {
                echo json_encode(['success' => false, 'message' => 'Date manquante']);
                exit;
            }
            
            $dayData = $tracking->getOrCreateDayData($date, $user['id']);
            echo json_encode(['success' => true, 'data' => $dayData]);
            break;
            
        case 'get_month_summary':
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $year = $_GET['year'] ?? date('Y');
            $month = str_pad($_GET['month'] ?? date('m'), 2, '0', STR_PAD_LEFT);
            
            try {
                $summary = $tracking->getMonthSummary($year, $month, $user['id']);
                echo json_encode(['success' => true, 'summary' => $summary]);
            } catch (Exception $e) {
                error_log('Month summary error: ' . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erreur lors du calcul des statistiques']);
            }
            break;
            
        case 'get_available_months':
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            try {
                $months = $tracking->getAvailableMonths($user['id']);
                echo json_encode(['success' => true, 'months' => $months]);
            } catch (Exception $e) {
                error_log('Available months error: ' . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erreur lors de la récupération des mois']);
            }
            break;
            
        case 'get_custom_trackers':
            // Get trackers added for this specific date only
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $customTrackerService = new CustomTrackerService($database);
            $date = $_GET['date'] ?? date('Y-m-d');
            
            // Get year and month from date
            $dateObj = new DateTime($date);
            $year = (int)$dateObj->format('Y');
            $month = (int)$dateObj->format('m');
            
            // Get only entries for this specific date
            $trackers = $customTrackerService->getEntriesForDate($user['id'], $date);
            $monthlyTotals = $customTrackerService->getMonthlyTotals($user['id'], $year, $month);
            
            // Merge monthly totals into trackers
            $monthlyMap = [];
            foreach ($monthlyTotals as $total) {
                $monthlyMap[$total['tracker_id']] = $total['monthly_total'];
            }
            
            foreach ($trackers as &$tracker) {
                $tracker['monthly_total'] = $monthlyMap[$tracker['tracker_id']] ?? 0;
            }
            
            echo json_encode(['success' => true, 'trackers' => $trackers]);
            break;
            
        case 'get_all_trackers':
            // Get all user's trackers with monthly totals (for selection dropdown)
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $customTrackerService = new CustomTrackerService($database);
            $date = $_GET['date'] ?? date('Y-m-d');
            
            // Get year and month from date
            $dateObj = new DateTime($date);
            $year = (int)$dateObj->format('Y');
            $month = (int)$dateObj->format('m');
            
            // Get all trackers with monthly totals
            $trackers = $customTrackerService->getAllTrackersWithMonthlyTotals($user['id'], $year, $month);
            
            echo json_encode(['success' => true, 'trackers' => $trackers]);
            break;
            
        case 'delete_tracker_entry':
            // Delete a tracker entry for a specific date (remove from this day only)
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $trackerId = $_POST['tracker_id'] ?? '';
            $date = $_POST['date'] ?? '';
            
            if (empty($trackerId) || empty($date)) {
                echo json_encode(['success' => false, 'message' => 'Données manquantes']);
                exit;
            }
            
            $customTrackerService = new CustomTrackerService($database);
            $result = $customTrackerService->deleteTrackerEntry($trackerId, $date);
            
            echo json_encode(['success' => $result]);
            break;
            
        case 'create_custom_tracker':
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $title = $_POST['title'] ?? '';
            if (empty(trim($title))) {
                echo json_encode(['success' => false, 'message' => 'Titre requis']);
                exit;
            }
            
            $customTrackerService = new CustomTrackerService($database);
            $result = $customTrackerService->createTracker($user['id'], $title);
            echo json_encode($result);
            break;
            
        case 'delete_custom_tracker':
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $trackerId = $_POST['tracker_id'] ?? '';
            if (empty($trackerId)) {
                echo json_encode(['success' => false, 'message' => 'Tracker ID requis']);
                exit;
            }
            
            $customTrackerService = new CustomTrackerService($database);
            $result = $customTrackerService->deleteTracker($trackerId, $user['id']);
            echo json_encode(['success' => $result]);
            break;
            
        case 'update_custom_tracker_entry':
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $trackerId = $_POST['tracker_id'] ?? '';
            $date = $_POST['date'] ?? '';
            $amount = $_POST['amount'] ?? 0;
            
            if (empty($trackerId) || empty($date)) {
                echo json_encode(['success' => false, 'message' => 'Données manquantes']);
                exit;
            }
            
            $customTrackerService = new CustomTrackerService($database);
            $result = $customTrackerService->setTrackerEntry($trackerId, $date, $amount);
            
            // Return updated monthly total
            $dateObj = new DateTime($date);
            $year = (int)$dateObj->format('Y');
            $month = (int)$dateObj->format('m');
            $monthlyTotals = $customTrackerService->getMonthlyTotals($user['id'], $year, $month);
            
            // Find the specific tracker's monthly total
            $monthlyTotal = 0;
            foreach ($monthlyTotals as $total) {
                if ($total['tracker_id'] == $trackerId) {
                    $monthlyTotal = $total['monthly_total'];
                    break;
                }
            }
            
            echo json_encode(['success' => $result, 'monthly_total' => $monthlyTotal]);
            break;
            
        case 'get_trackers_dashboard':
            // Get all data for the trackers dashboard
            $user = $userService->getCurrentUser();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
                exit;
            }
            
            $year = (int)($_GET['year'] ?? date('Y'));
            $month = (int)($_GET['month'] ?? date('m'));
            
            $customTrackerService = new CustomTrackerService($database);
            
            // Get summary stats
            $stats = $customTrackerService->getMonthlyStats($user['id'], $year, $month);
            
            // Get totals by tracker
            $totals = $customTrackerService->getMonthlyTotals($user['id'], $year, $month);
            
            // Get detailed entries
            $entries = $customTrackerService->getMonthlyEntriesDetailed($user['id'], $year, $month);
            
            echo json_encode([
                'success' => true,
                'stats' => $stats,
                'totals' => $totals,
                'entries' => $entries
            ]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Action non reconnue: ' . $action]);
            break;
    }
} catch (Exception $e) {
    error_log('Tracking API Error: ' . $e->getMessage());
    error_log('Tracking API Stack: ' . $e->getTraceAsString());
    echo json_encode(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>
