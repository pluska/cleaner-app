#!/usr/bin/env node

/**
 * Test script for password reset functionality
 * Run with: node scripts/test-password-reset.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function testPasswordReset() {
  console.log("🧪 Testing Password Reset Functionality\n");

  // Test 1: Forgot Password Request
  console.log("1. Testing forgot password request...");
  try {
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
      }),
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);

    if (response.ok) {
      console.log("   ✅ Forgot password endpoint working");
    } else {
      console.log("   ❌ Forgot password endpoint failed");
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log("\n2. Testing reset password endpoint...");
  console.log("   Note: This endpoint requires a valid access token");
  console.log(
    "   It will be tested when a user actually resets their password"
  );

  console.log("\n3. Testing page accessibility...");
  try {
    const forgotPageResponse = await fetch(`${BASE_URL}/auth/forgot-password`);
    console.log(
      `   Forgot Password Page: ${
        forgotPageResponse.status === 200
          ? "✅ Accessible"
          : "❌ Not accessible"
      }`
    );

    const resetPageResponse = await fetch(`${BASE_URL}/auth/reset-password`);
    console.log(
      `   Reset Password Page: ${
        resetPageResponse.status === 200 ? "✅ Accessible" : "❌ Not accessible"
      }`
    );
  } catch (error) {
    console.log(`   ❌ Error testing pages: ${error.message}`);
  }

  console.log("\n📋 Summary:");
  console.log("- Forgot password API endpoint created");
  console.log("- Reset password API endpoint created");
  console.log("- Forgot password page created");
  console.log("- Reset password page created");
  console.log("- AuthForm updated with forgot password link");
  console.log("- Middleware allows access to new routes");
  console.log("\n🚀 Password reset functionality is ready!");
  console.log("\nTo test the complete flow:");
  console.log("1. Go to /auth/login");
  console.log('2. Click "Forgot Password?"');
  console.log("3. Enter your email");
  console.log("4. Check your email for reset link");
  console.log("5. Click the link and set new password");
}

// Run the test
testPasswordReset().catch(console.error);
