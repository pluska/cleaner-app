# SparkClean - Home Cleaning Task Manager

A modern web application for managing home cleaning tasks with intelligent scheduling and progress tracking.

## Features

- **Beautiful Landing Page**: Inviting homepage with feature highlights and call-to-action
- **User Authentication**: Secure login/signup with Supabase Auth
- **Daily Task Management**: Main dashboard with today's tasks and quick actions
- **Flexible Scheduling**: View tasks by daily, weekly, monthly, or yearly periods
- **Progress Analytics**: Comprehensive statistics and completion tracking
- **Task Categories**: Organize tasks by room (kitchen, bathroom, bedroom, living room, general)
- **Priority Levels**: Set task priorities (low, medium, high)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication & Database**: Supabase
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard-specific components
│   └── ui/                # Base UI components
├── libs/                  # Utility libraries
│   └── supabase.ts        # Supabase client configuration
└── types/                 # TypeScript type definitions
    └── index.ts           # App-wide types
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cleaner-planner
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Create tasks table
   CREATE TABLE tasks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
     category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('kitchen', 'bathroom', 'bedroom', 'living_room', 'general')),
     priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
     completed BOOLEAN NOT NULL DEFAULT false,
     due_date DATE,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

   -- Create policy to allow users to only see their own tasks
   CREATE POLICY "Users can view own tasks" ON tasks
     FOR ALL USING (auth.uid() = user_id);

   -- Create updated_at trigger
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql';

   CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Landing Page

- Visit the homepage to see the app overview
- Click "Get Started" to create an account
- Click "Sign In" if you already have an account

### Dashboard

- **Today's Tasks**: Main dashboard showing today's cleaning tasks
- **Add Tasks**: Click "Add Task" to create new cleaning tasks
- **Mark Complete**: Click the circle next to tasks to mark them complete
- **Edit/Delete**: Use the edit and delete buttons to manage tasks

### Schedule View

- **Time Periods**: Switch between daily, weekly, monthly, and yearly views
- **Calendar View**: Visual calendar showing tasks by date
- **Filtering**: Filter tasks by category
- **Navigation**: Use arrow buttons to navigate between periods

### Analytics

- **Overview Stats**: See total tasks, completion rate, and weekly progress
- **Category Breakdown**: Visual breakdown of tasks by room
- **Priority Analysis**: Distribution of task priorities
- **Weekly Trends**: Track completion trends over the last 4 weeks
- **Daily Progress**: Current week's daily completion rates

## Features in Detail

### Task Management

- Create tasks with title, description, category, priority, and frequency
- Mark tasks as complete/incomplete
- Edit existing tasks
- Delete tasks
- Filter and sort tasks

### Categories

- **Kitchen**: Cooking, dishes, appliances, etc.
- **Bathroom**: Cleaning, organizing, maintenance
- **Bedroom**: Laundry, organizing, dusting
- **Living Room**: General cleaning, organizing
- **General**: Miscellaneous tasks

### Priorities

- **High**: Urgent tasks that need immediate attention
- **Medium**: Regular maintenance tasks
- **Low**: Optional or less critical tasks

### Frequencies

- **Daily**: Tasks that need to be done every day
- **Weekly**: Weekly maintenance tasks
- **Monthly**: Monthly deep cleaning tasks
- **Yearly**: Annual maintenance or seasonal tasks

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
