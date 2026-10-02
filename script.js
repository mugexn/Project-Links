const projectCards = document.querySelectorAll(".project-card");
projectCards.forEach(card => {
    card.addEventListener("click", (event) => {
        
        if (event.target.closest(".readme-button")) {
            return;
        }
        card.style.transform = "scale(0.98)";
        setTimeout(() => {
            card.style.transform = "";
        }, 120);
    });
});

// ================================
// PROFILE IMAGE CLICK / TAP
// ================================

const profileImage = document.querySelector(".profile-image");
if (profileImage) {
    profileImage.addEventListener("click", () => {
        profileImage.classList.toggle("profile-swapped");
    });
}

// ================================
// README MODAL FUNCTIONALITY
// ================================

async function openReadme(owner, repo) {
    const modal = document.getElementById("readme-modal");
    const content = document.getElementById("readme-content");
    const title = document.getElementById("readme-title");

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    title.textContent = `${repo} — README`;

    content.innerHTML = `
        <div class="readme-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Loading README...</span>
        </div>
    `;
    try {
        
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/readme`,
            {
                headers: {
                    "Accept": "application/vnd.github.raw+json"
                }
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("README not found.");
            }
            if (response.status === 403) {
                throw new Error("GitHub API rate limit reached.");
            }
            throw new Error(`GitHub returned error ${response.status}.`);
        }

        const markdown = await response.text();
        content.innerHTML = marked.parse(markdown);
        fixReadmeLinks(owner, repo);
    } catch (error) {
        console.error("README Error:", error);
        content.innerHTML = `
            <div class="readme-error">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Unable to load README</h3>
                <p>${escapeHtml(error.message)}</p>
                <a 
                    href="https://github.com/${owner}/${repo}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i class="fa-brands fa-github"></i>
                    View repository on GitHub
                </a>
            </div>
        `;
    }
}

// ================================
// FIX README LINKS
// ================================

function fixReadmeLinks(owner, repo) {
    const content = document.getElementById("readme-content");
    const images = content.querySelectorAll("img");
    images.forEach(img => {
        const src = img.getAttribute("src");
        if (!src) {
            return;
        }
       
        if (
            src.startsWith("http://") ||
            src.startsWith("https://") ||
            src.startsWith("//") ||
            src.startsWith("data:")
        ) {
            return;
        }
        
        const cleanPath = src.replace(/^\.?\//, "");
      
        img.src =
            `https://raw.githubusercontent.com/${owner}/${repo}/main/${cleanPath}`;
    });

    const links = content.querySelectorAll("a");
    links.forEach(link => {
        const href = link.getAttribute("href");
        if (!href) {
            return;
        }
       
        if (
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("#") ||
            href.startsWith("mailto:")
        ) {
            return;
        }
       
        const cleanPath = href.replace(/^\.?\//, "");
        
        link.href =
            `https://github.com/${owner}/${repo}/blob/main/${cleanPath}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    });
}

// ================================
// CLOSE README MODAL
// ================================

function closeReadme() {
    const modal = document.getElementById("readme-modal");
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
}

// ================================
// CLOSE WHEN CLICKING OUTSIDE
// ================================

const readmeModal = document.getElementById("readme-modal");
if (readmeModal) {
    readmeModal.addEventListener("click", (event) => {
        // Only close when clicking the dark overlay
        if (event.target === readmeModal) {
            closeReadme();
        }
    });
}

// ================================
// CLOSE WITH ESCAPE KEY
// ================================

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        const modal = document.getElementById("readme-modal");
        if (modal && modal.classList.contains("active")) {
            closeReadme();
        }
    }
});

// ================================
// ESCAPE HTML
// ================================

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}