import { useState, useEffect } from "react";
import { HomeArea } from "@/types";
import { Card } from "@/components/ui/layout/Card";
import { Badge } from "@/components/ui/data-display/Badge";
import { Button } from "@/components/ui/forms/Button";
import { Input } from "@/components/ui/forms/Input";
import { Select } from "@/components/ui/forms/Select";
import { Home, Heart, Droplets, Calendar, Plus, X } from "lucide-react";
import { createClient } from "@/libs/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

interface AreaHealthProps {
  areas: HomeArea[];
  onAreaUpdate?: (areas: HomeArea[]) => void;
}

export function AreaHealth({ areas, onAreaUpdate }: AreaHealthProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [formData, setFormData] = useState({
    area_name: "",
    area_type: "kitchen",
    size: "medium",
    has_carpet: false,
    has_hardwood: false,
    has_tile: false,
  });

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

  const addArea = async () => {
    if (!formData.area_name.trim()) return;

    setIsAddingArea(true);
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form and close modal
        setFormData({
          area_name: "",
          area_type: "kitchen",
          size: "medium",
          has_carpet: false,
          has_hardwood: false,
          has_tile: false,
        });
        setShowAddModal(false);
        // Refresh areas
        fetchAreas();
      } else {
        const error = await response.json();
        console.error("Error adding area:", error);
      }
    } catch (error) {
      console.error("Error adding area:", error);
    } finally {
      setIsAddingArea(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

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

  const areaTypes = [
    { value: "kitchen", label: t("Kitchen", language) },
    { value: "bathroom", label: t("Bathroom", language) },
    { value: "bedroom", label: t("Bedroom", language) },
    { value: "living_room", label: t("Living Room", language) },
    { value: "dining_room", label: t("Dining Room", language) },
    { value: "office", label: t("Office", language) },
    { value: "laundry_room", label: t("Laundry", language) },
    { value: "garage", label: t("Garage", language) },
    { value: "basement", label: t("Basement", language) },
    { value: "attic", label: t("Attic", language) },
    { value: "hallway", label: t("Hallway", language) },
    { value: "entryway", label: t("Entryway", language) },
  ];

  const sizeOptions = [
    { value: "small", label: t("Small", language) },
    { value: "medium", label: t("Medium", language) },
    { value: "large", label: t("Large", language) },
  ];

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
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("Home Health Map", language)}
            </h2>
            <p className="text-gray-600">
              {t("Monitor your home's cleanliness", language)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="primary" className="flex items-center space-x-1">
              <Home className="w-4 h-4" />
              <span>
                {areas?.length || 0} {t("Areas", language)}
              </span>
            </Badge>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t("Add Area", language)}</span>
            </Button>
          </div>
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
              <p>{t("No areas configured", language)}</p>
              <p className="text-sm">
                {t("Add your home areas to start tracking!", language)}
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="mt-4 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t("Add Your First Area", language)}</span>
              </Button>
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

      {/* Add Area Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {t("Add New Area", language)}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Area Name", language)}
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Master Bedroom, Kitchen"
                  value={formData.area_name}
                  onChange={(e) =>
                    setFormData({ ...formData, area_name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Area Type", language)}
                </label>
                <Select
                  value={formData.area_type}
                  onChange={(e) =>
                    setFormData({ ...formData, area_type: e.target.value })
                  }
                >
                  {areaTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Size", language)}
                </label>
                <Select
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                >
                  {sizeOptions.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Flooring Types", language)}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_carpet}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          has_carpet: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {t("Carpet", language)}
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_hardwood}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          has_hardwood: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {t("Hardwood", language)}
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_tile}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          has_tile: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {t("Tile", language)}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => setShowAddModal(false)}
                variant="secondary"
                className="flex-1"
              >
                {t("Cancel", language)}
              </Button>
              <Button
                onClick={addArea}
                disabled={!formData.area_name.trim() || isAddingArea}
                className="flex-1"
              >
                {isAddingArea
                  ? t("Adding...", language)
                  : t("Add Area", language)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
