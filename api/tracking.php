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
