document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const tasksContainer = document.getElementById('tasks-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    const loadingElement = document.querySelector('.loading');

    // Fonction pour afficher le loader
    function showLoading() {
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
    }

    // Fonction pour cacher le loader
    function hideLoading() {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    // Toggle tâche (marquer comme terminée)
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('task-checkbox')) {
            const taskId = e.target.dataset.taskId;
            const taskCard = e.target.closest('.task-item');
            
            showLoading();
            
            fetch(`/toggle/${taskId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(data => {
                // Mettre à jour l'interface
                if (data.completed) {
                    taskCard.classList.add('completed');
                    taskCard.querySelector('.card-title').classList.add('text-decoration-line-through', 'text-muted');
                } else {
                    taskCard.classList.remove('completed');
                    taskCard.querySelector('.card-title').classList.remove('text-decoration-line-through', 'text-muted');
                }
                
                // Mettre à jour les statistiques
                updateStats();
                hideLoading();
            })
            .catch(error => {
                console.error('Erreur:', error);
                hideLoading();
            });
        }
    });

    // Suppression de tâche
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-task') || e.target.closest('.delete-task')) {
            const button = e.target.classList.contains('delete-task') ? e.target : e.target.closest('.delete-task');
            const taskId = button.dataset.taskId;
            const taskCard = button.closest('.task-item');
            
            if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                showLoading();
                
                // Animation de suppression
                taskCard.classList.add('deleting');
                
                setTimeout(() => {
                    fetch(`/delete/${taskId}/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify({})
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            taskCard.remove();
                            updateStats();
                        }
                        hideLoading();
                    })
                    .catch(error => {
                        console.error('Erreur:', error);
                        hideLoading();
                    });
                }, 300);
            }
        }
    });

    // Filtres
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Mise à jour de l'UI des boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            filterTasks(filter);
        });
    });

    // Recherche
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterTasks('all', this.value.toLowerCase());
            }, 300);
        });
    }

    // Fonction de filtrage
    function filterTasks(filter, searchTerm = '') {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(task => {
            const priority = task.dataset.priority;
            const completed = task.dataset.completed === 'true';
            const title = task.querySelector('.card-title').textContent.toLowerCase();
            const description = task.querySelector('.card-text') ? 
                task.querySelector('.card-text').textContent.toLowerCase() : '';
            
            let show = true;
            
            // Filtre par statut
            if (filter === 'completed' && !completed) show = false;
            if (filter === 'pending' && completed) show = false;
            if (filter === 'urgent' && priority !== 'urgente') show = false;
            
            // Filtre par recherche
            if (searchTerm && !title.includes(searchTerm) && !description.includes(searchTerm)) {
                show = false;
            }
            
            task.style.display = show ? 'block' : 'none';
        });
    }

    // Mise à jour des statistiques
    function updateStats() {
        const allTasks = document.querySelectorAll('.task-item').length;
        const completedTasks = document.querySelectorAll('.task-item.completed').length;
        const pendingTasks = allTasks - completedTasks;
        const urgentTasks = document.querySelectorAll('.task-item[data-priority="urgente"]').length;
        
        document.getElementById('total-tasks')?.textContent = allTasks;
        document.getElementById('completed-tasks')?.textContent = completedTasks;
        document.getElementById('pending-tasks')?.textContent = pendingTasks;
        document.getElementById('urgent-tasks')?.textContent = urgentTasks;
    }

    // Fonction pour obtenir le cookie CSRF
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Initialisation
    updateStats();
});
