/**
 * Portfolio Visitor Tracking
 * Sends anonymous visit data to Supabase for your private dashboard.
 * 
 * SETUP: Add your Supabase URL and anon key in visitor-config.js
 */
(function() {
    'use strict';

    // Config is loaded from visitor-config.js (you create this file with your Supabase credentials)
    if (typeof window.VISITOR_CONFIG === 'undefined') {
        console.warn('Visitor tracking: VISITOR_CONFIG not found. Add visitor-config.js with your Supabase credentials.');
        return;
    }

    var config = window.VISITOR_CONFIG;
    if (!config.supabaseUrl || !config.supabaseKey) {
        console.warn('Visitor tracking: Supabase URL and key required.');
        return;
    }

    // Don't track visits to the dashboard itself
    if (window.location.pathname.indexOf('dashboard') !== -1) {
        return;
    }

    function collectVisitData() {
        return {
            visited_at: new Date().toISOString(),
            page_url: window.location.href,
            page_path: window.location.pathname || '/',
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            language: navigator.language || null,
            screen_width: window.screen ? window.screen.width : null,
            screen_height: window.screen ? window.screen.height : null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null
        };
    }

    function getClientIP(callback) {
        fetch('https://api.ipify.org?format=json')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                callback(data.ip || null);
            })
            .catch(function() { callback(null); });
    }

    function sendVisit(data) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', config.supabaseUrl + '/rest/v1/portfolio_visits', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('apikey', config.supabaseKey);
        xhr.setRequestHeader('Authorization', 'Bearer ' + config.supabaseKey);
        xhr.setRequestHeader('Prefer', 'return=minimal');
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                // Success - visit recorded
            }
        };
        xhr.onerror = function() {
            // Silent fail - don't disrupt user experience
        };
        xhr.send(JSON.stringify(data));
    }

    function init() {
        getClientIP(function(ip) {
            var data = collectVisitData();
            data.ip_address = ip;
            sendVisit(data);
        });
    }

    // Run after page load to avoid blocking
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
