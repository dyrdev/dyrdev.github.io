// script.js for dyrdev.github.io - Optimized Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Initialize projects with error handling
    initProjects().catch(error => {
        console.error('Project initialization failed:', error);
        const container = document.getElementById('projects-container');
        container.innerHTML = `
            <div class="pixel-border error-message">
                <span class="pixel-icon">⚠️</span>
                <p>Projects failed to load. Please refresh or check back later.</p>
                <button class="pixel-button" onclick="window.location.reload()">Retry</button>
            </div>
        `;
        container.classList.remove('loading');
    });

    // Initialize pixel animations
    initPixelAnimations();
});

async function initProjects() {
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.classList.add('loading');
    
    try {
        const [manualProjects, gitHubProjects] = await Promise.all([
            loadManualProjects(),
            fetchProjectsFromGitHub().catch(error => {
                console.log('Using manual projects only:', error);
                return [];
            })
        ]);
        
        // Merge and deduplicate projects
        const allProjects = [...manualProjects, ...gitHubProjects]
            .filter((project, index, self) => 
                index === self.findIndex(p => p.id === project.id)
            )
            .sort((a, b) => a.priority - b.priority);
        
        displayProjects(allProjects);
    } finally {
        projectsContainer.classList.remove('loading');
    }
}

// Project Data Management
async function loadManualProjects() {
    return [
        {
            id: 'applicant-sensei',
            name: "Applicant Sensei",
            description: "AI-powered career assistant helping job seekers optimize resumes and prepare for interviews",
            tags: ["AI", "React", "Node.js", "Next.js"],
            links: [
                // Try both possible project paths
                { text: "View Project", url: "projects/applicant-sensei/index.html", newTab: true },
                { text: "View Project", url: "projects/applicant-sensei.html", newTab: true },
                { text: "GitHub", url: "https://github.com/cdyadi/Applicant-Sensei", newTab: true },
                { text: "Live Demo", url: "https://applicant-sensei.vercel.app/", newTab: true }
            ].filter(link => link.text !== "View Project" || link.url.endsWith('.html') || link.url.includes('/index.html')),
            icon: "👨‍🏫",
            priority: 1
        },
        {
            id: 'pixel-art-generator',
            name: "Pixel Art Generator",
            description: "Create 8-bit style artwork with this interactive canvas tool",
            tags: ["JavaScript", "HTML5 Canvas", "UI Design"],
            links: [
                { text: "Coming Soon", url: "#", newTab: false }
            ],
            icon: "🎨",
            priority: 2
        }
    ];
}

async function fetchProjectsFromGitHub() {
    const response = await fetch('https://api.github.com/repos/dyrdev/dyrdev.github.io/contents/projects?ref=main');
    if (!response.ok) throw new Error('GitHub API request failed');
    
    const data = await response.json();
    const manualProjects = await loadManualProjects();
    
    return Promise.all(
        data.filter(item => item.type === 'dir')
            .map(async projectDir => {
                const projectId = projectDir.name.toLowerCase();
                const projectName = formatProjectName(projectDir.name);
                
                // Skip if already in manual projects
                if (manualProjects.some(p => p.id === projectId)) return null;
                
                // Check for project files
                let projectUrl = `projects/${projectDir.name}/index.html`;
                try {
                    const fileCheck = await fetch(`https://api.github.com/repos/dyrdev/dyrdev.github.io/contents/projects/${projectDir.name}/index.html?ref=main`);
                    if (!fileCheck.ok) projectUrl = `projects/${projectDir.name}.html`;
                } catch {
                    projectUrl = `projects/${projectDir.name}.html`;
                }
                
                return {
                    id: projectId,
                    name: projectName,
                    description: `My ${projectName} project`,
                    tags: ['GitHub'],
                    links: [
                        { text: "View Project", url: projectUrl, newTab: true },
                        { text: "View Code", url: projectDir.html_url, newTab: true }
                    ],
                    icon: "📁",
                    priority: 3
                };
            })
    ).then(projects => projects.filter(p => p !== null));
}

// Helper Functions
function formatProjectName(name) {
    return name.split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function displayProjects(projects) {
    const container = document.getElementById('projects-container');
    
    if (!projects || projects.length === 0) {
        container.innerHTML = `
            <div class="project-card pixel-border">
                <span class="pixel-icon">😕</span>
                <p class="pixel-text">No projects found yet. Check back soon!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-card pixel-border" data-project-id="${project.id}">
            <div class="project-header">
                <span class="pixel-icon">${project.icon || '🛠️'}</span>
                <h3>${project.name}</h3>
            </div>
            <p class="pixel-text">${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="pixel-chip">${tag}</span>`).join('')}
            </div>
            <div class="project-links">
                ${project.links.map(link => `
                    <a href="${link.url}" 
                       ${link.newTab ? 'target="_blank" rel="noopener noreferrer"' : ''}
                       class="pixel-button"
                       ${link.url === '#' ? 'aria-disabled="true"' : ''}>
                        ${link.text}
                    </a>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Animation System
function initPixelAnimations() {
    // Event delegation for button effects
    document.addEventListener('mousedown', function(e) {
        if (e.target.closest('.pixel-button')) {
            const button = e.target.closest('.pixel-button');
            button.style.transform = 'translateY(2px)';
            button.style.boxShadow = 'none';
        }
    });
    
    document.addEventListener('mouseup', function(e) {
        if (e.target.closest('.pixel-button')) {
            const button = e.target.closest('.pixel-button');
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '2px 2px 0 #000';
        }
    });
    
    // Pixel art eye animation
    const pixelEyes = document.querySelectorAll('.pixel-eye');
    if (pixelEyes.length > 0) {
        const animateEyes = () => {
            pixelEyes.forEach(eye => {
                eye.style.transform = `translate(
                    ${Math.random() * 3 - 1.5}px, 
                    ${Math.random() * 3 - 1.5}px
                )`;
            });
            setTimeout(animateEyes, 2000 + Math.random() * 2000);
        };
        animateEyes();
    }
}

// Add to window for manual reload capability
window.reloadProjects = initProjects;
