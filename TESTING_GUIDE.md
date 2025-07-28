# 🧪 Gamification System Testing Guide

## 📋 Overview

This guide covers how to test the gamification system implemented in CleanerPlanner. The system includes user profiles, tool inventory, area health, and task completion rewards.

## 🚀 Quick Start Testing

### 1. **Manual Testing (Recommended)**

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Navigate to the dashboard:**

   - Go to `http://localhost:3000`
   - Sign in with your account
   - You should see the gamified dashboard with user profile

3. **Use the Testing Panel:**
   - Look for the "Test Gamification" button in the bottom-right corner
   - Click it to open the testing panel
   - Use the buttons to test different notification types

### 2. **Automated Testing**

Run the automated test script:

```bash
node scripts/test-gamification.js
```

## 🎯 Testing Checklist

### **User Profile System** ✅

- [ ] **Profile Creation**: User profile is created automatically on first visit
- [ ] **Level Display**: Current level is shown correctly
- [ ] **EXP Bar**: Experience progress bar updates correctly
- [ ] **Statistics**: Task completion count, streak days, etc.
- [ ] **Currency**: Coins and gems display correctly

### **Tool Inventory System** ✅

- [ ] **Tool Display**: Tools show with durability bars
- [ ] **Tool Addition**: Can add new tools to inventory
- [ ] **Durability**: Tool durability decreases with use
- [ ] **Tool Status**: Shows tool condition (Good/Worn/Critical)
- [ ] **Tool Stats**: Displays cleaning power, speed, cost

### **Area Health System** ✅

- [ ] **Area Display**: Home areas show with health bars
- [ ] **Health Status**: Shows area condition (Excellent/Good/Needs Attention/Critical)
- [ ] **Flooring Info**: Displays carpet, hardwood, tile badges
- [ ] **Last Cleaned**: Shows days since last cleaning
- [ ] **Health Restoration**: Areas regain health when cleaned

### **Task Completion Rewards** ✅

- [ ] **EXP Rewards**: Tasks give experience points
- [ ] **Coin Rewards**: Tasks give coins (1 per 10 EXP)
- [ ] **Gem Rewards**: Level ups give gems
- [ ] **Area Health**: Tasks restore area health
- [ ] **Tool Durability**: Tools lose durability when used
- [ ] **Notifications**: Reward notifications appear

### **Notification System** ✅

- [ ] **EXP Notifications**: Yellow star notifications
- [ ] **Coin Notifications**: Yellow coin notifications
- [ ] **Gem Notifications**: Purple gem notifications
- [ ] **Level Up Notifications**: Blue level notifications
- [ ] **Health Notifications**: Green heart notifications
- [ ] **Auto-close**: Notifications disappear after 3 seconds

## 🔧 API Endpoint Testing

### **User Profile API**

```bash
# GET /api/user/profile
curl http://localhost:3000/api/user/profile

# PUT /api/user/profile
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "display_name": "Test User"}'
```

### **Tool Inventory API**

```bash
# GET /api/user/tools
curl http://localhost:3000/api/user/tools

# POST /api/user/tools
curl -X POST http://localhost:3000/api/user/tools \
  -H "Content-Type: application/json" \
  -d '{"tool_id": "vacuum_cleaner", "tool_name": "Vacuum Cleaner"}'
```

### **Area Health API**

```bash
# GET /api/user/areas
curl http://localhost:3000/api/user/areas

# POST /api/user/areas
curl -X POST http://localhost:3000/api/user/areas \
  -H "Content-Type: application/json" \
  -d '{"area_name": "Living Room", "area_type": "living_room", "size": "medium"}'
```

### **Task Completion API**

```bash
# POST /api/tasks/[id]/complete
curl -X POST http://localhost:3000/api/tasks/TASK_ID/complete \
  -H "Content-Type: application/json"
```

## 🐛 Common Issues & Solutions

### **Issue: Profile not loading**

- **Solution**: Check if user is authenticated
- **Debug**: Check browser console for errors
- **Fix**: Ensure Supabase auth is working

### **Issue: Tools not showing**

- **Solution**: Check if tools exist in database
- **Debug**: Verify `/api/user/tools` endpoint
- **Fix**: Add tools via API or database

### **Issue: Areas not loading**

- **Solution**: Check if areas exist in database
- **Debug**: Verify `/api/user/areas` endpoint
- **Fix**: Add areas via API or database

### **Issue: Notifications not appearing**

- **Solution**: Check if Framer Motion is installed
- **Debug**: Verify notification component is mounted
- **Fix**: Ensure proper imports and dependencies

### **Issue: Task completion not working**

- **Solution**: Check if task exists and user has permission
- **Debug**: Verify task completion API endpoint
- **Fix**: Ensure proper authentication and task ownership

## 📊 Performance Testing

### **Load Testing**

```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl http://localhost:3000/api/user/profile &
done
wait
```

### **Memory Testing**

- Monitor memory usage during extended use
- Check for memory leaks in notification system
- Verify proper cleanup of event listeners

## 🎮 Gamification Balance Testing

### **EXP Balance**

- [ ] Level 1: 0-99 EXP
- [ ] Level 2: 100-199 EXP
- [ ] Level 3: 200-299 EXP
- [ ] Test level progression

### **Coin Balance**

- [ ] 1 coin per 10 EXP
- [ ] Test coin accumulation
- [ ] Verify coin display

### **Gem Balance**

- [ ] 1 gem per level up
- [ ] Test gem earning
- [ ] Verify gem display

### **Tool Durability**

- [ ] Tools lose durability with use
- [ ] Test durability thresholds
- [ ] Verify tool status updates

### **Area Health**

- [ ] Areas lose health over time
- [ ] Tasks restore area health
- [ ] Test health thresholds

## 📝 Test Data Setup

### **Create Test User**

```sql
-- Insert test user profile
INSERT INTO user_profiles (
  user_id, username, display_name, level,
  experience_points, total_tasks_completed,
  streak_days, coins, gems
) VALUES (
  'test-user-id', 'testuser', 'Test User', 1,
  0, 0, 0, 100, 10
);
```

### **Add Test Tools**

```sql
-- Insert test tools
INSERT INTO user_tools (
  user_id, tool_id, tool_name, current_durability,
  max_durability, uses_count, is_active
) VALUES (
  'test-user-id', 'vacuum_cleaner', 'Vacuum Cleaner',
  80, 100, 5, true
);
```

### **Add Test Areas**

```sql
-- Insert test areas
INSERT INTO home_areas (
  user_id, area_name, area_type, current_health,
  max_health, size, has_carpet, has_hardwood
) VALUES (
  'test-user-id', 'Living Room', 'living_room',
  75, 100, 'medium', true, false
);
```

## 🎯 Success Criteria

### **Functional Requirements**

- [ ] All gamification features work correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive design works on all devices
- [ ] Performance is acceptable (< 2s load time)

### **User Experience**

- [ ] Notifications are clear and informative
- [ ] Progress bars are accurate
- [ ] Rewards feel satisfying
- [ ] Interface is intuitive
- [ ] Animations are smooth

### **Technical Requirements**

- [ ] Database operations are efficient
- [ ] API responses are fast
- [ ] Error handling is robust
- [ ] Code is maintainable
- [ ] Documentation is complete

## 🚀 Deployment Testing

### **Production Checklist**

- [ ] Environment variables are set correctly
- [ ] Database migrations are applied
- [ ] API endpoints are accessible
- [ ] Authentication works properly
- [ ] Error monitoring is configured

### **Performance Monitoring**

- [ ] Set up performance monitoring
- [ ] Configure error tracking
- [ ] Monitor user engagement metrics
- [ ] Track gamification effectiveness

## 📞 Support

If you encounter issues during testing:

1. **Check the console** for error messages
2. **Verify API endpoints** are responding
3. **Test with different browsers** for compatibility
4. **Check network tab** for failed requests
5. **Review the logs** for server-side errors

For additional help, refer to the project documentation or create an issue in the repository.
