// Sidebar collapse functionality for desktop
document.addEventListener("DOMContentLoaded", function () {
    const collapseBtn = document.getElementById("sidebarCollapseBtn");
    const body = document.body;

    // Load saved state from localStorage
    const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    if (isCollapsed) {
        body.classList.add("sidebar-collapsed");
    }

    // Toggle sidebar collapse
    collapseBtn?.addEventListener("click", function () {
        body.classList.toggle("sidebar-collapsed");

        // Save state to localStorage
        const collapsed = body.classList.contains("sidebar-collapsed");
        localStorage.setItem("sidebarCollapsed", collapsed);
    });

    // Auto-close mobile sidebar when clicking a link
    const navLinks = document.querySelectorAll("#sidebarMenu .nav-item");
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            // Only close on mobile
            if (window.innerWidth < 992) {
                const offcanvasElement = document.getElementById("sidebarMenu");
                const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (offcanvas) {
                    offcanvas.hide();
                }
            }
        });
    });
});