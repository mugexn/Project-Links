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
// CERTIFICATES
// ================================

// Add or edit your certificates here.
// Leave verificationUrl empty ("") when a certificate has no verification link.
const certificates = [
    {
        name: "Introduction to Cybersecurity",
        provider: "CISCO Networking Academy",
        date: "July 2026",
        image: "images/cisco1.png",
        verificationUrl: "https://www.credly.com/badges/3e0868bd-9316-414b-92d8-65b98a9613a3"
    },
    {
        name: "Programming for Intermediate Users Using Python",
        provider: "Department of Information and Communication Technology",
        date: "November 2021",
        image: "images/dict2.png",
        verificationUrl: ""
    },
    {
        name: "Programming for Beginners Using Python",
        provider: "Department of Information and Communication Technology",
        date: "November 2021",
        image: "images/dict1.png",
        verificationUrl: ""
    }
];

function openCertificates() {
    const modal = document.getElementById("certificate-modal");
    const content = document.getElementById("certificate-content");

    content.innerHTML = certificates.map(certificate => {
        const verification = certificate.verificationUrl
            ? `<a class="certificate-verify" href="${escapeAttribute(certificate.verificationUrl)}" target="_blank" rel="noopener noreferrer">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Verify Certificate
               </a>`
            : "";

        return `
            <article class="certificate-card">
                <img
                    class="certificate-image"
                    src="${escapeAttribute(certificate.image)}"
                    alt="${escapeAttribute(certificate.name)} certificate"
                    loading="lazy"
                >
                <div class="certificate-details">
                    <h3>${escapeHtml(certificate.name)}</h3>
                    <p class="certificate-provider">${escapeHtml(certificate.provider)}</p>
                    <p class="certificate-date">
                        <i class="fa-regular fa-calendar"></i>
                        ${escapeHtml(certificate.date)}
                    </p>
                    ${verification}
                </div>
            </article>
        `;
    }).join("");

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closeCertificates() {
    const modal = document.getElementById("certificate-modal");
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

const certificateModal = document.getElementById("certificate-modal");
if (certificateModal) {
    certificateModal.addEventListener("click", event => {
        if (event.target === certificateModal) {
            closeCertificates();
        }
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
            return;
        }

        const certificateModal = document.getElementById("certificate-modal");
        if (certificateModal && certificateModal.classList.contains("active")) {
            closeCertificates();
        }
    }
});

// ================================
// ESCAPE HTML
// ================================

function escapeAttribute(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}