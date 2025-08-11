// Basic JavaScript for Eric Soltys personal site

// Add smooth scrolling for any internal links (if added later)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add basic analytics or tracking if needed in the future
// Currently just a placeholder for future enhancements

console.log('Eric Soltys personal site loaded');