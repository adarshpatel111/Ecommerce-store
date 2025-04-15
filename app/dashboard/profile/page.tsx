"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Eye, EyeOff, Edit, Save, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updatePassword } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, userData, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate age if DOB is available
  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const [profileData, setProfileData] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    dob: userData?.dob || "",
    address: userData?.address || "",
    profilePicture: userData?.profilePicture || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If we're currently editing and clicking the button, save changes
      handleProfileUpdate();
    } else {
      // Otherwise, enable editing
      setIsEditing(true);
    }
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      // Update user profile in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        dob: profileData.dob,
        address: profileData.address,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      // Disable editing mode
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update profile.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Update password in Firebase Auth
      await updatePassword(user, passwordData.newPassword);

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // In a real app, you would upload the file to storage
    // For now, we'll just simulate it
    setIsLoading(true);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update profile data with new image URL
      // In a real app, this would be the URL from your storage
      const imageUrl = URL.createObjectURL(file);
      setProfileData((prev) => ({ ...prev, profilePicture: imageUrl }));

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update profile picture.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Card */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  View and update your account information
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleEditToggle}>
                {isEditing ? (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar
                  className="h-24 w-24 cursor-pointer"
                  onClick={handleProfilePictureClick}
                >
                  <AvatarImage
                    src={
                      profileData.profilePicture ||
                      "/placeholder.svg?height=96&width=96"
                    }
                  />
                  <AvatarFallback className="text-2xl">
                    {profileData.firstName?.charAt(0) || ""}
                    {profileData.lastName?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute bottom-0 right-0 rounded-full bg-primary p-1 text-primary-foreground">
                    <Upload className="h-4 w-4" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-medium">
                  Hello, {profileData.firstName} {profileData.lastName}!
                </h3>
                <p className="text-sm text-muted-foreground">
                  {profileData.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className={!isEditing ? "opacity-70" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className={!isEditing ? "opacity-70" : ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={isAdmin ? handleProfileChange : undefined}
                disabled={!isAdmin}
                className="opacity-70"
              />
              {!isAdmin && (
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={handleProfileChange}
                disabled={!isEditing}
                className={!isEditing ? "opacity-70" : ""}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={profileData.dob}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className={!isEditing ? "opacity-70" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  value={
                    profileData.dob
                      ? `${calculateAge(profileData.dob)} years`
                      : "Not specified"
                  }
                  disabled
                  className="opacity-70"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profileData.address}
                onChange={handleProfileChange}
                disabled={!isEditing}
                className={!isEditing ? "opacity-70" : ""}
              />
            </div>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="w-full md:w-96">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Update your password and security settings
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordUpdate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showCurrentPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showNewPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Changing..." : "Change password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
