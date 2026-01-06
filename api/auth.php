<?php
require_once '../classes.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Debug errors - REMOVE IN PRODUCTION
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Start session first
session_start();

// Log the request
error_log('Auth API called - Method: ' . $_SERVER['REQUEST_METHOD'] . ', Action: ' . ($_POST['action'] ?? $_GET['action'] ?? 'none'));

// Initialisation
$database = new Database();
$userService = new UserService($database);

// Gérer les requêtes
$action = $_POST['action'] ?? $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'login':
            $email = trim($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';
            
            error_log('Login attempt for email: ' . $email);
            
            if (empty($email) || empty($password)) {
                echo json_encode(['success' => false, 'message' => 'Email et mot de passe requis']);
                exit;
            }
            
            $result = $userService->login($email, $password);
            error_log('Login result: ' . ($result['success'] ? 'SUCCESS' : 'FAILED - ' . ($result['message'] ?? 'Unknown error')));
            
            // Ensure proper session and cookie handling
            if ($result['success'] && isset($result['session_token'])) {
                // Set both session and cookie
                $_SESSION['user_id'] = $result['user']['id'];
                $_SESSION['session_token'] = $result['session_token'];
                
                // Set cookie with proper parameters
                $expiry = time() + (30 * 24 * 60 * 60); // 30 days
                $cookieSet = setcookie('session_token', $result['session_token'], [
                    'expires' => $expiry,
                    'path' => '/',
                    'domain' => '',
                    'secure' => false, // set to true in production with HTTPS
                    'httponly' => true,
                    'samesite' => 'Lax'
                ]);
                
                error_log('Cookie set: ' . ($cookieSet ? 'SUCCESS' : 'FAILED'));
                error_log('Session user_id: ' . $_SESSION['user_id']);
                
                // Return complete user data
                $result['authenticated'] = true;
                $result['redirect'] = true;
            }
            
            echo json_encode($result);
            break;
            
        case 'register':
            $email = trim($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';
            $name = trim($_POST['name'] ?? '');
            
            error_log('Register attempt for email: ' . $email . ', name: ' . $name);
            
            if (empty($email) || empty($password)) {
                echo json_encode(['success' => false, 'message' => 'Email et mot de passe requis']);
                exit;
            }
            
            if (empty($name)) {
                echo json_encode(['success' => false, 'message' => 'Le nom est requis']);
                exit;
            }
            
            $result = $userService->register($email, $password, $name);
            error_log('Register result: ' . ($result['success'] ? 'SUCCESS' : 'FAILED - ' . ($result['message'] ?? 'Unknown error')));
            
            // Auto-login after registration
            if ($result['success']) {
                $loginResult = $userService->login($email, $password);
                if ($loginResult['success']) {
                    $_SESSION['user_id'] = $loginResult['user']['id'];
                    $_SESSION['session_token'] = $loginResult['session_token'];
                    
                    $expiry = time() + (30 * 24 * 60 * 60);
                    setcookie('session_token', $loginResult['session_token'], [
                        'expires' => $expiry,
                        'path' => '/',
                        'domain' => '',
                        'secure' => false,
                        'httponly' => true,
                        'samesite' => 'Lax'
                    ]);
                    
                    $result['user'] = $loginResult['user'];
                    $result['session_token'] = $loginResult['session_token'];
                    $result['authenticated'] = true;
                    $result['redirect'] = true;
                    
                    error_log('Auto-login after registration successful');
                }
            }
            
            echo json_encode($result);
            break;
            
        case 'logout':
            error_log('Logout requested');
            
            // Clear session and cookie
            session_destroy();
            setcookie('session_token', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'domain' => '',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            
            echo json_encode(['success' => true, 'authenticated' => false]);
            break;
            
        case 'check_auth':
            $user = $userService->getCurrentUser();
            
            error_log('Auth check - User found: ' . ($user ? 'YES (ID: ' . $user['id'] . ')' : 'NO'));
            error_log('Session ID: ' . session_id());
            error_log('Has session user_id: ' . (isset($_SESSION['user_id']) ? 'YES' : 'NO'));
            error_log('Has session token: ' . (isset($_SESSION['session_token']) ? 'YES' : 'NO'));
            error_log('Has cookie: ' . (isset($_COOKIE['session_token']) ? 'YES' : 'NO'));
            
            echo json_encode([
                'success' => true,
                'authenticated' => $user !== null, 
                'user' => $user,
                'session_id' => session_id(),
                'has_cookie' => isset($_COOKIE['session_token']),
                'has_session' => isset($_SESSION['user_id'])
            ]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Action non reconnue: ' . $action]);
            break;
    }
} catch (Exception $e) {
    error_log('Auth API Error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    echo json_encode([
        'success' => false, 
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>
