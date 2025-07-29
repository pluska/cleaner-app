"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/libs/supabase";
import { Bug, User, AlertTriangle, CheckCircle } from "lucide-react";

export function AuthDebugger() {
  const [isVisible, setIsVisible] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [apiTests, setApiTests] = useState<any[]>([]);
  const supabase = createClient();

  const checkAuthStatus = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      setAuthStatus({ user, error });
    } catch (error) {
      setAuthStatus({ user: null, error });
    }
  };

  const testAPIEndpoints = async () => {
    const endpoints = [
      { name: "Profile", url: "/api/user/profile" },
      { name: "Tools", url: "/api/user/tools" },
      { name: "Areas", url: "/api/user/areas" },
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        const response = await fetch(endpoint.url, { headers });
        const data = await response.json();
        results.push({
          name: endpoint.name,
          status: response.status,
          success: response.ok,
          data: data,
          error: response.ok ? null : data.error,
        });
      } catch (error) {
        results.push({
          name: endpoint.name,
          status: 0,
          success: false,
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    setApiTests(results);
  };

  useEffect(() => {
    if (isVisible) {
      checkAuthStatus();
      testAPIEndpoints();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-sm"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug Auth
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Authentication Debugger</h2>
            <Button onClick={() => setIsVisible(false)} variant="outline">
              Close
            </Button>
          </div>

          {/* Auth Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Auth Status
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(authStatus, null, 2)}
              </pre>
            </div>
          </div>

          {/* API Tests */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              API Endpoint Tests
            </h3>
            <div className="space-y-2">
              {apiTests.map((test, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    test.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{test.name}</span>
                    <Badge
                      variant={test.success ? "primary" : "error"}
                      className="flex items-center"
                    >
                      {test.success ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {test.status}
                    </Badge>
                  </div>
                  {test.error && (
                    <p className="text-sm text-red-600 mt-1">{test.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                checkAuthStatus();
                testAPIEndpoints();
              }}
              variant="outline"
            >
              Refresh Debug Info
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
