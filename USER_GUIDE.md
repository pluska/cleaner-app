# 🏠 SparkClean - Complete User Guide

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Core Features](#core-features)
3. [Gamification System](#gamification-system)
4. [Area Health System](#area-health-system)
5. [Tool Management](#tool-management)
6. [Task Management](#task-management)
7. [Dashboard & Analytics](#dashboard--analytics)
8. [Advanced Features](#advanced-features)
9. [Tips & Best Practices](#tips--best-practices)

---

## 🚀 Getting Started

### What is SparkClean?

SparkClean is a gamified home cleaning task manager that transforms household chores into an engaging experience. The app combines task management with gaming elements like experience points, tool management, and area health tracking to make cleaning more enjoyable and effective.

### Key Features Overview

- **🎮 Gamified Experience**: Earn XP, level up, and unlock achievements
- **🏠 Area Health Tracking**: Monitor the cleanliness of different home areas
- **🛠️ Tool Management**: Manage cleaning tools with durability and maintenance
- **📅 Smart Scheduling**: Flexible task scheduling with AI-powered recommendations
- **📊 Progress Analytics**: Track your cleaning habits and improvements
- **🌍 Multi-language**: Available in English and Spanish

---

## 🎯 Core Features

### Authentication & Profile

**Sign Up/Login**

- Create an account with email and password
- Your profile is automatically created with starting resources:
  - Level 1
  - 0 Experience Points
  - 100 Coins
  - 10 Gems
  - 0-day streak

**User Profile**

- View your current level and experience progress
- Track your cleaning streak (consecutive days with completed tasks)
- Monitor coins and gems earned
- See total tasks and subtasks completed

### Dashboard Overview

The main dashboard provides:

- **Today's Tasks**: Tasks scheduled for the current day
- **Quick Stats**: Completion rate, streak, and level progress
- **Area Health**: Visual overview of your home's cleanliness
- **Tool Inventory**: Status of your cleaning equipment
- **Recent Activity**: Latest completed tasks and rewards earned

---

## 🎮 Gamification System

### Experience Points (EXP) & Leveling

**How to Earn EXP:**

- **Task Completion**: 20-100 EXP per task (based on importance)
- **Subtask Completion**: 5-30 EXP per subtask
- **Streak Bonuses**: Extra EXP for consecutive days
- **Achievements**: Bonus EXP for milestones

**Level System:**

- **Formula**: `Level = floor(sqrt(EXP / 100)) + 1`
- **Example**:
  - Level 1: 0-399 EXP
  - Level 2: 400-899 EXP (needs 400 EXP)
  - Level 3: 900-1599 EXP (needs 900 EXP)

**Level Up Rewards:**

- **Coins**: Earned based on EXP gained
- **Gems**: 1 gem per level up
- **New Tools**: Unlock better equipment
- **Achievements**: Special badges and rewards

### Virtual Currency

**Coins (💰)**

- Earned: 1 coin per 10 EXP
- Used for: Tool maintenance, basic upgrades
- Starting amount: 100 coins

**Gems (💎)**

- Earned: 1 gem per level up, special achievements
- Used for: Premium tools, special features
- Starting amount: 10 gems

### Streak System

**Daily Streak:**

- Complete at least one task per day
- Streak increases with consecutive days
- Bonus rewards for maintaining streaks
- Streak resets if you miss a day

**Streak Bonuses:**

- 7-day streak: +50% EXP bonus
- 30-day streak: +100% EXP bonus
- 100-day streak: Special achievement

---

## 🏠 Area Health System

### How Areas Work

**Area Types:**

- **Kitchen**: High-traffic area, needs frequent cleaning
- **Bathroom**: Hygiene-critical, moderate cleaning needs
- **Bedroom**: Personal space, regular maintenance
- **Living Room**: Social area, regular cleaning
- **Dining Room**: Food area, moderate cleaning
- **Office**: Work space, light cleaning
- **Laundry Room**: Utility area, periodic cleaning
- **Garage**: Storage area, occasional cleaning
- **Basement**: Storage area, occasional cleaning
- **Attic**: Storage area, occasional cleaning
- **Hallway**: Transition area, light cleaning
- **Entryway**: High-traffic area, frequent cleaning

### Health Mechanics

**Health Points:**

- **Range**: 0-100 points (varies by area type and size)
- **Starting Health**: 100% (full health)
- **Critical Level**: Below 20% health

**Health Decay:**

- **Daily Decay**: 1-2% per day (varies by area type)
- **Factors Affecting Decay:**
  - Area type (kitchen decays faster than bedroom)
  - Size (larger areas decay slightly faster)
  - Traffic (high-traffic areas decay faster)
  - Flooring type (carpet decays faster than tile)

**Health Restoration:**

- **Task Completion**: Restores health based on task importance
- **Restoration Formula**: `Health Restored = Task Importance × Base Restoration`
- **Maximum Health**: Cannot exceed the area's max health

### Visual Health Indicators

**Color-Coded Status:**

- 🟢 **Green (80-100%)**: Excellent - Area is very clean
- 🟡 **Yellow (40-79%)**: Good - Area needs attention soon
- 🟠 **Orange (20-39%)**: Needs Attention - Area requires cleaning
- 🔴 **Red (0-19%)**: Critical - Area needs immediate cleaning

**Health Bar:**

- Visual progress bar showing current health percentage
- Smooth animations when health changes
- Tooltip showing exact health points

### Area Management

**Adding Areas:**

1. Go to Dashboard → Area Health
2. Click "Add Area"
3. Enter area name and select type
4. Choose size (small, medium, large)
5. Select flooring types (carpet, hardwood, tile)
6. Save to start tracking

**Area Features:**

- **Size Impact**: Larger areas have higher max health but decay faster
- **Flooring Impact**: Different flooring types affect cleaning needs
- **Special Features**: Track unique characteristics (pets, children, etc.)

---

## 🛠️ Tool Management

### Tool System Overview

**Tool Categories:**

- **Cleaning Supplies**: Basic tools (sponges, cloths)
- **Bathroom**: Specialized bathroom tools
- **Floor Cleaning**: Mops, vacuums, brooms
- **Deep Cleaning**: Steam cleaners, specialized equipment
- **Kitchen**: Kitchen-specific tools

**Tool Rarity Levels:**

- 🟢 **Common**: Basic tools, easy to acquire
- 🔵 **Uncommon**: Better quality, moderate cost
- 🟣 **Rare**: High-quality tools, significant investment
- 🟠 **Epic**: Premium tools, special features
- 🟡 **Legendary**: Best tools, unique abilities

### Tool Durability System

**Durability Mechanics:**

- **Max Durability**: Varies by tool type (50-500 uses)
- **Durability Loss**: 1-5 points per use (varies by tool)
- **Maintenance**: Clean tools to extend lifespan
- **Replacement**: Tools become unusable at 0 durability

**Tool Stats:**

- **Cleaning Power**: How effectively the tool cleans
- **Durability**: How long the tool lasts
- **Versatility**: How many different tasks it can handle
- **Maintenance Cost**: Cost to maintain the tool
- **Replacement Cost**: Cost to replace the tool

### Tool Management Features

**Inventory Management:**

- View all owned tools with durability bars
- See tool usage statistics
- Track maintenance schedules
- Monitor tool performance

**Tool Maintenance:**

- **Cleaning**: Extends tool life by 20-50%
- **Maintenance Cost**: Varies by tool rarity
- **Maintenance Schedule**: Based on tool usage
- **Auto-Notifications**: When tools need attention

**Tool Acquisition:**

- **Starting Tools**: Basic tools provided
- **Purchase**: Buy tools with coins
- **Unlock**: Earn better tools through achievements
- **Crafting**: Combine tools to create better ones (future feature)

### Tool Usage Tracking

**Usage Analytics:**

- **Uses Count**: Total times tool has been used
- **Efficiency**: How well the tool performs
- **Cost Analysis**: Maintenance vs. replacement costs
- **Recommendations**: When to replace tools

---

## 📋 Task Management

### Task System Overview

**Task Types:**

- **Daily Tasks**: Frequent, quick tasks (dishes, counter cleaning)
- **Weekly Tasks**: Regular maintenance (vacuuming, dusting)
- **Monthly Tasks**: Deep cleaning (appliance cleaning, window washing)
- **Seasonal Tasks**: Periodic maintenance (gutter cleaning, deep carpet cleaning)

**Task Categories:**

- **Kitchen**: Food preparation and cooking areas
- **Bathroom**: Hygiene and personal care areas
- **Bedroom**: Personal living spaces
- **Living Room**: Social and entertainment areas
- **Laundry**: Clothing care and maintenance
- **Exterior**: Outdoor areas and maintenance
- **General**: Miscellaneous tasks

### Task Completion & Rewards

**Completion Process:**

1. **Select Task**: Choose from today's scheduled tasks
2. **View Subtasks**: See detailed steps for the task
3. **Complete Subtasks**: Mark individual steps as done
4. **Use Tools**: Select appropriate cleaning tools
5. **Complete Task**: Mark entire task as finished
6. **Earn Rewards**: Receive EXP, coins, and health restoration

**Reward System:**

- **Base EXP**: Based on task importance (1-5 scale)
- **Subtask EXP**: Additional EXP for completing all subtasks
- **Tool Bonus**: Extra EXP for using appropriate tools
- **Streak Bonus**: Multiplier for maintaining streaks
- **Area Health**: Restore health to relevant areas

### Task Scheduling

**Frequency Options:**

- **Daily**: Every day
- **Weekly**: Every 7 days
- **Custom**: User-defined intervals (3, 5, 10 days, etc.)
- **Monthly**: Every 30 days
- **Yearly**: Annual tasks

**Scheduling Features:**

- **Flexible Timing**: Choose preferred days and times
- **Conflict Resolution**: Automatic scheduling around conflicts
- **Weather Integration**: Adjust outdoor tasks based on weather
- **Energy Optimization**: Suggest easier tasks on busy days

### Task Modification

**Modification Options:**

1. **Single Override**: Change just one instance of a task
2. **Future Pattern**: Modify all future occurrences
3. **Complete Reset**: Change the entire task pattern

**Rescheduling:**

- **Move Tasks**: Drag and drop between days
- **Skip Tasks**: Mark tasks as skipped with reasons
- **Complete Early**: Mark tasks as done before due date
- **Bulk Operations**: Modify multiple tasks at once

---

## 📊 Dashboard & Analytics

### Main Dashboard

**Overview Section:**

- **Today's Progress**: Tasks completed vs. scheduled
- **Current Streak**: Consecutive days with completed tasks
- **Level Progress**: Current level and EXP to next level
- **Quick Stats**: Completion rate, coins earned, gems earned

**Area Health Map:**

- **Visual Overview**: Color-coded health status for all areas
- **Quick Actions**: Add new areas, view detailed health
- **Health Trends**: See health changes over time
- **Priority Areas**: Highlight areas needing attention

**Tool Inventory:**

- **Durability Status**: Visual bars showing tool condition
- **Maintenance Alerts**: Tools needing attention
- **Performance Stats**: Tool usage and efficiency
- **Acquisition Options**: Available tools to purchase

### Analytics Dashboard

**Progress Tracking:**

- **Weekly Trends**: Task completion over the last 4 weeks
- **Category Breakdown**: Performance by room type
- **Time Analysis**: When you're most productive
- **Tool Efficiency**: Which tools work best for you

**Achievement Tracking:**

- **Milestones**: Level ups, streak achievements
- **Special Achievements**: Unique accomplishments
- **Progress Bars**: Visual progress toward goals
- **Rewards History**: Track all earned rewards

**Performance Metrics:**

- **Completion Rate**: Percentage of tasks completed
- **Streak Statistics**: Current and longest streaks
- **EXP Earnings**: Total and average EXP per day
- **Area Health Trends**: Overall home cleanliness improvement

### Schedule View

**Calendar Interface:**

- **Monthly View**: Full calendar with task indicators
- **Weekly View**: Detailed timeline of tasks
- **Daily View**: Hour-by-hour task breakdown
- **Category Filters**: Filter tasks by room type

**Task Information:**

- **Task Count**: Number of tasks per day
- **Estimated Time**: Total time needed for all tasks
- **EXP Potential**: Total EXP available for the day
- **Health Impact**: Areas that will be affected

---

## 🚀 Advanced Features

### AI-Powered Recommendations

**Smart Scheduling:**

- **Pattern Recognition**: Learn your cleaning preferences
- **Optimal Timing**: Suggest best times for tasks
- **Energy Matching**: Match task difficulty to your energy levels
- **Weather Integration**: Adjust outdoor tasks based on weather

**Personalized Tasks:**

- **Home Assessment**: AI interview to understand your home
- **Custom Recommendations**: Tasks tailored to your lifestyle
- **Health Impact Education**: Explain why tasks are important
- **Scientific Sources**: Back recommendations with research

### Achievement System

**Achievement Types:**

- **Level Achievements**: Milestones for reaching new levels
- **Streak Achievements**: Rewards for maintaining streaks
- **Tool Mastery**: Achievements for tool usage and maintenance
- **Area Specialization**: Bonuses for cleaning specific areas
- **Seasonal Events**: Special achievements for holidays/seasons

**Achievement Rewards:**

- **EXP Bonuses**: Extra experience points
- **Coin Rewards**: Additional virtual currency
- **Gem Rewards**: Premium currency
- **Tool Unlocks**: Access to better equipment
- **Special Badges**: Visual recognition of accomplishments

### Social Features

**Community Features:**

- **Leaderboards**: Compare progress with friends
- **Sharing**: Share achievements and milestones
- **Tips Exchange**: Share cleaning tips and tricks
- **Challenges**: Participate in community challenges

**Family Management:**

- **Multiple Users**: Add family members to your home
- **Shared Tasks**: Assign tasks to different family members
- **Progress Tracking**: Monitor everyone's contributions
- **Reward Sharing**: Distribute rewards among family members

---

## 💡 Tips & Best Practices

### Getting Started

**1. Set Up Your Home:**

- Add all your home areas first
- Be honest about area sizes and types
- Include special features (pets, children, allergies)

**2. Choose Your Tools:**

- Start with basic tools from your inventory
- Focus on tools that match your cleaning style
- Don't worry about premium tools initially

**3. Create Your Schedule:**

- Start with a few essential tasks
- Gradually add more tasks as you get comfortable
- Use the AI recommendations to optimize your schedule

### Maximizing Rewards

**1. Maintain Your Streak:**

- Complete at least one task every day
- Use the streak bonus to earn extra EXP
- Plan ahead to avoid breaking your streak

**2. Use Appropriate Tools:**

- Match tools to tasks for bonus EXP
- Maintain your tools regularly
- Replace worn tools before they break

**3. Focus on Area Health:**

- Keep areas above 50% health for optimal rewards
- Prioritize critical areas (kitchen, bathroom)
- Use health restoration to your advantage

### Tool Management Tips

**1. Regular Maintenance:**

- Clean tools after recommended usage
- Monitor durability bars closely
- Replace tools before they reach 0 durability

**2. Tool Selection:**

- Use higher-quality tools for important tasks
- Match tool rarity to task importance
- Consider tool versatility for multiple tasks

**3. Cost Management:**

- Balance maintenance costs with replacement costs
- Invest in durable tools for frequent tasks
- Use coins wisely for tool upgrades

### Area Health Optimization

**1. Priority Areas:**

- Focus on kitchen and bathroom (highest traffic)
- Maintain living areas for comfort
- Don't neglect storage areas completely

**2. Health Monitoring:**

- Check area health daily
- Address critical areas immediately
- Use health restoration strategically

**3. Cleaning Frequency:**

- Match cleaning frequency to area type
- Consider traffic and usage patterns
- Adjust based on seasonal changes

### Advanced Strategies

**1. EXP Maximization:**

- Complete all subtasks for bonus EXP
- Use appropriate tools for tool bonuses
- Maintain streaks for multipliers
- Focus on high-importance tasks

**2. Resource Management:**

- Save coins for important tool upgrades
- Use gems for premium features
- Balance immediate vs. long-term rewards
- Plan for seasonal events

**3. Schedule Optimization:**

- Group similar tasks together
- Match task difficulty to your energy
- Use weather information for outdoor tasks
- Plan around your lifestyle patterns

---

## 🔧 Troubleshooting

### Common Issues

**Area Health Not Updating:**

- Ensure you're completing tasks for the correct area type
- Check that tools are being used properly
- Verify task completion is being recorded

**Tools Not Working:**

- Check tool durability (replace if at 0)
- Ensure tools are properly maintained
- Verify tool compatibility with tasks

**EXP Not Earning:**

- Confirm task completion is being saved
- Check that subtasks are being completed
- Verify streak is being maintained

**Schedule Issues:**

- Check task frequency settings
- Verify due dates are correct
- Ensure no conflicts with other tasks

### Getting Help

**Support Resources:**

- **In-App Help**: Use the help section in the app
- **Community Forum**: Connect with other users
- **Tutorial Videos**: Watch guided walkthroughs
- **FAQ Section**: Common questions and answers

**Contact Support:**

- **Email Support**: Send detailed issue descriptions
- **Bug Reports**: Include screenshots and steps to reproduce
- **Feature Requests**: Suggest improvements and new features

---

## 📱 App Navigation

### Main Menu Structure

```
Dashboard
├── Today's Tasks
├── Area Health
├── Tool Inventory
└── Quick Stats

Schedule
├── Calendar View
├── Weekly Timeline
├── Daily Breakdown
└── Task Management

Analytics
├── Progress Charts
├── Achievement Tracking
├── Performance Metrics
└── Trend Analysis

Profile
├── User Stats
├── Achievement Badges
├── Settings
└── Help & Support
```

### Key Shortcuts

**Quick Actions:**

- **Complete Task**: Click the circle next to any task
- **Add Area**: Use the "+" button in Area Health
- **Add Tool**: Use the "+" button in Tool Inventory
- **View Details**: Click on any item for detailed information

**Navigation Tips:**

- Use the bottom navigation for main sections
- Swipe between views where available
- Use the search function to find specific tasks
- Bookmark frequently used sections

---

## 🎉 Conclusion

SparkClean transforms household cleaning from a chore into an engaging, rewarding experience. By understanding the gamification system, area health mechanics, and tool management, you can maximize your cleaning efficiency while having fun.

**Key Takeaways:**

- **Start Small**: Begin with essential tasks and gradually expand
- **Maintain Streaks**: Consistency is key to earning rewards
- **Use Tools Wisely**: Proper tool management extends their lifespan
- **Monitor Health**: Keep areas clean for optimal rewards
- **Enjoy the Process**: The gamification makes cleaning more enjoyable

Remember, the goal is not just to clean your home, but to build sustainable cleaning habits that improve your living environment and your overall well-being. Happy cleaning! 🧹✨
