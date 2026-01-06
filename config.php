<?php
// Configuration de l'application Shadow GPT
// Ton guide personnel pour la transformation

// Configuration de la base de données Hostinger
define('DB_HOST', 'localhost'); // Toujours localhost pour Hostinger
define('DB_NAME', 'u114685281_shadowgpt'); 
define('DB_USER', 'u114685281_shadowgpt'); 
define('DB_PASS', '5zT$pu=8e');

// Clé API OpenAI
define('OPENAI_API_KEY', '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');

// Configuration de l'application
define('APP_NAME', 'Shadow GPT - Guide Personnel');
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
