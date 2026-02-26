/**
 * Visitor Tracking Configuration
 * 
 * 1. Create a free Supabase account at https://supabase.com
 * 2. Create a new project
 * 3. Run this SQL in Supabase SQL Editor to create the table:
 * 
 *    create table portfolio_visits (
 *      id uuid default gen_random_uuid() primary key,
 *      visited_at timestamptz not null,
 *      page_url text,
 *      page_path text,
 *      referrer text,
 *      user_agent text,
 *      ip_address text,
 *      language text,
 *      screen_width int,
 *      screen_height int,
 *      timezone text,
 *      created_at timestamptz default now()
 *    );
 * 
 * 4. Enable Row Level Security (RLS) - Supabase does this by default
 * 5. Add policy: Allow anonymous insert for portfolio_visits
 * 6. Copy your project URL and anon key from Settings > API
 */
window.VISITOR_CONFIG = {
    supabaseUrl: 'https://lmyiewuvdqbxewgtlhxf.supabase.co',  // e.g. https://xxxxx.supabase.co
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxteWlld3V2ZHFieGV3Z3RsaHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzMyMDksImV4cCI6MjA4NzY0OTIwOX0.Ebt-WuM6FDfRoCZOLAQGwQLbr882GWJ3tDyG6lMJYcQ',
    dashboardSecret: 'jkangogo2026'  // Used in dashboard.html?key=YOUR_SECRET
};
