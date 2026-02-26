/**
 * Portfolio Visitor Tracking
 * Sends anonymous visit data to Supabase for your private dashboard.
 * Includes: IP, location (reverse geocoding), browser, OS, timezone.
 * 
 * SETUP: Add your Supabase URL and anon key in visitor-config.js
 */
(function() {
    'use strict';

    if (typeof window.VISITOR_CONFIG === 'undefined') {
        console.warn('Visitor tracking: VISITOR_CONFIG not found. Add visitor-config.js with your Supabase credentials.');
        return;
    }

    var config = window.VISITOR_CONFIG;
    if (!config.supabaseUrl || !config.supabaseKey) {
        console.warn('Visitor tracking: Supabase URL and key required.');
        return;
    }

    if (window.location.pathname.indexOf('dashboard') !== -1) {
        return;
    }

    function parseUserAgent(ua) {
        if (!ua) return { browser: 'Unknown', browserVersion: '', os: 'Unknown', osVersion: '' };
        var browser = 'Unknown', browserVersion = '', os = 'Unknown', osVersion = '';
        var m;

        if ((m = ua.match(/Firefox\/(\d+)/))) {
            browser = 'Firefox';
            browserVersion = m[1];
        } else if ((m = ua.match(/Edg\/(\d+)/))) {
            browser = 'Edge';
            browserVersion = m[1];
        } else if ((m = ua.match(/OPR\/(\d+)/))) {
            browser = 'Opera';
            browserVersion = m[1];
        } else if ((m = ua.match(/Chrome\/(\d+)/)) && ua.indexOf('Chromium') === -1 && ua.indexOf('Edg') === -1) {
            browser = 'Chrome';
            browserVersion = m[1];
        } else if ((m = ua.match(/Safari\/(\d+)/)) && ua.indexOf('Chrome') === -1) {
            browser = 'Safari';
            browserVersion = m[1];
        } else if ((m = ua.match(/Version\/(\d+)/)) && ua.indexOf('Safari') > -1) {
            browser = 'Safari';
            browserVersion = m[1];
        } else if ((m = ua.match(/MSIE\s(\d+)/)) || (m = ua.match(/Trident\/.*rv:(\d+)/))) {
            browser = 'Internet Explorer';
            browserVersion = m[1];
        }

        if ((m = ua.match(/Windows NT (\d+\.\d+)/))) {
            os = 'Windows';
            osVersion = m[1] === '10.0' ? '10/11' : m[1];
        } else if ((m = ua.match(/Mac OS X (\d+[._]\d+)/))) {
            os = 'macOS';
            osVersion = m[1].replace('_', '.');
        } else if (ua.indexOf('Android') > -1) {
            os = 'Android';
            m = ua.match(/Android (\d+\.?\d*)/);
            osVersion = m ? m[1] : '';
        } else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
            os = 'iOS';
            m = ua.match(/OS (\d+[._]\d+)/);
            osVersion = m ? m[1].replace('_', '.') : '';
        } else if (ua.indexOf('Linux') > -1) {
            os = 'Linux';
        }

        return { browser: browser, browserVersion: browserVersion, os: os, osVersion: osVersion };
    }

    function getGeoAndIP(callback) {
        fetch('https://ipapi.co/json/')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                callback({
                    ip: data.ip || null,
                    city: data.city || null,
                    region: data.region || null,
                    country: data.country_name || null,
                    countryCode: data.country_code || null,
                    lat: data.latitude || null,
                    lon: data.longitude || null,
                    location: [data.city, data.region, data.country_name].filter(Boolean).join(', ') || null
                });
            })
            .catch(function() {
                fetch('https://api.ipify.org?format=json')
                    .then(function(r) { return r.json(); })
                    .then(function(d) { callback({ ip: d.ip || null, city: null, region: null, country: null, countryCode: null, lat: null, lon: null, location: null }); })
                    .catch(function() { callback({ ip: null, city: null, region: null, country: null, countryCode: null, lat: null, lon: null, location: null }); });
            });
    }

    function collectVisitData() {
        var ua = navigator.userAgent;
        var parsed = parseUserAgent(ua);
        var browserDisplay = parsed.browser + (parsed.browserVersion ? ' ' + parsed.browserVersion : '');
        var osDisplay = parsed.os + (parsed.osVersion ? ' ' + parsed.osVersion : '');

        return {
            visited_at: new Date().toISOString(),
            page_url: window.location.href,
            page_path: window.location.pathname || '/',
            referrer: document.referrer || null,
            user_agent: ua,
            browser_name: browserDisplay,
            os_name: osDisplay,
            language: navigator.language || null,
            screen_width: window.screen ? window.screen.width : null,
            screen_height: window.screen ? window.screen.height : null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null
        };
    }

    function sendVisit(data) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', config.supabaseUrl + '/rest/v1/portfolio_visits', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('apikey', config.supabaseKey);
        xhr.setRequestHeader('Authorization', 'Bearer ' + config.supabaseKey);
        xhr.setRequestHeader('Prefer', 'return=minimal');

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) { /* success */ }
        };
        xhr.onerror = function() { /* silent fail */ };
        xhr.send(JSON.stringify(data));
    }

    function init() {
        var data = collectVisitData();
        getGeoAndIP(function(geo) {
            data.ip_address = geo.ip;
            data.location_city = geo.city;
            data.location_region = geo.region;
            data.location_country = geo.country;
            data.location_country_code = geo.countryCode;
            data.location_lat = geo.lat;
            data.location_lon = geo.lon;
            data.location_display = geo.location;
            sendVisit(data);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
