/**
 * Professional Portfolio - Main JavaScript
 */
(function() {
    'use strict';

    // Current year in footer
    document.addEventListener('DOMContentLoaded', function() {
        var yearEl = document.getElementById('currentYear');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }

        // Smooth scroll for nav links
        document.querySelectorAll('.nav-link[href^="#"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;
                var target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Active nav link on scroll
        var sections = document.querySelectorAll('section[id]');
        function updateActiveNav() {
            var scrollY = window.pageYOffset;
            sections.forEach(function(section) {
                var sectionTop = section.offsetTop - 100;
                var sectionHeight = section.offsetHeight;
                var id = section.getAttribute('id');
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    document.querySelectorAll('.nav-link').forEach(function(navLink) {
                        navLink.classList.remove('active');
                        if (navLink.getAttribute('href') === '#' + id) {
                            navLink.classList.add('active');
                        }
                    });
                }
            });
        }
        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav();

        // Formspree form handling - AJAX submit with redirect to thank you page
        var form = document.querySelector('form[action*="formspree.io"]');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                var xhr = new XMLHttpRequest();
                xhr.open('POST', form.action, true);
                xhr.setRequestHeader('Accept', 'application/json');

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        var successUrl = form.getAttribute('data-success-url');
                        window.location.href = successUrl || 'thankyou.html';
                    } else {
                        alert('Something went wrong. Please try again.');
                    }
                };

                xhr.onerror = function() {
                    alert('Network error. Please try again.');
                };

                xhr.send(new FormData(form));
            });
        }
    });
})();
