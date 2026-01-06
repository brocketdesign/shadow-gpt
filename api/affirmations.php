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
$openAI = new OpenAIService($database);

// Gérer les requêtes
$action = $_POST['action'] ?? $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get_affirmation':
            $date = $_GET['date'] ?? date('Y-m-d');
            
            // Add date to the context to ensure unique affirmations
            $dayOfWeek = date('l', strtotime($date));
            $formattedDate = date('d/m/Y', strtotime($date));
            $context = "Date: $formattedDate ($dayOfWeek). Generate a unique daily affirmation for this specific date.";
            
            $affirmation = $openAI->getDailyAffirmation($date, $context);
            echo json_encode(['success' => true, 'affirmation' => $affirmation, 'date' => $date]);
            break;
            
        case 'generate_affirmation':
            $context = $_POST['context'] ?? '';
            $date = $_POST['date'] ?? date('Y-m-d');
            $affirmation = $openAI->generateDailyAffirmation($context, $date);
            echo json_encode(['success' => true, 'affirmation' => $affirmation]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Action non reconnue']);
            break;
    }
} catch (Exception $e) {
    error_log('Affirmations API Error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
?>
