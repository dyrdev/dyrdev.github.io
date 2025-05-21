document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Fetch projects from GitHub API
    fetchProjectsFromGitHub();
});

// Manual projects data (fallback)
const manualProjects = [
    {
        name: "Applicant Sensei",
        description: "AI-powered job application assistant that helps tailor your resume and cover letter to job descriptions.",
        link: "https://github.com/dyrdev/dyrdev.github.io/tree/main/projects/applicant-sensei",
        tags: ["AI", "Python", "LLM", "NLP"],
        image: "projects/applicant-sensei/screenshot.png" // Add if available
    }
    // Add more manual projects here as needed
];

async function fetchProjectsFromGitHub() {
    try {
        const response = await fetch('https://api.github.com/repos/dyrdev/dyrdev.github.io/contents/projects?ref=main');
        if (!response.ok) throw new Error('GitHub API request failed');
        
        const data = await response.json();
        
        const projects = await Promise.all(
            data.filter(item => item.type === 'dir').map(async project => {
                // Try to get project metadata
                let description = `My ${formatProjectName(project.name)} project`;
                let tags = ['GitHub'];
                let image = null;
                
                try {
                    // Check for a metadata.json file in each project
                    const metaResponse = await fetch(`https://api.github.com/repos/dyrdev/dyrdev.github.io/contents/projects/${project.name}/metadata.json?ref=main`);
                    if (metaResponse.ok) {
                        const metaData = await metaResponse.json();
                        const content = JSON.parse(atob(metaData.content));
                        if (content.description) description = content.description;
                        if (content.tags) tags = content.tags;
                        if (content.image) image = `projects/${project.name}/${content.image}`;
                    }
                } catch (e) {
                    console.log(`No metadata for ${project.name}`, e);
                }
                
                return {
                    name: formatProjectName(project.name),
                    description: description,
                    link: project.html_url,
                    tags: tags,
                    image: image
                };
            })
        );
        
        // Combine with manual projects and remove duplicates
        const allProjects = [...manualProjects, ...projects].filter(
            (v, i, a) => a.findIndex(t => t.name === v.name) === i
        );
        
        displayProjects(allProjects);
    } catch (error) {
        console.error('Error fetching from GitHub:', error);
        // Fall back to manual projects
        displayProjects(manualProjects);
    }
}

function formatProjectName(name) {
    return name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function displayProjects(projects) {
    const container = document.getElementById('projects-container');
    
    if (!projects || projects.length === 0) {
        container.innerHTML = '<p>No projects found.</p>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-card pixel-border">
            ${project.image ? `
            <div class="project-image-container">
                <img src="${project.image}" alt="${project.name}" class="project-image" loading="lazy" 
                     onerror="this.style.display='none'">
            </div>` : ''}
            <h3>${project.name}</h3>
            <p>${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="pixel-tag">${tag}</span>`).join('')}
            </div>
            <a href="${project.link}" class="pixel-button" target="_blank">View Project</a>
        </div>
    `).join('');
}
