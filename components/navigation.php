<?php if ($currentUser): ?>
    <!-- Navigation pour utilisateurs connectés -->
    <div class="bg-white rounded-xl shadow-sm border p-4 mb-6 w-full nav-container">
        <!-- Desktop Navigation -->
        <div class="nav-desktop hidden md:flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <div class="text-lg font-semibold text-gray-800">
                    👋 Salut <?= htmlspecialchars($currentUser['name'] ?: explode('@', $currentUser['email'])[0]) ?> !
                </div>
                <div class="text-sm text-gray-600">
                    📅 <?= date('d/m/Y') ?>
                </div>
            </div>
            
            <div class="flex items-center space-x-3">
                <a href="index.php" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-semibold no-print">
                    🏠 Journal
                </a>
                <a href="trackers.php" class="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm font-semibold no-print">
                    📊 Trackers
                </a>
                <a href="challenges.php" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-semibold no-print">
                    🎯 Challenges
                </a>
                <button onclick="window.print()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold no-print">
                    🖨️ Imprimer PDF
                </button>
                <a href="?action=logout" onclick="return confirm('Êtes-vous sûr de vouloir vous déconnecter ?')" 
                   class="text-gray-600 hover:text-gray-800 text-sm font-semibold no-print">
                    🚪 Déconnexion
                </a>
            </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="nav-mobile md:hidden">
            <div class="flex justify-between items-center">
                <div>
                    <div class="text-base font-semibold text-gray-800">
                        👋 Salut <?= htmlspecialchars($currentUser['name'] ?: explode('@', $currentUser['email'])[0]) ?> !
                    </div>
                    <div class="text-xs text-gray-500">
                        📅 <?= date('d/m/Y') ?>
                    </div>
                </div>
                <button onclick="toggleMobileMenu()" class="mobile-menu-btn p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors no-print" aria-label="Menu">
                    <svg class="menu-icon w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                    <svg class="close-icon w-6 h-6 text-gray-700 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <!-- Mobile Dropdown Menu -->
            <div id="mobileMenu" class="mobile-dropdown hidden mt-4 pt-4 border-t border-gray-200">
                <div class="space-y-3">
                    <!-- Journal -->
                    <a href="index.php" class="mobile-menu-item block p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all no-print">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
                                🏠
                            </div>
                            <div>
                                <div class="font-semibold text-purple-800">Journal</div>
                                <div class="text-xs text-purple-600">Ta routine quotidienne et tes réflexions du jour</div>
                            </div>
                        </div>
                    </a>

                    <!-- Trackers -->
                    <a href="trackers.php" class="mobile-menu-item block p-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all no-print">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white text-lg">
                                📊
                            </div>
                            <div>
                                <div class="font-semibold text-teal-800">Trackers</div>
                                <div class="text-xs text-teal-600">Visualise tes stats, streaks et progrès en détail</div>
                            </div>
                        </div>
                    </a>

                    <!-- Challenges -->
                    <a href="challenges.php" class="mobile-menu-item block p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all no-print">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg">
                                🎯
                            </div>
                            <div>
                                <div class="font-semibold text-indigo-800">Challenges</div>
                                <div class="text-xs text-indigo-600">Tes défis en cours et tes objectifs à atteindre</div>
                            </div>
                        </div>
                    </a>

                    <!-- Imprimer -->
                    <button onclick="window.print(); toggleMobileMenu();" class="mobile-menu-item w-full text-left p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all no-print">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
                                🖨️
                            </div>
                            <div>
                                <div class="font-semibold text-blue-800">Imprimer PDF</div>
                                <div class="text-xs text-blue-600">Exporte cette page en format PDF</div>
                            </div>
                        </div>
                    </button>

                    <!-- Déconnexion -->
                    <a href="?action=logout" onclick="return confirm('Êtes-vous sûr de vouloir vous déconnecter ?')" 
                       class="mobile-menu-item block p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all no-print">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center text-white text-lg">
                                🚪
                            </div>
                            <div>
                                <div class="font-semibold text-gray-700">Déconnexion</div>
                                <div class="text-xs text-gray-500">Se déconnecter de ton compte</div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <script>
    function toggleMobileMenu() {
        const menu = document.getElementById('mobileMenu');
        const menuIcon = document.querySelector('.menu-icon');
        const closeIcon = document.querySelector('.close-icon');
        
        menu.classList.toggle('hidden');
        menuIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
        
        // Animation du menu
        if (!menu.classList.contains('hidden')) {
            menu.style.animation = 'slideDown 0.3s ease-out';
        }
    }

    // Fermer le menu quand on clique ailleurs
    document.addEventListener('click', function(event) {
        const menu = document.getElementById('mobileMenu');
        const navMobile = document.querySelector('.nav-mobile');
        
        if (menu && navMobile && !navMobile.contains(event.target) && !menu.classList.contains('hidden')) {
            toggleMobileMenu();
        }
    });
    </script>
<?php else: ?>
    <!-- Navigation pour visiteurs -->
    <div class="bg-white rounded-xl shadow-sm border p-4 mb-6 w-full">
        <!-- Desktop -->
        <div class="hidden md:block text-center">
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
        <!-- Mobile -->
        <div class="md:hidden text-center">
            <div class="text-gray-600 mb-3 text-sm">
                Connectez-vous pour sauvegarder vos progrès
            </div>
            <div class="flex flex-col space-y-2">
                <button onclick="showLoginModal()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold text-sm">
                    🔑 Se connecter
                </button>
                <button onclick="showRegisterModal()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm">
                    ✨ Créer un compte
                </button>
            </div>
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