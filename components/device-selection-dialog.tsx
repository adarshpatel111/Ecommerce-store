"use client";

import { useState } from "react";
import { Laptop, Smartphone, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { removeUserDevice, addUserDevice } from "@/lib/firebase";

interface DeviceSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devices: any[];
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeviceSelectionDialog({
  open,
  onOpenChange,
  devices,
  userId,
  onSuccess,
  onCancel,
}: DeviceSelectionDialogProps) {
  const { toast } = useToast();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId);
  };

  const handleContinue = async () => {
    if (!selectedDevice) {
      toast({
        variant: "destructive",
        title: "No device selected",
        description: "Please select a device to log out.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Remove the selected device
      await removeUserDevice(userId, selectedDevice);

      // Register current device
      const deviceInfo = {
        browser: navigator.userAgent,
        os: navigator.platform,
        location: "Unknown",
        name: `${navigator.platform} - ${
          navigator.userAgent.split(")")[0].split("(")[1]
        }`,
      };

      await addUserDevice(userId, deviceInfo);

      toast({
        title: "Device logged out",
        description: "You have been logged in on this device.",
      });

      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out device. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const getDeviceIcon = (device: any) => {
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(
      device.browser.toLowerCase()
    );
    return isMobile ? (
      <Smartphone className="h-8 w-8" />
    ) : (
      <Laptop className="h-8 w-8" />
    );
  };

  const formatLastActive = (timestamp: any) => {
    if (!timestamp) return "Unknown";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Device Limit Reached</DialogTitle>
          <DialogDescription>
            You have reached the maximum number of devices (2). Please select a
            device to log out.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.deviceId}
                className={`flex items-center gap-4 p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedDevice === device.deviceId
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleDeviceSelect(device.deviceId)}
              >
                <div className="text-muted-foreground">
                  {getDeviceIcon(device)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{device.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Last active: {formatLastActive(device.lastActive)}
                  </p>
                </div>
                {selectedDevice === device.deviceId && (
                  <div className="text-primary">
                    <X className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedDevice || isLoading}
          >
            {isLoading ? "Processing..." : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
