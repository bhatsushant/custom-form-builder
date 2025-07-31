import { useState, useEffect, useCallback } from "react";

interface RealTimeData {
  type: "response" | "analytics_update";
  data: any;
  timestamp: string;
}

export function useRealTimeUpdates(formSlug: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  const simulateRealTimeUpdate = useCallback(() => {
    // Simulate real-time updates with mock data
    const updateTypes = ["response", "analytics_update"];
    const randomType =
      updateTypes[Math.floor(Math.random() * updateTypes.length)];

    const update: RealTimeData = {
      type: randomType as "response" | "analytics_update",
      data: {
        formSlug,
        message: `Simulated ${randomType} update`,
        responseId: Date.now()
      },
      timestamp: new Date().toISOString()
    };

    setLastUpdate(new Date());
    setUpdateCount(prev => prev + 1);

    // Trigger custom event for components to listen to
    window.dispatchEvent(new CustomEvent("formUpdate", { detail: update }));
  }, [formSlug]);

  useEffect(() => {
    if (!formSlug) return;

    // Simulate connection
    setIsConnected(true);

    // Simulate periodic updates (every 3-8 seconds)
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        // 60% chance of update
        simulateRealTimeUpdate();
      }
    }, Math.random() * 5000 + 3000); // 3-8 seconds

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [formSlug, simulateRealTimeUpdate]);

  return {
    isConnected,
    lastUpdate,
    updateCount,
    triggerUpdate: simulateRealTimeUpdate
  };
}
