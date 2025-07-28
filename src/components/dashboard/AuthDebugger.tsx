"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/libs/supabase";
import { Bug, User, Shield, AlertTriangle, CheckCircle } from "lucide-react";

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
        const response = await fetch(endpoint.url);
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
          className="flex items-center space-x-2"
        >
          <Bug className="w-4 h-4" />
          <span>Debug Auth</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="p-4 w-96 shadow-lg max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Auth Debugger</h3>
          <Button
            onClick={() => setIsVisible(false)}
            variant="outline"
            size="sm"
          >
            ×
          </Button>
        </div>

        <div className="space-y-4">
          {/* Auth Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-1" />
              Authentication Status
            </h4>
            <div className="space-y-2">
              {authStatus ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User:</span>
                    <Badge
                      variant={authStatus.user ? "success" : "error"}
                      size="sm"
                    >
                      {authStatus.user ? "Authenticated" : "Not Authenticated"}
                    </Badge>
                  </div>
                  {authStatus.user && (
                    <div className="text-xs text-gray-600">
                      <div>ID: {authStatus.user.id}</div>
                      <div>Email: {authStatus.user.email}</div>
                    </div>
                  )}
                  {authStatus.error && (
                    <div className="text-xs text-red-600">
                      Error: {authStatus.error.message}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500">Loading...</div>
              )}
            </div>
          </div>

          {/* API Tests */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              API Endpoint Tests
            </h4>
            <div className="space-y-2">
              {apiTests.length > 0 ? (
                apiTests.map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{test.name}:</span>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={test.success ? "success" : "error"}
                        size="sm"
                      >
                        {test.status}
                      </Badge>
                      {test.success ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No tests run yet</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t">
            <div className="flex space-x-2">
              <Button
                onClick={checkAuthStatus}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Refresh Auth
              </Button>
              <Button
                onClick={testAPIEndpoints}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Test APIs
              </Button>
            </div>
          </div>

          {/* Debug Info */}
          <div className="pt-2 border-t">
            <div className="text-xs text-gray-500">
              <div>Environment: {process.env.NODE_ENV}</div>
              <div>Base URL: {window.location.origin}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
