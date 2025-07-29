import { useState, useEffect } from "react";
import { HomeArea } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Home, Heart, Droplets, Calendar } from "lucide-react";
import { createClient } from "@/libs/supabase";

interface AreaHealthProps {
  areas?: HomeArea[];
  onAreaUpdate?: (areas: HomeArea[]) => void;
}

export function AreaHealth({ areas, onAreaUpdate }: AreaHealthProps) {
  const [isLoading, setIsLoading] = useState(false);

  const fetchAreas = async () => {
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

      const response = await fetch("/api/user/areas", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const { areas: fetchedAreas } = await response.json();
        onAreaUpdate?.(fetchedAreas);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!areas) {
      fetchAreas();
    }
  }, [areas]);

  const getHealthColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 80) return "bg-green-500";
    if (percentage > 50) return "bg-yellow-500";
    if (percentage > 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const getHealthStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 80) return { text: "Excellent", color: "text-green-600" };
    if (percentage > 50) return { text: "Good", color: "text-yellow-600" };
    if (percentage > 20)
      return { text: "Needs Attention", color: "text-orange-600" };
    return { text: "Critical", color: "text-red-600" };
  };

  const getAreaIcon = (areaType: string) => {
    switch (areaType) {
      case "kitchen":
        return "🍳";
      case "bathroom":
        return "🚿";
      case "bedroom":
        return "🛏️";
      case "living_room":
        return "🛋️";
      case "dining_room":
        return "🍽️";
      case "office":
        return "💼";
      case "laundry_room":
        return "👕";
      case "garage":
        return "🚗";
      case "basement":
        return "🏠";
      case "attic":
        return "🏠";
      case "hallway":
        return "🚪";
      case "entryway":
        return "🚪";
      default:
        return "🏠";
    }
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case "small":
        return "Small";
      case "medium":
        return "Medium";
      case "large":
        return "Large";
      default:
        return size;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Home Health Map</h2>
          <p className="text-gray-600">Monitor your home's cleanliness</p>
        </div>
        <Badge variant="primary" className="flex items-center space-x-1">
          <Home className="w-4 h-4" />
          <span>{areas?.length || 0} Areas</span>
        </Badge>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas && areas.length > 0 ? (
          areas.map((area) => {
            const healthStatus = getHealthStatus(
              area.current_health,
              area.max_health
            );
            const daysSinceCleaned = area.last_cleaned_at
              ? Math.floor(
                  (Date.now() - new Date(area.last_cleaned_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            return (
              <div
                key={area.id}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getAreaIcon(area.area_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {area.area_name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {area.area_type.replace("_", " ")} •{" "}
                        {getSizeLabel(area.size)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={healthStatus.color}>
                    {healthStatus.text}
                  </Badge>
                </div>

                {/* Health Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Health</span>
                    <span className="text-xs text-gray-600">
                      {area.current_health} / {area.max_health}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getHealthColor(
                        area.current_health,
                        area.max_health
                      )} h-2 rounded-full transition-all duration-300`}
                      style={{
                        width: `${
                          (area.current_health / area.max_health) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Flooring Info */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {area.has_carpet && (
                      <Badge variant="secondary" className="text-xs">
                        Carpet
                      </Badge>
                    )}
                    {area.has_hardwood && (
                      <Badge variant="secondary" className="text-xs">
                        Hardwood
                      </Badge>
                    )}
                    {area.has_tile && (
                      <Badge variant="secondary" className="text-xs">
                        Tile
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Last Cleaned */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {daysSinceCleaned !== null
                        ? daysSinceCleaned === 0
                          ? "Cleaned today"
                          : `${daysSinceCleaned} days ago`
                        : "Never cleaned"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>
                      {Math.round(
                        (area.current_health / area.max_health) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No areas configured</p>
            <p className="text-sm">Add your home areas to start tracking!</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {areas && areas.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  areas.filter((a) => a.current_health / a.max_health > 0.8)
                    .length
                }
              </div>
              <div className="text-xs text-gray-600">Excellent</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {
                  areas.filter(
                    (a) =>
                      a.current_health / a.max_health > 0.5 &&
                      a.current_health / a.max_health <= 0.8
                  ).length
                }
              </div>
              <div className="text-xs text-gray-600">Good</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {
                  areas.filter(
                    (a) =>
                      a.current_health / a.max_health > 0.2 &&
                      a.current_health / a.max_health <= 0.5
                  ).length
                }
              </div>
              <div className="text-xs text-gray-600">Needs Attention</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600">
                {
                  areas.filter((a) => a.current_health / a.max_health <= 0.2)
                    .length
                }
              </div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
