<?php
/**
 * Temporary administrative password reset portal.
 *
 * ⚠️ IMPORTANT: Remove this file once you have finished resetting passwords.
 * It bypasses regular authentication to simplify recovery when access is lost.
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();

require_once __DIR__ . '/classes.php';

$database = new Database();
$userService = new UserService($database);

$feedback = null;
$selectedUserId = null;

error_log('Temporary password reset page accessed via ' . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'));

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Extract and sanitise inputs from the form.
        $selectedUserId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;
        $newPassword = trim($_POST['new_password'] ?? '');
        $confirmPassword = trim($_POST['confirm_password'] ?? '');

        error_log('Password reset submission for user ID ' . $selectedUserId);

        // Basic form validation before attempting to update the credential.
        if ($selectedUserId <= 0) {
            $feedback = ['type' => 'error', 'message' => "Veuillez sélectionner un utilisateur valide."];
            error_log('Password reset failed: invalid user id');
        } elseif (empty($newPassword) || empty($confirmPassword)) {
            $feedback = ['type' => 'error', 'message' => "Le mot de passe et sa confirmation sont requis."];
            error_log('Password reset failed: missing password values');
        } elseif ($newPassword !== $confirmPassword) {
            $feedback = ['type' => 'error', 'message' => "Les mots de passe ne correspondent pas."];
            error_log('Password reset failed: passwords do not match');
        } elseif (strlen($newPassword) < 8) {
            $feedback = ['type' => 'error', 'message' => "Utilisez un mot de passe d'au moins 8 caractères."];
            error_log('Password reset failed: password too short');
        } else {
            $result = $userService->updatePasswordById($selectedUserId, $newPassword);

            if ($result['success'] ?? false) {
                $feedback = ['type' => 'success', 'message' => 'Mot de passe mis à jour avec succès ✅'];
                error_log('Password reset success for user ID ' . $selectedUserId);
            } else {
                $feedback = ['type' => 'error', 'message' => $result['message'] ?? 'Une erreur est survenue.'];
                error_log('Password reset failed at service layer: ' . ($result['message'] ?? 'unknown reason'));
            }
        }
    }

    // Always fetch fresh user data so the UI reflects the latest state.
    $users = $userService->getAllUsers();
} catch (Exception $e) {
    error_log('Temporary password reset fatal error: ' . $e->getMessage());
    $feedback = ['type' => 'error', 'message' => "Erreur inattendue : " . htmlspecialchars($e->getMessage())];
    $users = [];
}

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation Temporaire des Mots de Passe</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .backdrop {
            background: radial-gradient(circle at top, rgba(79, 70, 229, 0.12), transparent 55%),
                        radial-gradient(circle at bottom, rgba(79, 70, 229, 0.08), transparent 45%),
                        #f8fafc;
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center backdrop">
    <div class="w-full max-w-3xl mx-auto p-8">
        <!-- Header section with quick guidance -->
        <div class="bg-indigo-600/90 text-white rounded-2xl shadow-xl p-8 mb-8">
            <h1 class="text-3xl font-bold mb-2">🔐 Réinitialisation Temporaire</h1>
            <p class="text-indigo-50 text-sm leading-relaxed">
                Utilisez cette interface exceptionnelle pour sélectionner un utilisateur et lui attribuer un nouveau mot de passe.
                Pensez à <strong>supprimer ce fichier</strong> dès que la récupération est terminée pour protéger l'application.
            </p>
        </div>

        <?php if (!empty($feedback)): ?>
            <div class="mb-6">
                <div class="rounded-xl border px-5 py-4 text-sm font-medium <?php echo $feedback['type'] === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'; ?>">
                    <?php echo htmlspecialchars($feedback['message']); ?>
                </div>
            </div>
        <?php endif; ?>

        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div class="px-8 py-6 border-b border-slate-100 bg-slate-50">
                <h2 class="text-xl font-semibold text-slate-800">1. Sélectionnez l'utilisateur concerné</h2>
                <p class="text-sm text-slate-500 mt-1">
                    La liste ci-dessous provient directement de la base de données. Les utilisateurs sont triés par email.
                </p>
            </div>

            <form method="POST" class="space-y-10 p-8">
                <!-- User selector -->
                <div>
                    <label for="user_id" class="block text-sm font-semibold text-slate-700 mb-2">
                        Utilisateur à mettre à jour
                    </label>
                    <div class="relative">
                        <select id="user_id" name="user_id" required class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                            <option value="">-- Choisissez un compte --</option>
                            <?php foreach ($users as $user): ?>
                                <option value="<?php echo (int)$user['id']; ?>" <?php echo ((int)$user['id'] === (int)$selectedUserId) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($user['email']); ?>
                                    <?php if (!empty($user['name'])): ?>
                                        (<?php echo htmlspecialchars($user['name']); ?>)
                                    <?php endif; ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">⌄</span>
                    </div>
                </div>

                <!-- Password fields -->
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label for="new_password" class="block text-sm font-semibold text-slate-700 mb-2">Nouveau mot de passe</label>
                        <input type="password" id="new_password" name="new_password" minlength="8" required placeholder="••••••••" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                        <p class="mt-2 text-xs text-slate-500">Minimum 8 caractères. Combinez lettres, chiffres et symboles pour plus de sécurité.</p>
                    </div>
                    <div>
                        <label for="confirm_password" class="block text-sm font-semibold text-slate-700 mb-2">Confirmez le mot de passe</label>
                        <input type="password" id="confirm_password" name="confirm_password" minlength="8" required placeholder="••••••••" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                    </div>
                </div>

                <!-- Submit button with reassurance -->
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div class="text-xs text-slate-500 leading-relaxed">
                        Chaque changement est consigné dans les logs PHP pour faciliter le suivi.<br>
                        Assurez-vous de communiquer le mot de passe temporaire à l'utilisateur concerné.
                    </div>
                    <button type="submit" class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                        <span>Mettre à jour le mot de passe</span>
                        <span>⚡️</span>
                    </button>
                </div>
            </form>
        </div>

        <!-- Gentle reminder footer -->
        <div class="mt-10 text-center text-xs text-slate-400">
            Page de maintenance temporaire. Supprimez <code>temporary-password-reset.php</code> une fois la procédure terminée.
        </div>
    </div>
</body>
</html>
