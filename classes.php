<?php
require_once 'config.php';

class Database {
    private $connection;
    
    public function __construct() {
        try {
            $this->connection = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
                DB_USER,
                DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        } catch(PDOException $e) {
            die("Erreur de connexion à la base de données : " . $e->getMessage());
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function initTables() {
        // First create tables with basic structure
        $sql = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS daily_tracking (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            date DATE NOT NULL,
            savers_silence BOOLEAN DEFAULT FALSE,
            savers_affirmations BOOLEAN DEFAULT FALSE,
            savers_visualization BOOLEAN DEFAULT FALSE,
            savers_exercise BOOLEAN DEFAULT FALSE,
            savers_reading BOOLEAN DEFAULT FALSE,
            savers_scribing BOOLEAN DEFAULT FALSE,
            vice_free_coke BOOLEAN DEFAULT FALSE,
            vice_free_beer BOOLEAN DEFAULT FALSE,
            vice_free_weed BOOLEAN DEFAULT FALSE,
            vice_free_sns BOOLEAN DEFAULT FALSE,
            vice_free_porn BOOLEAN DEFAULT FALSE,
            daily_affirmation TEXT,
            notes TEXT,
            mood_rating INT DEFAULT NULL,
            energy_level INT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_date (user_id, date),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS affirmations_cache (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE NOT NULL UNIQUE,
            content TEXT NOT NULL,
            source ENUM('openai', 'manual', 'default') DEFAULT 'openai',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_token VARCHAR(255) NOT NULL UNIQUE,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        ";
        
        $this->connection->exec($sql);
        
        // Run migrations to ensure table structure is up to date
        $this->runMigrations();
    }
    
    private function runMigrations() {
        try {
            // Check if user_id column exists in daily_tracking
            $stmt = $this->connection->prepare("SHOW COLUMNS FROM daily_tracking LIKE 'user_id'");
            $stmt->execute();
            $userIdExists = $stmt->fetch();
            
            if (!$userIdExists) {
                // Add user_id column if it doesn't exist
                $this->connection->exec("ALTER TABLE daily_tracking ADD COLUMN user_id INT NOT NULL DEFAULT 1 AFTER id");
                
                // Add foreign key constraint
                $this->connection->exec("ALTER TABLE daily_tracking ADD CONSTRAINT fk_daily_tracking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
                
                // Add unique constraint
                $this->connection->exec("ALTER TABLE daily_tracking ADD UNIQUE KEY unique_user_date (user_id, date)");
                
                error_log("Migration: Added user_id column to daily_tracking table");
            }
            
            // Check other potentially missing columns and add them
            $columnsToCheck = [
                'savers_silence' => 'BOOLEAN DEFAULT FALSE',
                'savers_affirmations' => 'BOOLEAN DEFAULT FALSE', 
                'savers_visualization' => 'BOOLEAN DEFAULT FALSE',
                'savers_exercise' => 'BOOLEAN DEFAULT FALSE',
                'savers_reading' => 'BOOLEAN DEFAULT FALSE',
                'savers_scribing' => 'BOOLEAN DEFAULT FALSE',
                'vice_free_coke' => 'BOOLEAN DEFAULT FALSE',
                'vice_free_beer' => 'BOOLEAN DEFAULT FALSE',
                'vice_free_weed' => 'BOOLEAN DEFAULT FALSE',
                'vice_free_sns' => 'BOOLEAN DEFAULT FALSE',
                'vice_free_porn' => 'BOOLEAN DEFAULT FALSE',
                'daily_affirmation' => 'TEXT',
                'notes' => 'TEXT',
                'mood_rating' => 'INT DEFAULT NULL',
                'energy_level' => 'INT DEFAULT NULL'
            ];
            
            foreach ($columnsToCheck as $column => $definition) {
                $stmt = $this->connection->prepare("SHOW COLUMNS FROM daily_tracking LIKE ?");
                $stmt->execute([$column]);
                $columnExists = $stmt->fetch();
                
                if (!$columnExists) {
                    $this->connection->exec("ALTER TABLE daily_tracking ADD COLUMN $column $definition");
                    error_log("Migration: Added $column column to daily_tracking table");
                }
            }
            
        } catch (Exception $e) {
            error_log("Migration error: " . $e->getMessage());
            // Don't throw the error, just log it - the app should still work
        }
    }
}

class UserService {
    private $db;
    
    public function __construct($database) {
        $this->db = $database->getConnection();
    }
    
    public function register($email, $password, $name = '') {
        if ($this->emailExists($email)) {
            return ['success' => false, 'message' => 'Email déjà utilisé'];
        }
        
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
        
        if ($stmt->execute([$email, $hashedPassword, $name])) {
            return ['success' => true, 'user_id' => $this->db->lastInsertId()];
        }
        
        return ['success' => false, 'message' => 'Erreur lors de la création du compte'];
    }
    
    public function login($email, $password) {
        $stmt = $this->db->prepare("SELECT id, email, password, name FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($password, $user['password'])) {
            $sessionToken = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
            
            $stmt = $this->db->prepare("INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)");
            $stmt->execute([$user['id'], $sessionToken, $expiresAt]);
            
            setcookie('session_token', $sessionToken, strtotime('+30 days'), '/', '', false, true);
            
            return ['success' => true, 'user' => $user, 'session_token' => $sessionToken];
        }
        
        return ['success' => false, 'message' => 'Email ou mot de passe incorrect'];
    }

    /**
     * Retrieve a lightweight list of users for administrative actions.
     * This is primarily intended for temporary maintenance utilities.
     */
    public function getAllUsers() {
        try {
            error_log('UserService::getAllUsers invoked');
            $stmt = $this->db->prepare("SELECT id, email, name, created_at FROM users ORDER BY email ASC");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log('UserService::getAllUsers returning ' . count($users) . ' users');
            return $users;
        } catch (Exception $e) {
            error_log('UserService::getAllUsers error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Force update a user password by id. The password is hashed before persisting.
     */
    public function updatePasswordById($userId, $newPassword) {
        error_log('UserService::updatePasswordById called for user ID: ' . $userId);
        if (empty($userId) || empty($newPassword)) {
            error_log('UserService::updatePasswordById missing parameters');
            return ['success' => false, 'message' => 'Identifiant utilisateur ou mot de passe manquant'];
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        try {
            $stmt = $this->db->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$hashedPassword, $userId]);
            $rows = $stmt->rowCount();
            error_log('UserService::updatePasswordById updated rows: ' . $rows);

            if ($rows === 0) {
                return ['success' => false, 'message' => "Aucun utilisateur mis à jour. Vérifiez l'identifiant."];
            }

            return ['success' => true];
        } catch (Exception $e) {
            error_log('UserService::updatePasswordById error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Erreur lors de la mise à jour du mot de passe'];
        }
    }
    
    public function getCurrentUser() {
        if (!isset($_COOKIE['session_token'])) {
            return null;
        }
        
        try {
            $stmt = $this->db->prepare("
                SELECT u.id, u.email, u.name 
                FROM users u 
                JOIN user_sessions s ON u.id = s.user_id 
                WHERE s.session_token = ? AND s.expires_at > NOW()
            ");
            $stmt->execute([$_COOKIE['session_token']]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Debug if no user found but token exists
            if (!$result) {
                error_log('Session token exists but no matching user found: ' . $_COOKIE['session_token']);
            }
            
            return $result;
        } catch (Exception $e) {
            error_log('Error in getCurrentUser: ' . $e->getMessage());
            return null;
        }
    }
    
    public function logout() {
        if (isset($_COOKIE['session_token'])) {
            $stmt = $this->db->prepare("DELETE FROM user_sessions WHERE session_token = ?");
            $stmt->execute([$_COOKIE['session_token']]);
            setcookie('session_token', '', time() - 3600, '/');
        }
    }
    
    private function emailExists($email) {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetchColumn() > 0;
    }
}

class OpenAIService {
    private $apiKey;
    private $db;
    
    public function __construct($database) {
        $this->apiKey = OPENAI_API_KEY;
        $this->db = $database->getConnection();
    }
    
    public function getDailyAffirmation($date = null) {
        if (!$date) {
            $date = date('Y-m-d');
        }
        
        // Check cache first
        $stmt = $this->db->prepare("SELECT content FROM affirmations_cache WHERE date = ?");
        $stmt->execute([$date]);
        $cached = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($cached) {
            return $cached['content'];
        }
        
        // Generate new affirmation
        $affirmation = $this->generateAffirmation();
        
        // Cache it
        $stmt = $this->db->prepare("INSERT INTO affirmations_cache (date, content, source) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content = ?, source = ?");
        $source = (empty($this->apiKey) || $this->apiKey === 'your_openai_api_key_here') ? 'default' : 'openai';
        $stmt->execute([$date, $affirmation, $source, $affirmation, $source]);
        
        return $affirmation;
    }
    
    private function generateAffirmation() {
        if (empty($this->apiKey) || $this->apiKey === 'your_openai_api_key_here') {
            return $this->getRandomDefaultAffirmation();
        }
        
        $prompt = "Génère une affirmation puissante et motivante en français pour quelqu'un qui lutte contre des addictions (coca, bière, cannabis) et qui veut construire une vie disciplinée et libre. L'affirmation doit être directe, respectueuse, et inspirante. Maximum 150 caractères.";
        
        $data = [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => 'Tu es un coach de vie bienveillant mais direct qui aide les gens à surmonter leurs addictions et construire une vie disciplinée.'],
                ['role' => 'user', 'content' => $prompt]
            ],
            'max_tokens' => 100,
            'temperature' => 0.8
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $result = json_decode($response, true);
            return $result['choices'][0]['message']['content'] ?? $this->getRandomDefaultAffirmation();
        }
        
        return $this->getRandomDefaultAffirmation();
    }

    public function generateDailyAffirmation($context = '') {
        return $this->generateAffirmation();
    }
    
    private function getRandomDefaultAffirmation() {
        $mantras = DEFAULT_MANTRAS;
        return $mantras[array_rand($mantras)];
    }
}

class TrackingService {
    private $db;
    
    public function __construct($database) {
        $this->db = $database->getConnection();
    }
    
    public function getOrCreateDayData($date, $userId) {
        $stmt = $this->db->prepare("SELECT * FROM daily_tracking WHERE date = ? AND user_id = ?");
        $stmt->execute([$date, $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            $stmt = $this->db->prepare("INSERT INTO daily_tracking (date, user_id) VALUES (?, ?)");
            $stmt->execute([$date, $userId]);
            return $this->getOrCreateDayData($date, $userId);
        }
        
        return $result;
    }
    
    public function updateDayData($date, $userId, $data) {
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            $values[] = $value;
        }
        
        $values[] = $date;
        $values[] = $userId;
        $sql = "UPDATE daily_tracking SET " . implode(', ', $fields) . " WHERE date = ? AND user_id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }
    
    public function getMonthData($year, $month, $userId) {
        $startDate = "$year-$month-01";
        $endDate = date('Y-m-t', strtotime($startDate));
        
        $stmt = $this->db->prepare("SELECT * FROM daily_tracking WHERE date BETWEEN ? AND ? AND user_id = ? ORDER BY date");
        $stmt->execute([$startDate, $endDate, $userId]);
        
        $data = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[$row['date']] = $row;
        }
        
        return $data;
    }
    
    public function getMonthSummary($year, $month, $userId) {
        $stmt = $this->db->pdo->prepare("
            SELECT 
                COUNT(*) as total_days,
                AVG(
                    COALESCE(savers_silence, 0) + COALESCE(savers_affirmations, 0) + 
                    COALESCE(savers_visualization, 0) + COALESCE(savers_exercise, 0) + 
                    COALESCE(savers_reading, 0) + COALESCE(savers_scribing, 0) +
                    COALESCE(vice_free_coke, 0) + COALESCE(vice_free_beer, 0) + 
                    COALESCE(vice_free_weed, 0) + COALESCE(vice_free_sns, 0) + 
                    COALESCE(vice_free_porn, 0)
                ) as avg_score,
                SUM(COALESCE(savers_silence, 0)) as total_silence,
                SUM(COALESCE(savers_affirmations, 0)) as total_affirmations,
                SUM(COALESCE(savers_visualization, 0)) as total_visualization,
                SUM(COALESCE(savers_exercise, 0)) as total_exercise,
                SUM(COALESCE(savers_reading, 0)) as total_reading,
                SUM(COALESCE(savers_scribing, 0)) as total_scribing,
                SUM(COALESCE(vice_free_coke, 0)) as total_vice_free_coke,
                SUM(COALESCE(vice_free_beer, 0)) as total_vice_free_beer,
                SUM(COALESCE(vice_free_weed, 0)) as total_vice_free_weed,
                SUM(COALESCE(vice_free_sns, 0)) as total_vice_free_sns,
                SUM(COALESCE(vice_free_porn, 0)) as total_vice_free_porn,
                AVG(COALESCE(mood_rating, 0)) as avg_mood,
                AVG(COALESCE(energy_level, 0)) as avg_energy
            FROM daily_tracking 
            WHERE user_id = ? 
            AND YEAR(date) = ? 
            AND MONTH(date) = ?
            AND (
                savers_silence = 1 OR savers_affirmations = 1 OR savers_visualization = 1 OR 
                savers_exercise = 1 OR savers_reading = 1 OR savers_scribing = 1 OR
                vice_free_coke = 1 OR vice_free_beer = 1 OR vice_free_weed = 1 OR 
                vice_free_sns = 1 OR vice_free_porn = 1 OR
                notes IS NOT NULL AND notes != ''
            )
        ");
        
        $stmt->execute([$userId, $year, $month]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $result['avg_score'] = round($result['avg_score'], 1);
            $result['avg_mood'] = round($result['avg_mood'], 1);
            $result['avg_energy'] = round($result['avg_energy'], 1);
        }
        
        return $result ?: [
            'total_days' => 0,
            'avg_score' => 0,
            'avg_mood' => 0,
            'avg_energy' => 0
        ];
    }
    
    public function getAvailableMonths($userId) {
        $stmt = $this->db->pdo->prepare("
            SELECT DISTINCT 
                YEAR(date) as year, 
                MONTH(date) as month,
                COUNT(*) as day_count
            FROM daily_tracking 
            WHERE user_id = ? 
            ORDER BY year DESC, month DESC
        ");
        
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

class StreakService {
    private $db;
    
    public function __construct($database) {
        $this->db = $database->getConnection();
    }
    
    public function getCurrentStreaks($userId, $year = null, $month = null) {
        // If year/month not provided, use current month
        if ($year === null || $month === null) {
            $year = (int)date('Y');
            $month = (int)date('m');
        }
        
        return [
            'savers_total' => $this->calculateTotalSaversCount($userId, $year, $month),
            'vice_free_total' => $this->calculateTotalViceCount($userId, $year, $month),
            'perfect_day_count' => $this->calculatePerfectDayCount($userId, $year, $month),
            'tracking_days' => $this->calculateTrackingDays($userId, $year, $month)
        ];
    }
    
    private function calculateTotalSaversCount($userId, $year, $month) {
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate));
        
        error_log("calculateTotalSaversCount: user={$userId}, startDate={$startDate}, endDate={$endDate}");
        
        $stmt = $this->db->prepare("
            SELECT 
                SUM(savers_silence) + SUM(savers_affirmations) + SUM(savers_visualization) + 
                SUM(savers_exercise) + SUM(savers_reading) + SUM(savers_scribing) as total
            FROM daily_tracking 
            WHERE user_id = ? 
            AND date BETWEEN ? AND ?
        ");
        $stmt->execute([$userId, $startDate, $endDate]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $total = (int)($result['total'] ?? 0);
        error_log("calculateTotalSaversCount result: {$total}");
        return $total;
    }
    
    private function calculateTotalViceCount($userId, $year, $month) {
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate));
        
        error_log("calculateTotalViceCount: user={$userId}, startDate={$startDate}, endDate={$endDate}");
        
        $stmt = $this->db->prepare("
            SELECT 
                SUM(vice_free_coke) + SUM(vice_free_beer) + SUM(vice_free_weed) + 
                SUM(vice_free_sns) + SUM(vice_free_porn) as total
            FROM daily_tracking 
            WHERE user_id = ? 
            AND date BETWEEN ? AND ?
        ");
        $stmt->execute([$userId, $startDate, $endDate]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $total = (int)($result['total'] ?? 0);
        error_log("calculateTotalViceCount result: {$total}");
        return $total;
    }
    
    private function calculatePerfectDayCount($userId, $year, $month) {
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate));
        
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as total 
            FROM daily_tracking 
            WHERE user_id = ? 
            AND date BETWEEN ? AND ?
            AND savers_silence = 1 
            AND savers_affirmations = 1 
            AND savers_visualization = 1 
            AND savers_exercise = 1 
            AND savers_reading = 1 
            AND savers_scribing = 1
            AND vice_free_coke = 1 
            AND vice_free_beer = 1 
            AND vice_free_weed = 1 
            AND vice_free_sns = 1 
            AND vice_free_porn = 1
        ");
        $stmt->execute([$userId, $startDate, $endDate]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['total'] ?? 0);
    }
    
    private function calculateTrackingDays($userId, $year, $month) {
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate));
        
        error_log("calculateTrackingDays: user={$userId}, startDate={$startDate}, endDate={$endDate}");
        
        // Count distinct days with ANY tracking data
        $stmt = $this->db->prepare("
            SELECT COUNT(DISTINCT date) as total 
            FROM daily_tracking 
            WHERE user_id = ? 
            AND date BETWEEN ? AND ?
        ");
        $stmt->execute([$userId, $startDate, $endDate]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $total = (int)($result['total'] ?? 0);
        error_log("calculateTrackingDays result: {$total}");
        return $total;
    }
    
    public function getBestStreaks($userId) {
        // This would require storing historical streak data
        // For now, return current streaks as "best"
        return $this->getCurrentStreaks($userId);
    }
    
    public function getStreakHistory($userId, $days = 30) {
        $endDate = date('Y-m-d');
        $startDate = date('Y-m-d', strtotime("-{$days} days"));
        
        $history = [];
        $currentDate = $startDate;
        
        while ($currentDate <= $endDate) {
            $streaks = $this->getCurrentStreaks($userId);
            $history[$currentDate] = $streaks;
            $currentDate = date('Y-m-d', strtotime($currentDate . ' +1 day'));
        }
        
        return $history;
    }
}
?>
