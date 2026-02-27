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

        // Mobile hamburger toggle
        var navToggle = document.querySelector('.nav-toggle');
        var navLinks = document.querySelector('.nav-links');
        var navBackdrop = document.querySelector('.nav-backdrop');
        function closeMobileNav() {
            if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
            if (navLinks) navLinks.classList.remove('is-open');
            if (navBackdrop) navBackdrop.classList.remove('is-visible');
            document.body.classList.remove('nav-menu-open');
            document.body.style.overflow = '';
        }
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', function() {
                var expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !expanded);
                navLinks.classList.toggle('is-open', !expanded);
                if (navBackdrop) navBackdrop.classList.toggle('is-visible', !expanded);
                document.body.classList.toggle('nav-menu-open', !expanded);
                document.body.style.overflow = expanded ? '' : 'hidden';
            });
            if (navBackdrop) navBackdrop.addEventListener('click', closeMobileNav);
            navLinks.querySelectorAll('.nav-link').forEach(function(link) {
                link.addEventListener('click', closeMobileNav);
            });
            document.addEventListener('click', function(e) {
                if (!navLinks.classList.contains('is-open')) return;
                if (navLinks.contains(e.target) || (navToggle && navToggle.contains(e.target))) return;
                closeMobileNav();
            });
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

        // Scroll-triggered fade-in animations
        var fadeElements = document.querySelectorAll('.card, .project-category, .skill-category, .contact-form');
        var fadeObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-visible');
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        fadeElements.forEach(function(el) {
            el.classList.add('scroll-fade');
            fadeObserver.observe(el);
        });

        // Formspree form handling - AJAX submit with loading state
        var form = document.querySelector('form[action*="formspree.io"]');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                var submitBtn = form.querySelector('button[type="submit"]');
                var originalText = submitBtn ? submitBtn.innerHTML : '';

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                }

                var xhr = new XMLHttpRequest();
                xhr.open('POST', form.action, true);
                xhr.setRequestHeader('Accept', 'application/json');

                xhr.onload = function() {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                    if (xhr.status === 200) {
                        var successUrl = form.getAttribute('data-success-url');
                        window.location.href = successUrl || 'thankyou.html';
                    } else {
                        alert('Something went wrong. Please try again.');
                    }
                };

                xhr.onerror = function() {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                    alert('Network error. Please try again.');
                };

                xhr.send(new FormData(form));
            });
        }
    });
})();
