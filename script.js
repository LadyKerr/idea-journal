class IdeaTracker {
    constructor() {
        this.ideas = this.loadIdeas();
        this.currentFilter = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderIdeas();
        this.updateStats();
    }

    bindEvents() {
        // Add idea button
        document.getElementById('addIdeaBtn').addEventListener('click', () => this.addIdea());
        
        // Enter key on inputs
        document.getElementById('ideaTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addIdea();
        });
        
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchIdeas(e.target.value);
        });
        
        // Filter tags
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                this.filterIdeas(e.target.dataset.category);
                this.updateActiveFilter(e.target);
            });
        });
    }

    addIdea() {
        const title = document.getElementById('ideaTitle').value.trim();
        const content = document.getElementById('ideaContent').value.trim();
        const category = document.getElementById('ideaCategory').value;

        if (!title || !content) {
            this.showNotification('Please fill in both title and content! 💭', 'warning');
            return;
        }

        const idea = {
            id: Date.now(),
            title: title,
            content: content,
            category: category || '✨ Random',
            createdAt: new Date().toISOString(),
            formattedDate: this.formatDate(new Date())
        };

        this.ideas.unshift(idea);
        this.saveIdeas();
        this.clearForm();
        this.renderIdeas();
        this.updateStats();
        this.showNotification('Idea added successfully! 🌟', 'success');
    }

    deleteIdea(id) {
        if (confirm('Are you sure you want to delete this idea? 🗑️')) {
            this.ideas = this.ideas.filter(idea => idea.id !== id);
            this.saveIdeas();
            this.renderIdeas();
            this.updateStats();
            this.showNotification('Idea deleted! 👋', 'info');
        }
    }

    searchIdeas(query) {
        const filtered = this.ideas.filter(idea => {
            const matchesSearch = idea.title.toLowerCase().includes(query.toLowerCase()) ||
                                idea.content.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = !this.currentFilter || idea.category === this.currentFilter;
            return matchesSearch && matchesCategory;
        });
        
        this.renderFilteredIdeas(filtered);
    }

    filterIdeas(category) {
        this.currentFilter = category;
        const searchQuery = document.getElementById('searchInput').value;
        
        let filtered = this.ideas;
        
        if (category) {
            filtered = filtered.filter(idea => idea.category === category);
        }
        
        if (searchQuery) {
            filtered = filtered.filter(idea => 
                idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                idea.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        this.renderFilteredIdeas(filtered);
    }

    updateActiveFilter(activeTag) {
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.classList.remove('active');
        });
        activeTag.classList.add('active');
    }

    renderIdeas() {
        this.renderFilteredIdeas(this.ideas);
    }

    renderFilteredIdeas(ideas) {
        const container = document.getElementById('ideasContainer');
        
        if (ideas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🌱</div>
                    <h3>${this.ideas.length === 0 ? 'Your idea garden is waiting!' : 'No ideas match your search'}</h3>
                    <p>${this.ideas.length === 0 ? 'Start planting your first brilliant idea above ✨' : 'Try a different search term or filter 🔍'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = ideas.map(idea => `
            <div class="idea-card">
                <div class="idea-header">
                    <div>
                        <div class="idea-title">${this.escapeHtml(idea.title)}</div>
                        <div class="idea-category">${idea.category}</div>
                    </div>
                    <button class="delete-btn" onclick="ideaTracker.deleteIdea(${idea.id})">
                        🗑️ Delete
                    </button>
                </div>
                <div class="idea-content">${this.escapeHtml(idea.content)}</div>
                <div class="idea-footer">
                    <span>💡 Created on ${idea.formattedDate}</span>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const total = this.ideas.length;
        const today = this.ideas.filter(idea => {
            const ideaDate = new Date(idea.createdAt).toDateString();
            const todayDate = new Date().toDateString();
            return ideaDate === todayDate;
        }).length;

        document.getElementById('totalIdeas').textContent = total;
        document.getElementById('todayIdeas').textContent = today;
    }

    clearForm() {
        document.getElementById('ideaTitle').value = '';
        document.getElementById('ideaContent').value = '';
        document.getElementById('ideaCategory').value = '';
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            fontFamily: 'Comfortaa, sans-serif',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1000',
            animation: 'slideInRight 0.3s ease-out',
            maxWidth: '300px'
        });

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Local Storage methods
    saveIdeas() {
        try {
            localStorage.setItem('myIdeas', JSON.stringify(this.ideas));
        } catch (error) {
            this.showNotification('Failed to save ideas 😞', 'warning');
        }
    }

    loadIdeas() {
        try {
            const stored = localStorage.getItem('myIdeas');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            this.showNotification('Failed to load ideas 😞', 'warning');
            return [];
        }
    }
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
const ideaTracker = new IdeaTracker();