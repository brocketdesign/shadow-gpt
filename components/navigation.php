<?php if ($currentUser): ?>
    <!-- Navigation pour utilisateurs connectés -->
    <div class="bg-white rounded-xl shadow-sm border p-4 mb-6 w-full">
        <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <div class="text-lg font-semibold text-gray-800">
                    👋 Salut <?= htmlspecialchars($currentUser['name'] ?: explode('@', $currentUser['email'])[0]) ?> !
                </div>
                <div class="text-sm text-gray-600">
                    📅 <?= date('d/m/Y') ?>
                </div>
            </div>
            
            <div class="flex items-center space-x-3">
                <button onclick="window.print()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold no-print">
                    🖨️ Imprimer PDF
                </button>
                <a href="?action=logout" onclick="return confirm('Êtes-vous sûr de vouloir vous déconnecter ?')" 
                   class="text-gray-600 hover:text-gray-800 text-sm font-semibold no-print">
                    🚪 Déconnexion
                </a>
            </div>
        </div>
    </div>
<?php else: ?>
    <!-- Navigation pour visiteurs -->
    <div class="bg-white rounded-xl shadow-sm border p-4 mb-6 text-center w-full">
        <div class="text-gray-600 mb-3">
            Connectez-vous pour débloquer le tracking personnel et sauvegarder vos progrès
        </div>
        <div class="space-x-3">
            <button onclick="showLoginModal()" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold">
                🔑 Se connecter
            </button>
            <button onclick="showRegisterModal()" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold">
                ✨ Créer un compte
            </button>
        </div>
    </div>
<?php endif; ?>

<?php
// Handle logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    $userService->logout();
    header('Location: index.php');
    exit;
}
?>