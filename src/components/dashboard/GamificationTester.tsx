"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useNotificationManager } from "@/components/ui/Notification";
import { Star, Coins, Gem, Heart, Zap, Trophy } from "lucide-react";

export function GamificationTester() {
  const [isVisible, setIsVisible] = useState(false);
  const { showNotification, showRewards } = useNotificationManager();

  const testNotifications = () => {
    // Test different notification types
    setTimeout(() => showNotification("exp", 25, "Experience gained!"), 100);
    setTimeout(() => showNotification("coins", 5, "Coins earned!"), 500);
    setTimeout(() => showNotification("gems", 1, "Gem earned!"), 1000);
    setTimeout(() => showNotification("level", 1, "Level up!"), 1500);
    setTimeout(
      () => showNotification("health", 10, "Area health restored!"),
      2000
    );
  };

  const testRewards = () => {
    const mockRewards = {
      exp_earned: 50,
      coins_earned: 10,
      gems_earned: 1,
      level_up: true,
      area_health_restored: 15,
    };
    showRewards(mockRewards);
  };

  const testAPIEndpoints = async () => {
    const endpoints = [
      { name: "Profile", url: "/api/user/profile" },
      { name: "Tools", url: "/api/user/tools" },
      { name: "Areas", url: "/api/user/areas" },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url);
        const data = await response.json();
        console.log(`${endpoint.name} API:`, data);
      } catch (error) {
        console.error(`${endpoint.name} API Error:`, error);
      }
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Trophy className="w-4 h-4" />
          <span>Test Gamification</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 w-80 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Gamification Tester
          </h3>
          <Button
            onClick={() => setIsVisible(false)}
            variant="outline"
            size="sm"
          >
            ×
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Notifications
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() =>
                  showNotification("exp", 25, "Experience gained!")
                }
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                <Star className="w-3 h-3" />
                <span>EXP</span>
              </Button>
              <Button
                onClick={() => showNotification("coins", 5, "Coins earned!")}
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                <Coins className="w-3 h-3" />
                <span>Coins</span>
              </Button>
              <Button
                onClick={() => showNotification("gems", 1, "Gem earned!")}
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                <Gem className="w-3 h-3" />
                <span>Gems</span>
              </Button>
              <Button
                onClick={() => showNotification("level", 1, "Level up!")}
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                <Trophy className="w-3 h-3" />
                <span>Level</span>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Batch Tests
            </h4>
            <div className="space-y-2">
              <Button
                onClick={testNotifications}
                size="sm"
                variant="primary"
                className="w-full"
              >
                Test All Notifications
              </Button>
              <Button
                onClick={testRewards}
                size="sm"
                variant="secondary"
                className="w-full"
              >
                Test Rewards Bundle
              </Button>
              <Button
                onClick={testAPIEndpoints}
                size="sm"
                variant="outline"
                className="w-full"
              >
                Test API Endpoints
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Status: Active</span>
              <Badge variant="success" size="sm">
                Testing Mode
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
