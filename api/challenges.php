<?php
require_once '../classes.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Initialisation
$database = new Database();
$userService = new UserService($database);
$challengeService = new ChallengeService($database);
$openAI = new OpenAIService($database);

// Get current user
$user = $userService->getCurrentUser();
if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Non connecté']);
    exit;
}

// Gérer les requêtes
$action = $_POST['action'] ?? $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'create':
            $title = $_POST['title'] ?? '';
            $description = $_POST['description'] ?? '';
            $durationDays = (int)($_POST['duration_days'] ?? 0);
            $startDate = $_POST['start_date'] ?? null;
            
            $result = $challengeService->createChallenge($user['id'], $title, $description, $durationDays, $startDate);
            echo json_encode($result);
            break;
            
        case 'list':
            $status = $_GET['status'] ?? null;
            $challenges = $challengeService->getUserChallenges($user['id'], $status);
            
            // Add progress info to each challenge
            foreach ($challenges as &$challenge) {
                $challenge['progress'] = $challengeService->getChallengeProgress($challenge['id'], $user['id']);
            }
            
            echo json_encode(['success' => true, 'challenges' => $challenges]);
            break;
            
        case 'get':
            $challengeId = (int)($_GET['id'] ?? 0);
            if (!$challengeId) {
                echo json_encode(['success' => false, 'message' => 'ID manquant']);
                exit;
            }
            
            $challenge = $challengeService->getChallenge($challengeId, $user['id']);
            if (!$challenge) {
                echo json_encode(['success' => false, 'message' => 'Challenge non trouvé']);
                exit;
            }
            
            $checkIns = $challengeService->getChallengeCheckIns($challengeId, $user['id']);
            $progress = $challengeService->getChallengeProgress($challengeId, $user['id']);
            
            echo json_encode([
                'success' => true,
                'challenge' => $challenge,
                'check_ins' => $checkIns,
                'progress' => $progress
            ]);
            break;
            
        case 'check_in':
            $challengeId = (int)($_POST['challenge_id'] ?? 0);
            $date = $_POST['date'] ?? date('Y-m-d');
            $status = $_POST['status'] ?? 'success';
            $notes = $_POST['notes'] ?? '';
            
            if (!$challengeId) {
                echo json_encode(['success' => false, 'message' => 'ID challenge manquant']);
                exit;
            }
            
            $result = $challengeService->checkIn($challengeId, $user['id'], $date, $status, $notes);
            echo json_encode($result);
            break;
            
        case 'enhance_description':
            $description = $_POST['description'] ?? '';
            $title = $_POST['title'] ?? '';
            
            if (empty($description) && empty($title)) {
                echo json_encode(['success' => false, 'message' => 'Description ou titre requis']);
                exit;
            }
            
            // Use OpenAI to enhance the description
            $prompt = "Améliore et enrichis cette description de challenge personnel pour la rendre plus motivante et inspirante.\n\n";
            if ($title) {
                $prompt .= "Titre du challenge: $title\n";
            }
            if ($description) {
                $prompt .= "Description actuelle: $description\n";
            }
            $prompt .= "\nRéponds uniquement avec la description améliorée, sans préambule ni explication.";
            
            try {
                $systemPrompt = "Tu es un coach de vie bienveillant qui aide les gens à atteindre leurs objectifs personnels.";
                $enhanced = $openAI->generateCustomText($prompt, $systemPrompt);
                
                if ($enhanced) {
                    echo json_encode(['success' => true, 'description' => $enhanced]);
                } else {
                    // Fallback if OpenAI fails or no API key
                    $fallback = $description ?: "Challenge de transformation personnelle pour développer ta discipline et atteindre tes objectifs. Chaque jour compte, chaque effort te rapproche de la meilleure version de toi-même.";
                    echo json_encode(['success' => true, 'description' => $fallback, 'source' => 'fallback']);
                }
            } catch (Exception $e) {
                error_log('AI enhancement error: ' . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'amélioration AI']);
            }
            break;
            
        case 'update_description':
            $challengeId = (int)($_POST['challenge_id'] ?? 0);
            $description = $_POST['description'] ?? '';
            
            if (!$challengeId) {
                echo json_encode(['success' => false, 'message' => 'ID challenge manquant']);
                exit;
            }
            
            $result = $challengeService->updateChallengeDescription($challengeId, $user['id'], $description);
            echo json_encode(['success' => $result, 'message' => $result ? 'Description mise à jour' : 'Erreur']);
            break;
            
        case 'delete':
            $challengeId = (int)($_POST['challenge_id'] ?? 0);
            
            if (!$challengeId) {
                echo json_encode(['success' => false, 'message' => 'ID challenge manquant']);
                exit;
            }
            
            $result = $challengeService->deleteChallenge($challengeId, $user['id']);
            echo json_encode(['success' => $result, 'message' => $result ? 'Challenge supprimé' : 'Erreur']);
            break;
            
        case 'archive':
            $challengeId = (int)($_POST['challenge_id'] ?? 0);
            
            if (!$challengeId) {
                echo json_encode(['success' => false, 'message' => 'ID challenge manquant']);
                exit;
            }
            
            $result = $challengeService->archiveChallenge($challengeId, $user['id']);
            echo json_encode(['success' => $result, 'message' => $result ? 'Challenge archivé' : 'Erreur']);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Action non reconnue: ' . $action]);
            break;
    }
} catch (Exception $e) {
    error_log('Challenges API Error: ' . $e->getMessage());
    error_log('Challenges API Stack: ' . $e->getTraceAsString());
    echo json_encode(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>
