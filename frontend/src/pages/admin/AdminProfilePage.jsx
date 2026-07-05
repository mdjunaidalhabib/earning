import { useState } from "react";
import { Loader2, Save, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { userService } from "@/api/userService";
import axiosInstance from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

export default function AdminProfilePage() {
  const { user, refreshUser, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await userService.updateProfile(profileForm);
      await refreshUser();
      toast.success("প্রোফাইল সফলভাবে আপডেট হয়েছে");
    } catch (err) {
      toast.error(err.response?.data?.message || "প্রোফাইল আপডেট করা যায়নি");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = "বর্তমান পাসওয়ার্ড আবশ্যক";
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      errors.newPassword = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "পাসওয়ার্ড দুটি মিলছে না";
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsChangingPassword(true);
    try {
      await axiosInstance.patch("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("পাসওয়ার্ড পরিবর্তন হয়েছে। আবার লগ ইন করুন।");
      await logout();
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.response?.data?.message || "পাসওয়ার্ড পরিবর্তন করা যায়নি");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          অ্যাডমিন প্রোফাইল
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">তোমার অ্যাডমিন অ্যাকাউন্টের তথ্য পরিচালনা করো।</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-5 flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarFallback className="text-lg">{initials(user?.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">অ্যাডমিনিস্ট্রেটর</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">পুরো নাম</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">ফোন নম্বর</Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <Button type="submit" variant="brass" disabled={isSavingProfile} className="mt-1 self-start">
              {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              পরিবর্তন সংরক্ষণ করুন
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>পাসওয়ার্ড পরিবর্তন করুন</CardTitle>
          <CardDescription>পাসওয়ার্ড পরিবর্তনের পর তোমাকে লগ আউট করে দেওয়া হবে।</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">বর্তমান পাসওয়ার্ড</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-rust">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-rust">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-rust">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            <Button type="submit" variant="outline" disabled={isChangingPassword} className="mt-1 self-start">
              {isChangingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              পাসওয়ার্ড পরিবর্তন করুন
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
