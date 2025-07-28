#!/usr/bin/env node

/**
 * Gamification System Testing Script
 *
 * This script tests the gamification features:
 * 1. User profile creation and updates
 * 2. Tool inventory management
 * 3. Area health tracking
 * 4. Task completion with rewards
 */

const fetch = require("node-fetch");

// Configuration
const BASE_URL = "http://localhost:3000/api";
const TEST_USER_EMAIL = "test@cleanerplanner.com";

class GamificationTester {
  constructor() {
    this.testResults = [];
    this.sessionToken = null;
  }

  async log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
    }[type];

    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  async testUserProfile() {
    this.log("Testing User Profile System...");

    try {
      // Test profile creation
      const profileResponse = await fetch(`${BASE_URL}/user/profile`);
      const profileData = await profileResponse.json();

      if (profileResponse.ok && profileData.profile) {
        this.log("✅ Profile created/retrieved successfully", "success");
        this.log(`   Level: ${profileData.profile.level}`);
        this.log(`   EXP: ${profileData.profile.experience_points}`);
        this.log(`   Coins: ${profileData.profile.coins}`);
        this.log(`   Gems: ${profileData.profile.gems}`);
        return true;
      } else {
        this.log("❌ Failed to create/retrieve profile", "error");
        return false;
      }
    } catch (error) {
      this.log(`❌ Profile test failed: ${error.message}`, "error");
      return false;
    }
  }

  async testToolInventory() {
    this.log("Testing Tool Inventory System...");

    try {
      // Test tool fetching
      const toolsResponse = await fetch(`${BASE_URL}/user/tools`);
      const toolsData = await toolsResponse.json();

      if (toolsResponse.ok) {
        this.log("✅ Tool inventory retrieved successfully", "success");
        this.log(`   Tools count: ${toolsData.tools?.length || 0}`);
        return true;
      } else {
        this.log("❌ Failed to retrieve tool inventory", "error");
        return false;
      }
    } catch (error) {
      this.log(`❌ Tool inventory test failed: ${error.message}`, "error");
      return false;
    }
  }

  async testAreaHealth() {
    this.log("Testing Area Health System...");

    try {
      // Test area fetching
      const areasResponse = await fetch(`${BASE_URL}/user/areas`);
      const areasData = await areasResponse.json();

      if (areasResponse.ok) {
        this.log("✅ Area health retrieved successfully", "success");
        this.log(`   Areas count: ${areasData.areas?.length || 0}`);
        return true;
      } else {
        this.log("❌ Failed to retrieve area health", "error");
        return false;
      }
    } catch (error) {
      this.log(`❌ Area health test failed: ${error.message}`, "error");
      return false;
    }
  }

  async testTaskCompletion() {
    this.log("Testing Task Completion with Rewards...");

    try {
      // First, get available tasks
      const tasksResponse = await fetch(`${BASE_URL}/tasks`);
      const tasksData = await tasksResponse.json();

      if (
        !tasksResponse.ok ||
        !tasksData.tasks ||
        tasksData.tasks.length === 0
      ) {
        this.log("⚠️ No tasks available for testing", "warning");
        return false;
      }

      // Get the first task
      const testTask = tasksData.tasks[0];
      this.log(`   Testing with task: ${testTask.title}`);

      // Test task completion
      const completionResponse = await fetch(
        `${BASE_URL}/tasks/${testTask.id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (completionResponse.ok) {
        const completionData = await completionResponse.json();
        this.log("✅ Task completion successful", "success");
        this.log(`   EXP earned: ${completionData.rewards?.exp_earned || 0}`);
        this.log(
          `   Area health restored: ${
            completionData.rewards?.area_health_restored || 0
          }`
        );
        this.log(`   Level up: ${completionData.rewards?.level_up || false}`);
        return true;
      } else {
        this.log("❌ Task completion failed", "error");
        return false;
      }
    } catch (error) {
      this.log(`❌ Task completion test failed: ${error.message}`, "error");
      return false;
    }
  }

  async runAllTests() {
    this.log("🚀 Starting Gamification System Tests...", "info");
    this.log("==========================================", "info");

    const tests = [
      { name: "User Profile", test: () => this.testUserProfile() },
      { name: "Tool Inventory", test: () => this.testToolInventory() },
      { name: "Area Health", test: () => this.testAreaHealth() },
      { name: "Task Completion", test: () => this.testTaskCompletion() },
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      this.log(`\n📋 Running: ${test.name}`, "info");
      const result = await test.test();
      if (result) {
        passedTests++;
      }
      this.testResults.push({ name: test.name, passed: result });
    }

    // Summary
    this.log("\n📊 Test Results Summary", "info");
    this.log("==========================================", "info");
    this.log(
      `✅ Passed: ${passedTests}/${totalTests}`,
      passedTests === totalTests ? "success" : "warning"
    );

    if (passedTests < totalTests) {
      this.log("\n❌ Failed Tests:", "error");
      this.testResults
        .filter((result) => !result.passed)
        .forEach((result) => this.log(`   - ${result.name}`, "error"));
    }

    this.log(
      "\n🎯 Gamification System Status:",
      passedTests === totalTests ? "success" : "warning"
    );
    if (passedTests === totalTests) {
      this.log("   🎉 All systems operational!", "success");
    } else {
      this.log("   ⚠️ Some systems need attention", "warning");
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new GamificationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = GamificationTester;
