import { useState, useEffect } from "react";
import { UserTool } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Wrench, Zap, AlertTriangle, CheckCircle } from "lucide-react";

interface ToolInventoryProps {
  tools?: UserTool[];
  onToolUpdate?: (tools: UserTool[]) => void;
}

export function ToolInventory({ tools, onToolUpdate }: ToolInventoryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableTools, setAvailableTools] = useState<any[]>([]);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/tools");
      if (response.ok) {
        const { tools: fetchedTools } = await response.json();
        onToolUpdate?.(fetchedTools);
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableTools = async () => {
    try {
      const toolsData = await import("@/data/templates/cleaning-tools.json");
      setAvailableTools(toolsData.tools);
    } catch (error) {
      console.error("Error loading tool definitions:", error);
    }
  };

  useEffect(() => {
    if (!tools) {
      fetchTools();
    }
    fetchAvailableTools();
  }, [tools]);

  const addToolToInventory = async (toolId: string, toolName: string) => {
    try {
      const response = await fetch("/api/user/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tool_id: toolId, tool_name: toolName }),
      });

      if (response.ok) {
        fetchTools(); // Refresh tools
      } else {
        const error = await response.json();
        console.error("Error adding tool:", error);
      }
    } catch (error) {
      console.error("Error adding tool:", error);
    }
  };

  const getToolDefinition = (toolId: string) => {
    return availableTools.find((tool) => tool.id === toolId);
  };

  const getDurabilityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 70) return "bg-green-500";
    if (percentage > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getDurabilityStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 70)
      return { icon: CheckCircle, color: "text-green-600", text: "Good" };
    if (percentage > 30)
      return { icon: AlertTriangle, color: "text-yellow-600", text: "Worn" };
    return { icon: AlertTriangle, color: "text-red-600", text: "Critical" };
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Tool Inventory</h2>
          <p className="text-gray-600">Manage your cleaning equipment</p>
        </div>
        <Badge variant="primary" className="flex items-center space-x-1">
          <Wrench className="w-4 h-4" />
          <span>{tools?.length || 0} Tools</span>
        </Badge>
      </div>

      {/* User Tools */}
      <div className="space-y-4 mb-6">
        {tools && tools.length > 0 ? (
          tools.map((tool) => {
            const toolDef = getToolDefinition(tool.tool_id);
            const durabilityStatus = getDurabilityStatus(
              tool.current_durability,
              tool.max_durability
            );
            const StatusIcon = durabilityStatus.icon;

            return (
              <div
                key={tool.id}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {tool.tool_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Uses: {tool.uses_count} • Acquired:{" "}
                        {new Date(tool.acquired_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon
                      className={`w-5 h-5 ${durabilityStatus.color}`}
                    />
                    <span
                      className={`text-sm font-medium ${durabilityStatus.color}`}
                    >
                      {durabilityStatus.text}
                    </span>
                  </div>
                </div>

                {/* Durability Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Durability</span>
                    <span className="text-xs text-gray-600">
                      {tool.current_durability} / {tool.max_durability}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getDurabilityColor(
                        tool.current_durability,
                        tool.max_durability
                      )} h-2 rounded-full transition-all duration-300`}
                      style={{
                        width: `${
                          (tool.current_durability / tool.max_durability) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Tool Stats */}
                {toolDef && (
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>Clean: {toolDef.stats?.cleaning_power || "N/A"}</div>
                    <div>Speed: {toolDef.stats?.speed || "N/A"}</div>
                    <div>Cost: {toolDef.maintenance_cost || "N/A"}</div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No tools in inventory</p>
            <p className="text-sm">Add some tools to get started!</p>
          </div>
        )}
      </div>

      {/* Available Tools to Add */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Available Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableTools
            .filter(
              (tool) => !tools?.some((userTool) => userTool.tool_id === tool.id)
            )
            .slice(0, 6)
            .map((tool) => (
              <div
                key={tool.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{tool.name_en}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {tool.rarity}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {tool.description_en}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addToolToInventory(tool.id, tool.name_en)}
                  className="w-full"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Add to Inventory
                </Button>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}
