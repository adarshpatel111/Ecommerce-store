"use client";

import { Badge } from "@/components/ui/badge";
import type React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { getUserDevices, removeUserDevice } from "@/lib/firebase";
import { Laptop, Smartphone, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    emailNotifications: true,
    marketingEmails: false,
    activitySummary: true,
    securityAlerts: true,
    twoFactorAuth: false,
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: theme || "system",
    fontSize: "medium",
    reducedMotion: false,
    highContrast: false,
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    browser: true,
    email: true,
    sms: false,
    weeklyDigest: true,
    mentionNotifications: true,
  });

  // Business settings
  const [businessSettings, setBusinessSettings] = useState({
    businessName: userData?.businessName || "My Business",
    businessEmail: userData?.businessEmail || userData?.email || "",
    businessPhone: userData?.businessPhone || "",
    businessAddress: userData?.businessAddress || "",
    taxId: userData?.taxId || "",
    currency: userData?.currency || "INR",
  });

  // Fetch user devices
  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) return;

      setLoadingDevices(true);
      try {
        const result = await getUserDevices(user.uid);
        if (result.success) {
          setDevices(result.devices || []);

          // Get current device ID from localStorage
          const storedDeviceId = localStorage.getItem("deviceId");
          setCurrentDeviceId(storedDeviceId);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoadingDevices(false);
      }
    };

    fetchDevices();
  }, [user]);

  // Handle account settings change
  const handleAccountSettingChange = (key: string, value: boolean) => {
    setAccountSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Handle appearance settings change
  const handleAppearanceSettingChange = (key: string, value: any) => {
    setAppearanceSettings((prev) => ({ ...prev, [key]: value }));

    // Apply theme change immediately
    if (key === "theme") {
      setTheme(value);
    }
  };

  // Handle notification settings change
  const handleNotificationSettingChange = (key: string, value: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Handle business settings change
  const handleBusinessSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBusinessSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Handle business currency change
  const handleCurrencyChange = (value: string) => {
    setBusinessSettings((prev) => ({ ...prev, currency: value }));
  };

  // Handle device logout
  const handleDeviceLogout = async (deviceId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const result = await removeUserDevice(user.uid, deviceId);
      if (result.success) {
        setDevices(devices.filter((device) => device.deviceId !== deviceId));
        toast({
          title: "Device logged out",
          description: "The device has been logged out successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to log out device.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out device.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format last active time
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

  // Get device icon
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

  // Save account settings
  const saveAccountSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would save these settings to the database
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Settings saved",
        description: "Your account settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save appearance settings
  const saveAppearanceSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would save these settings to the database
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Settings saved",
        description: "Your appearance settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would save these settings to the database
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Settings saved",
        description: "Your notification settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save business settings
  const saveBusinessSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would save these settings to the database
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Settings saved",
        description: "Your business settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="emailNotifications"
                  className="flex flex-col space-y-1"
                >
                  <span>Email Notifications</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive emails about your account activity
                  </span>
                </Label>
                <Switch
                  id="emailNotifications"
                  checked={accountSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleAccountSettingChange("emailNotifications", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="marketingEmails"
                  className="flex flex-col space-y-1"
                >
                  <span>Marketing Emails</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive emails about new features and offers
                  </span>
                </Label>
                <Switch
                  id="marketingEmails"
                  checked={accountSettings.marketingEmails}
                  onCheckedChange={(checked) =>
                    handleAccountSettingChange("marketingEmails", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="activitySummary"
                  className="flex flex-col space-y-1"
                >
                  <span>Activity Summary</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive a weekly summary of your account activity
                  </span>
                </Label>
                <Switch
                  id="activitySummary"
                  checked={accountSettings.activitySummary}
                  onCheckedChange={(checked) =>
                    handleAccountSettingChange("activitySummary", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="securityAlerts"
                  className="flex flex-col space-y-1"
                >
                  <span>Security Alerts</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive alerts about suspicious activity
                  </span>
                </Label>
                <Switch
                  id="securityAlerts"
                  checked={accountSettings.securityAlerts}
                  onCheckedChange={(checked) =>
                    handleAccountSettingChange("securityAlerts", checked)
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveAccountSettings} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="twoFactorAuth"
                  className="flex flex-col space-y-1"
                >
                  <span>Two-Factor Authentication (2FA)</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Add an extra layer of security to your account
                  </span>
                </Label>
                <Switch
                  id="twoFactorAuth"
                  checked={accountSettings.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    handleAccountSettingChange("twoFactorAuth", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>Manage your connected devices</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDevices ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : devices.length > 0 ? (
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div
                      key={device.deviceId}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        {getDeviceIcon(device)}
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {device.name || "Unknown Device"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {device.os} • {device.browser.split(" ")[0]} •{" "}
                            {device.location || "Unknown Location"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last active: {formatLastActive(device.lastActive)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {device.deviceId === currentDeviceId && (
                          <Badge variant="outline" className="mr-2">
                            Current
                          </Badge>
                        )}
                        {device.deviceId !== currentDeviceId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeviceLogout(device.deviceId)}
                            disabled={isLoading}
                          >
                            {isLoading ? "Logging out..." : "Logout"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No devices connected.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={appearanceSettings.theme}
                  onValueChange={(value) =>
                    handleAppearanceSettingChange("theme", value)
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Select
                  value={appearanceSettings.fontSize}
                  onValueChange={(value) =>
                    handleAppearanceSettingChange("fontSize", value)
                  }
                >
                  <SelectTrigger id="fontSize">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="reducedMotion"
                  className="flex flex-col space-y-1"
                >
                  <span>Reduced Motion</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Reduce the amount of animation and motion effects
                  </span>
                </Label>
                <Switch
                  id="reducedMotion"
                  checked={appearanceSettings.reducedMotion}
                  onCheckedChange={(checked) =>
                    handleAppearanceSettingChange("reducedMotion", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="highContrast"
                  className="flex flex-col space-y-1"
                >
                  <span>High Contrast</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Increase the contrast between elements
                  </span>
                </Label>
                <Switch
                  id="highContrast"
                  checked={appearanceSettings.highContrast}
                  onCheckedChange={(checked) =>
                    handleAppearanceSettingChange("highContrast", checked)
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveAppearanceSettings} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="browser" className="flex flex-col space-y-1">
                  <span>Browser Notifications</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive notifications in your browser
                  </span>
                </Label>
                <Switch
                  id="browser"
                  checked={notificationSettings.browser}
                  onCheckedChange={(checked) =>
                    handleNotificationSettingChange("browser", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive notifications via email
                  </span>
                </Label>
                <Switch
                  id="email"
                  checked={notificationSettings.email}
                  onCheckedChange={(checked) =>
                    handleNotificationSettingChange("email", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="sms" className="flex flex-col space-y-1">
                  <span>SMS Notifications</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive notifications via SMS
                  </span>
                </Label>
                <Switch
                  id="sms"
                  checked={notificationSettings.sms}
                  onCheckedChange={(checked) =>
                    handleNotificationSettingChange("sms", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="weeklyDigest"
                  className="flex flex-col space-y-1"
                >
                  <span>Weekly Digest</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive a weekly summary of your activity
                  </span>
                </Label>
                <Switch
                  id="weeklyDigest"
                  checked={notificationSettings.weeklyDigest}
                  onCheckedChange={(checked) =>
                    handleNotificationSettingChange("weeklyDigest", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="mentionNotifications"
                  className="flex flex-col space-y-1"
                >
                  <span>Mention Notifications</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive notifications when you are mentioned
                  </span>
                </Label>
                <Switch
                  id="mentionNotifications"
                  checked={notificationSettings.mentionNotifications}
                  onCheckedChange={(checked) =>
                    handleNotificationSettingChange(
                      "mentionNotifications",
                      checked
                    )
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveNotificationSettings} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Manage your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={businessSettings.businessName}
                  onChange={handleBusinessSettingChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  value={businessSettings.businessEmail}
                  onChange={handleBusinessSettingChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  name="businessPhone"
                  value={businessSettings.businessPhone}
                  onChange={handleBusinessSettingChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  name="businessAddress"
                  value={businessSettings.businessAddress}
                  onChange={handleBusinessSettingChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / GST Number</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={businessSettings.taxId}
                  onChange={handleBusinessSettingChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={businessSettings.currency}
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveBusinessSettings} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
