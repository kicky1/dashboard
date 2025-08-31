# Database Setup for Dashboard App

This document explains how to set up the database for the Dashboard App using Supabase.

## Prerequisites

1. A Supabase account and project
2. Access to the Supabase SQL Editor

## Setup Steps

### 1. Create Database Schema

Run the complete database schema from `database-schema.sql` in your Supabase SQL Editor. This will create:

- `profiles` table (extends auth.users)
- `user_preferences` table
- `user_sessions` table
- `user_verification` table
- `expenses` table
- `income` table (NEW!)

### 2. Enable Row Level Security (RLS)

The schema automatically enables RLS on all tables with appropriate policies for user data isolation.

### 3. Add Sample Data (Optional)

To test the dashboard with real data instead of mock data:

1. Get your user ID from the `auth.users` table
2. Update the `sample-data.sql` file, replacing `'YOUR_USER_ID'` with your actual user ID
3. Run the sample data script in your Supabase SQL Editor

### 4. Verify Setup

After running the schema, you should see:

- All tables created with proper indexes
- RLS policies enabled
- Triggers for automatic timestamp updates
- Functions for user management

## Database Structure

### Expenses Table

- `id`: UUID primary key
- `user_id`: References profiles table
- `title`: Expense description
- `amount`: Decimal amount
- `category`: Expense category
- `date`: Date of expense
- `notes`: Optional notes
- `created_at`, `updated_at`: Timestamps

### Income Table (NEW!)

- `id`: UUID primary key
- `user_id`: References profiles table
- `title`: Income description
- `amount`: Decimal amount
- `category`: Income category
- `date`: Date of income
- `notes`: Optional notes
- `created_at`, `updated_at`: Timestamps

## API Endpoints

The app now includes:

- `expensesApi`: CRUD operations for expenses
- `incomeApi`: CRUD operations for income
- `dashboardApi`: Dashboard data aggregation

## Testing

After setup, the dashboard will:

- Show real total balance (income - expenses)
- Display actual income and expense totals
- Show the last 4 recent expenses from the database
- Handle empty states when no data exists

## Troubleshooting

- Ensure RLS policies are properly applied
- Check that user authentication is working
- Verify table permissions for authenticated users
- Monitor Supabase logs for any errors
