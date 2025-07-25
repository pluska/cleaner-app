"use client";

import { useState, useEffect } from "react";
import { UserProfile as UserProfileType, UserTool, HomeArea } from "@/types";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { ToolInventory } from "@/components/dashboard/ToolInventory";
import { AreaHealth } from "@/components/dashboard/AreaHealth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Trophy, Star, Target, TrendingUp } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileType | undefined>(
    undefined
  );
  const [tools, setTools] = useState<UserTool[]>([]);
  const [areas, setAreas] = useState<HomeArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile, tools, and areas in parallel
        const [profileRes, toolsRes, areasRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/tools"),
          fetch("/api/user/areas"),
        ]);

        if (profileRes.ok) {
          const { profile: fetchedProfile } = await profileRes.json();
          setProfile(fetchedProfile);
        }

        if (toolsRes.ok) {
          const { tools: fetchedTools } = await toolsRes.json();
          setTools(fetchedTools);
        }

        if (areasRes.ok) {
          const { areas: fetchedAreas } = await areasRes.json();
          setAreas(fetchedAreas);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto bg-bg min-h-screen p-4 sm:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-bg min-h-screen p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600">
          Track your cleaning progress and achievements
        </p>
      </div>

      {/* Main Profile Section */}
      <div className="mb-8">
        <UserProfile profile={profile} onProfileUpdate={setProfile} />
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="tools" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Tools</span>
          </TabsTrigger>
          <TabsTrigger value="areas" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Areas</span>
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="flex items-center space-x-2"
          >
            <Star className="w-4 h-4" />
            <span>Achievements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-6">
          <ToolInventory tools={tools} onToolUpdate={setTools} />
        </TabsContent>

        <TabsContent value="areas" className="space-y-6">
          <AreaHealth areas={areas} onAreaUpdate={setAreas} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Achievements
                </h2>
                <p className="text-gray-600">
                  Unlock achievements by completing tasks
                </p>
              </div>
              <Badge variant="primary" className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Coming Soon</span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sample achievements - these would be dynamic in the future */}
              {[
                {
                  id: "first_task",
                  title: "First Steps",
                  description: "Complete your first cleaning task",
                  icon: "🎯",
                  unlocked: (profile?.total_tasks_completed || 0) > 0,
                  progress: profile?.total_tasks_completed || 0,
                  target: 1,
                },
                {
                  id: "level_5",
                  title: "Rising Star",
                  description: "Reach level 5",
                  icon: "⭐",
                  unlocked: (profile?.level || 0) >= 5,
                  progress: profile?.level || 0,
                  target: 5,
                },
                {
                  id: "streak_7",
                  title: "Week Warrior",
                  description: "Maintain a 7-day streak",
                  icon: "🔥",
                  unlocked: (profile?.streak_days || 0) >= 7,
                  progress: profile?.streak_days || 0,
                  target: 7,
                },
                {
                  id: "tool_master",
                  title: "Tool Master",
                  description: "Collect 5 different tools",
                  icon: "🔧",
                  unlocked: (tools?.length || 0) >= 5,
                  progress: tools?.length || 0,
                  target: 5,
                },
                {
                  id: "area_explorer",
                  title: "Area Explorer",
                  description: "Configure 3 home areas",
                  icon: "🏠",
                  unlocked: (areas?.length || 0) >= 3,
                  progress: areas?.length || 0,
                  target: 3,
                },
                {
                  id: "coin_collector",
                  title: "Coin Collector",
                  description: "Earn 100 coins",
                  icon: "🪙",
                  unlocked: (profile?.coins || 0) >= 100,
                  progress: profile?.coins || 0,
                  target: 100,
                },
              ].map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all ${
                    achievement.unlocked
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="success" className="text-xs">
                        Unlocked
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span>
                        {achievement.progress} / {achievement.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          achievement.unlocked ? "bg-green-500" : "bg-gray-300"
                        }`}
                        style={{
                          width: `${Math.min(
                            (achievement.progress / achievement.target) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
