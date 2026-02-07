<?php
// Configuration de l'application Zenith AI
// Ton guide personnel pour la transformation

// Load local configuration with secrets
$localConfig = __DIR__ . '/config_local.php';
if (file_exists($localConfig)) {
    require_once $localConfig;
} else {
    die('Error: config_local.php not found. Please copy config_local.example.php to config_local.php and configure your settings.');
}

// Configuration de l'application
define('APP_NAME', 'Zenith AI - Guide Personnel');
define('TIMEZONE', 'Europe/Paris');

// Définir le fuseau horaire
date_default_timezone_set(TIMEZONE);

// Messages motivationnels par défaut
define('DEFAULT_MANTRAS', [
    "Avec discipline, la liberté est une délivrance. Sans discipline, la liberté est un piège.",
    "Chaque jour est une nouvelle opportunité de devenir la meilleure version de moi-même.",
    "Ma force intérieure grandit à chaque choix conscient que je fais.",
    "Je construis ma liberté financière brique par brique, jour après jour.",
    "Les vices d'hier ne définissent pas l'homme que je deviens aujourd'hui."
]);

// Configuration des SAVERS
define('SAVERS', [
    'S' => 'Silence (Méditation/Respiration)', 
    'A' => 'Affirmations',
    'V' => 'Visualisation',
    'E' => 'Exercise (Sport/Mouvement)',
    'R' => 'Reading (Lecture/Apprentissage)',
    'S2' => 'Scribing (Écriture/Journal)'
]);

// Configuration des vices à tracker
define('VICES', [
    'coke' => 'Coca/Sodas 🥤',
    'beer' => 'Bière/Alcool 🍺', 
    'weed' => 'Cannabis 🌿',
    'sns' => 'SNS (+30min) 📱',
    'porn' => 'Contenu Pornographique 🔞'
]);

?>
