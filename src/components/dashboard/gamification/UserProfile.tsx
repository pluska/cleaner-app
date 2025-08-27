import { useState, useEffect } from "react";
import { UserProfile as UserProfileType } from "@/types";
import { Card } from "@/components/ui/layout/Card";
import { Badge } from "@/components/ui/data-display/Badge";
import { Star, Coins, Gem, TrendingUp, Trophy } from "lucide-react";
import { createClient } from "@/libs/supabase";

interface UserProfileProps {
  profile?: UserProfileType;
  onProfileUpdate?: (profile: UserProfileType) => void;
}

export function UserProfile({ profile, onProfileUpdate }: UserProfileProps) {
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error("No session token available");
        return;
      }

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const { profile: fetchedProfile } = await response.json();
        onProfileUpdate?.(fetchedProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, [profile]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Loading profile...</p>
        </div>
      </Card>
    );
  }

  const expForNextLevel = (profile.level + 1) * 100;
  const expProgress = ((profile.experience_points % 100) / 100) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {profile.display_name || profile.username || "Cleaning Hero"}
          </h2>
          <p className="text-gray-600">Level {profile.level} Cleaner</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="primary" className="flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>Level {profile.level}</span>
          </Badge>
        </div>
      </div>

      {/* Experience Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Experience</span>
          <span className="text-sm text-gray-500">
            {profile.experience_points} / {expForNextLevel} XP
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
            style={{ width: `${expProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {expForNextLevel - profile.experience_points} XP to next level
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Tasks Completed
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {profile.total_tasks_completed}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">Streak</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {profile.streak_days} days
          </p>
        </div>
      </div>

      {/* Currency */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-gray-900">{profile.coins}</span>
            <span className="text-sm text-gray-600">coins</span>
          </div>
          <div className="flex items-center space-x-2">
            <Gem className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-gray-900">{profile.gems}</span>
            <span className="text-sm text-gray-600">gems</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
