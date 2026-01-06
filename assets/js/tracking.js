class TrackingManager {
    constructor() {
        this.currentDayData = null;
        this.currentDate = null;
        console.log('TrackingManager initialized');
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        console.log('TrackingManager setting up listeners');
        
        const dayForm = document.getElementById('dayForm');
        if (dayForm) {
            dayForm.addEventListener('submit', (e) => this.handleDayUpdate(e));
            console.log('Form listener added');
        }
    }

    populateDayForm(data) {
        console.log('Populating form with data:', data);
        
        // SAVERS checkboxes
        const saversFields = ['savers_silence', 'savers_affirmations', 'savers_visualization', 'savers_exercise', 'savers_reading', 'savers_scribing'];
        saversFields.forEach(field => {
            const checkbox = document.getElementById(field);
            if (checkbox) {
                checkbox.checked = data[field] == 1;
            }
        });
        
        // Vices checkboxes
        const vicesFields = ['vice_free_coke', 'vice_free_beer', 'vice_free_weed'];
        vicesFields.forEach(field => {
            const checkbox = document.getElementById(field);
            if (checkbox) {
                checkbox.checked = data[field] == 1;
            }
        });
        
        // Other fields
        const moodRating = document.getElementById('mood_rating');
        const energyLevel = document.getElementById('energy_level');
        const notes = document.getElementById('notes');
        
        if (moodRating) moodRating.value = data.mood_rating || 5;
        if (energyLevel) energyLevel.value = data.energy_level || 5;
        if (notes) notes.value = data.notes || '';
    }

    async handleDayUpdate(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        const formData = new FormData(document.getElementById('dayForm'));
        formData.append('action', 'update_day_details');
        
        try {
            const response = await fetch('api/tracking.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            console.log('Save response:', data);
            
            if (data.success) {
                window.closeDayModal();
                window.location.reload();
            } else {
                alert('Erreur lors de la sauvegarde: ' + (data.message || 'Erreur inconnue'));
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Erreur de connexion');
        }
    }
}

// Initialize when possible
function initTrackingManager() {
    if (!window.trackingManager) {
        console.log('Creating TrackingManager...');
        window.trackingManager = new TrackingManager();
    }
}

// Try multiple initialization points
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrackingManager);
} else {
    initTrackingManager();
}

setTimeout(initTrackingManager, 100);
setTimeout(initTrackingManager, 500);
