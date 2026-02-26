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

    function buildLocation(city, county, region, country) {
        var parts = [city, county, region, country].filter(Boolean);
        return parts.length ? parts.join(', ') : null;
    }

    function reverseGeocode(lat, lon, callback) {
        var zoom = 14;
        var url = 'https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&zoom=' + zoom + '&format=json&addressdetails=1';
        fetch(url, { headers: { 'User-Agent': 'PortfolioVisitorTracker/1.0 (https://github.com/jkangogo)' } })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (!data || !data.address) {
                    callback(null);
                    return;
                }
                var addr = data.address;
                var city = addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || addr.locality || (data.name && data.type !== 'administrative' ? data.name : null);
                var county = addr.county;
                var state = addr.state || addr.region;
                var country = addr.country;
                var loc = buildLocation(city, county, state, country) || data.display_name;
                callback({ city: city, region: state, country: country, county: county, location: loc });
            })
            .catch(function() { callback(null); });
    }

    function getGeoAndIP(callback) {
        function tryIpapi() {
            fetch('https://ipapi.co/json/', { headers: { 'User-Agent': 'PortfolioVisitorTracker/1.0' } })
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    if (data.error) { tryIpify(); return; }
                    var loc = buildLocation(data.city, null, data.region, data.country_name || data.country);
                    callback({ ip: data.ip, city: data.city, region: data.region, country: data.country_name || data.country, countryCode: data.country_code || data.country, lat: data.latitude, lon: data.longitude, location: loc });
                })
                .catch(tryIpify);
        }
        function tryIpify() {
            fetch('https://api.ipify.org?format=json')
                .then(function(r) { return r.json(); })
                .then(function(d) { callback({ ip: d.ip, city: null, region: null, country: null, countryCode: null, lat: null, lon: null, location: null }); })
                .catch(function() { callback({ ip: null, city: null, region: null, country: null, countryCode: null, lat: null, lon: null, location: null }); });
        }
        fetch('https://get.geojs.io/v1/ip/geo.json')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (!data || !data.ip) {
                    tryIpapi();
                    return;
                }
                var loc = buildLocation(data.city, null, data.region, data.country) || data.country || null;
                callback({
                    ip: data.ip,
                    city: data.city || null,
                    region: data.region || null,
                    country: data.country || null,
                    countryCode: data.country_code || null,
                    lat: data.latitude ? parseFloat(data.latitude) : null,
                    lon: data.longitude ? parseFloat(data.longitude) : null,
                    location: loc
                });
            })
            .catch(tryIpapi);
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

    function getIP(callback) {
        fetch('https://api.ipify.org?format=json')
            .then(function(r) { return r.json(); })
            .then(function(d) { callback(d.ip || null); })
            .catch(function() { callback(null); });
    }

    function init() {
        var data = collectVisitData();
        function finishWithGeo(geo) {
            data.ip_address = geo.ip;
            data.location_city = geo.city;
            data.location_region = geo.region;
            data.location_country = geo.country;
            data.location_country_code = geo.countryCode;
            data.location_lat = geo.lat;
            data.location_lon = geo.lon;
            data.location_display = geo.location;
            if (geo.county) data.location_county = geo.county;
            sendVisit(data);
        }
        function tryReverseGeocodeThenFinish(geo) {
            if (geo.lat != null && geo.lon != null && !isNaN(geo.lat) && !isNaN(geo.lon)) {
                reverseGeocode(geo.lat, geo.lon, function(addr) {
                    if (addr) {
                        geo.city = addr.city;
                        geo.region = addr.region;
                        geo.country = addr.country;
                        geo.county = addr.county;
                        geo.location = addr.location;
                    }
                    finishWithGeo(geo);
                });
            } else {
                finishWithGeo(geo);
            }
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(pos) {
                    var lat = pos.coords.latitude;
                    var lon = pos.coords.longitude;
                    reverseGeocode(lat, lon, function(addr) {
                        if (addr) {
                            getIP(function(ip) {
                                finishWithGeo({
                                    ip: ip,
                                    city: addr.city,
                                    region: addr.region,
                                    country: addr.country,
                                    county: addr.county,
                                    countryCode: null,
                                    lat: lat,
                                    lon: lon,
                                    location: addr.location
                                });
                            });
                        } else {
                            getGeoAndIP(tryReverseGeocodeThenFinish);
                        }
                    });
                },
                function() { getGeoAndIP(tryReverseGeocodeThenFinish); },
                { timeout: 8000, maximumAge: 300000, enableHighAccuracy: true }
            );
        } else {
            getGeoAndIP(tryReverseGeocodeThenFinish);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
