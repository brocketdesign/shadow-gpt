# Shadow GPT - Guide Personnel 🌟

## Description

Shadow GPT est ton guide personnel pour cultiver discipline, clarté mentale, force intérieure et santé financière. Cette application web te permet de tracker tes habitudes quotidiennes SAVERS (Miracle Morning) et de rester libre de tes vices (coca, bière, cannabis).

**Mantra central :** *"Avec discipline, la liberté est une délivrance. Sans discipline, la liberté est un piège."*

## Fonctionnalités

### 🎯 Tracking Quotidien
- **SAVERS** : Silence, Affirmations, Visualisation, Exercise, Reading, Scribing
- **Vices Free** : Suivi de l'abstinence (coca, bière, cannabis)
- Calendrier mensuel imprimable en format A4
- Score quotidien et mensuel

### 💬 Affirmations Intelligentes
- Génération d'affirmations quotidiennes via OpenAI API
- Affirmations par défaut si API indisponible
- Personnalisées selon ton parcours de transformation

### 📊 Visualisation
- Interface moderne avec Tailwind CSS
- Design optimisé pour l'impression PDF
- Emojis motivants et couleurs inspirantes
- Responsive design

### 🗄️ Persistance des Données
- Base de données MySQL pour sauvegarder tes progrès
- Historique complet de ton évolution
- Possibilité d'ajouter des notes personnelles

## Installation

### Prérequis
- PHP 7.4 ou supérieur
- MySQL 5.7 ou supérieur
- Serveur web (Apache/Nginx) ou utilise le serveur intégré PHP
- Clé API OpenAI (optionnelle)

### 1. Configuration de la Base de Données

Crée une base de données MySQL :
```sql
CREATE DATABASE shadow_gpt;
```

### 2. Configuration du Projet

1. Clone le repository :
```bash
git clone [TON_REPO_URL]
cd shadow-gpt
```

2. Configure tes paramètres dans `config.php` :
```php
// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'shadow_gpt');
define('DB_USER', 'ton_nom_utilisateur');
define('DB_PASS', 'ton_mot_de_passe');

// Clé API OpenAI (optionnelle)
define('OPENAI_API_KEY', 'ta_cle_api_openai');
```

### 3. Lancement

**Option 1 : Serveur PHP intégré (développement)**
```bash
php -S localhost:8000
```

**Option 2 : Apache/Nginx**
Configure ton serveur web pour pointer vers le dossier du projet.

### 4. Accès
Visite `http://localhost:8000` dans ton navigateur.

## Utilisation

### 📅 Calendrier Mensuel
- Coche les cases SAVERS pour chaque activité accomplie
- Marque tes journées "vices free" 
- Visualise ton score quotidien (sur 9 points)
- Imprime en PDF pour affichage physique

### 🖨️ Impression PDF
- Clique sur le bouton "Imprimer en PDF"
- Le design s'adapte automatiquement au format A4
- Parfait pour affichage sur ton frigo ou bureau

### 💡 Alternatives Saines
L'application suggère des alternatives pour chaque vice :
- **Coca** → Eau pétillante + citron, kombucha, thé glacé
- **Bière** → Bière sans alcool, mocktails, activité sportive  
- **Cannabis** → Méditation, respiration, marche en nature

## Structure du Projet

```
shadow-gpt/
├── config.php          # Configuration (BDD, API, constantes)
├── classes.php          # Classes PHP (Database, OpenAI, Tracking)
├── index.php            # Page principale avec calendrier
├── README.md            # Documentation
└── .gitignore          # Fichiers à ignorer par Git
```

## Personnalisation

### Changer le Mois Affiché
Dans `index.php`, modifie ces variables :
```php
$currentYear = 2025;
$currentMonth = 6; // Janvier=1, Février=2, etc.
$monthName = 'Juin';
```

### Ajouter des Affirmations Personnelles
Modifie le tableau `DEFAULT_MANTRAS` dans `config.php` :
```php
define('DEFAULT_MANTRAS', [
    "Ton affirmation personnelle 1",
    "Ton affirmation personnelle 2",
    // ...
]);
```

### Modifier les SAVERS
Personnalise le tableau `SAVERS` dans `config.php` selon tes besoins.

## API OpenAI (Optionnelle)

Pour des affirmations générées automatiquement :

1. Crée un compte sur [OpenAI](https://platform.openai.com/)
2. Génère une clé API
3. Ajoute-la dans `config.php`

Si tu n'as pas d'API key, l'application utilisera les affirmations par défaut.

## Sécurité

⚠️ **Important** : Ne commite jamais tes vrais identifiants dans Git !

- Garde `config.php` avec des valeurs par défaut dans le repo
- Configure tes vraies valeurs en local uniquement
- Utilise `.gitignore` pour protéger tes fichiers sensibles

## Support & Développement

Cette application est ton outil personnel de transformation. Elle grandit avec toi :

### Roadmap Future
- [ ] Application mobile
- [ ] Graphiques de progression
- [ ] Système de récompenses
- [ ] Intégration calendrier
- [ ] Mode équipe/accountability partner

### Contribution
Puisque c'est ton projet personnel, tu peux :
- Ajouter de nouvelles fonctionnalités selon tes besoins
- Modifier le design selon tes goûts
- Intégrer d'autres habitudes à tracker

## Philosophie

Cette application incarne ton mantra :
> *"Avec discipline, la liberté est une délivrance. Sans discipline, la liberté est un piège."*

Chaque case cochée est une victoire. Chaque jour accompli est un pas vers ta liberté.

---

**🌟 Courage, clarté, discipline. Tu as tout en toi pour réussir. 🌟**
