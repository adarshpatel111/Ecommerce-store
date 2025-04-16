"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { removeUserDevice } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Laptop, Smartphone, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function DeviceSelectionDialog({
  open,
  onOpenChange,
  devices,
  userId,
  onSuccess,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devices: any[];
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const handleRemoveDevice = async () => {
    if (!selectedDeviceId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a device to remove.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await removeUserDevice(userId, selectedDeviceId);
      if (result.success) {
        toast({
          title: "Device removed",
          description: "You can now log in with your current device.",
        });
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to remove device.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove device.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (device: any) => {
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(
      device.browser.toLowerCase()
    );
    return isMobile ? (
      <Smartphone className="h-5 w-5" />
    ) : (
      <Laptop className="h-5 w-5" />
    );
  };

  const formatLastActive = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    try {
      // Convert Firebase timestamp to JS Date
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Device Limit Reached</DialogTitle>
          <DialogDescription>
            You have reached the maximum number of devices (2). Please remove
            one of your existing devices to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.deviceId}
                className={`flex items-center justify-between p-3 rounded-md border ${
                  selectedDeviceId === device.deviceId
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
                onClick={() => setSelectedDeviceId(device.deviceId)}
              >
                <div className="flex items-center space-x-3">
                  {getDeviceIcon(device)}
                  <div>
                    <p className="font-medium">
                      {device.name || "Unknown Device"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Last active: {formatLastActive(device.lastActive)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDeviceId(device.deviceId);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleRemoveDevice}
            disabled={!selectedDeviceId || isLoading}
          >
            {isLoading ? "Removing..." : "Remove Selected Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
