-- Prompter AI Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT NOT NULL,
    is_pro BOOLEAN DEFAULT FALSE,
    prompts_used_this_month INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_logs table for tracking detailed usage
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    original_text TEXT NOT NULL,
    optimized_text TEXT NOT NULL,
    text_length INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL, -- active, canceled, past_due, etc.
    plan_type TEXT NOT NULL, -- free, pro
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usage logs policies
CREATE POLICY "Users can view own usage logs" ON usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to reset monthly usage (to be called by a cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET prompts_used_this_month = 0,
        updated_at = NOW()
    WHERE prompts_used_this_month > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get user quota information
CREATE OR REPLACE FUNCTION get_user_quota(user_uuid UUID)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    is_pro BOOLEAN,
    prompts_used INTEGER,
    prompts_limit INTEGER,
    remaining_prompts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.user_id,
        up.email,
        up.is_pro,
        up.prompts_used_this_month,
        CASE 
            WHEN up.is_pro THEN 1000  -- Pro plan limit
            ELSE 10                   -- Free trial limit
        END as prompts_limit,
        CASE 
            WHEN up.is_pro THEN GREATEST(0, 1000 - up.prompts_used_this_month)
            ELSE GREATEST(0, 10 - up.prompts_used_this_month)
        END as remaining_prompts
    FROM user_profiles up
    WHERE up.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data (optional - for testing)
-- INSERT INTO user_profiles (user_id, email, is_pro, prompts_used_this_month) 
-- VALUES (uuid_generate_v4(), 'test@example.com', false, 0);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
