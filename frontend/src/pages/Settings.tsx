import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { User, Lock, Globe, Palette, Save, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { 
  getSettings, 
  updateProfile, 
  updateSecurity, 
  updateAppearance 
} from "@/services/settingsApi";
import type { UserSettings } from "@/services/settingsApi";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user: authUser, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Appearance state
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      if (response.success && response.data) {
        const data = response.data;
        setSettings(data);
        
        // Set profile fields
        setName(data.name || "");
        setBio(data.bio || "");
        
        // Set security fields
        setTwoFactorAuth(data.two_factor_auth || false);
        setLoginAlerts(data.login_alerts !== undefined ? data.login_alerts : true);
        
        // Set appearance fields (theme is managed by ThemeContext)
        if (data.theme) {
          setTheme(data.theme as "light" | "dark" | "system");
        }
        setCompactMode(data.compact_mode || false);
        setAnimations(data.animations !== undefined ? data.animations : true);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await updateProfile({ 
        name, 
        bio,
        profileImage: selectedImage || undefined
      });
      if (response.success) {
        setSettings(response.data);
        // Clear image selection
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Refresh auth hook to update user data
        await refreshUserData();
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setSaving(true);
      
      // Validate password fields if new password is provided
      if (newPassword) {
        if (!currentPassword) {
          toast({
            title: "Error",
            description: "Please enter your current password",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          toast({
            title: "Error",
            description: "New password must be at least 6 characters long",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          toast({
            title: "Error",
            description: "New password and confirm password do not match",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      const response = await updateSecurity({
        ...(newPassword && { currentPassword, newPassword, confirmPassword }),
        two_factor_auth: twoFactorAuth,
        login_alerts: loginAlerts,
      });
      
      if (response.success) {
        setSettings(response.data);
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast({
          title: "Security Updated",
          description: "Your security settings have been updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating security:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update security settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    try {
      setSaving(true);
      const response = await updateAppearance({
        theme,
        compact_mode: compactMode,
        animations,
      });
      if (response.success) {
        setSettings(response.data);
        toast({
          title: "Appearance Updated",
          description: "Your appearance settings have been updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating appearance:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update appearance settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    await setTheme(newTheme);
    // Also update other appearance settings if needed
    if (compactMode !== (settings?.compact_mode || false) || animations !== (settings?.animations !== undefined ? settings.animations : true)) {
      await handleSaveAppearance();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
            {/* <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              General
            </TabsTrigger> */}
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Profile Information</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    value={settings?.email || ""} 
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    value={
                      settings?.country_code && settings?.mobile 
                        ? `${settings.country_code} ${settings.mobile}` 
                        : settings?.mobile || ""
                    } 
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..." 
                    rows={4} 
                  />
                </div>
                <Button 
                  onClick={handleSaveProfile} 
                  className="bg-accent hover:bg-accent/90"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password" 
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch 
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Login Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                  </div>
                  <Switch 
                    checked={loginAlerts}
                    onCheckedChange={setLoginAlerts}
                  />
                </div>
                <Button 
                  onClick={handleSaveSecurity} 
                  className="bg-accent hover:bg-accent/90"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Security
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* General Tab */}
          {/* <TabsContent value="general">
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">General Settings</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="utc">UTC (Coordinated Universal Time)</option>
                    <option value="est">EST (Eastern Standard Time)</option>
                    <option value="pst">PST (Pacific Standard Time)</option>
                    <option value="gmt">GMT (Greenwich Mean Time)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="mdy">MM/DD/YYYY</option>
                    <option value="dmy">DD/MM/YYYY</option>
                    <option value="ymd">YYYY-MM-DD</option>
                  </select>
                </div>
                <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </TabsContent> */}

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Appearance Settings</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer bg-background transition-colors ${
                        theme === "light" ? "border-accent" : "border-border hover:border-accent"
                      }`}
                      onClick={() => handleThemeChange("light")}
                    >
                      <div className="w-full h-20 bg-card rounded mb-2 border"></div>
                      <p className="text-sm font-medium text-center">Light</p>
                    </div>
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer bg-background transition-colors ${
                        theme === "dark" ? "border-accent" : "border-border hover:border-accent"
                      }`}
                      onClick={() => handleThemeChange("dark")}
                    >
                      <div className="w-full h-20 bg-slate-800 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Dark</p>
                    </div>
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer bg-background transition-colors ${
                        theme === "system" ? "border-accent" : "border-border hover:border-accent"
                      }`}
                      onClick={() => handleThemeChange("system")}
                    >
                      <div className="w-full h-20 bg-gradient-to-b from-card to-slate-800 rounded mb-2 border"></div>
                      <p className="text-sm font-medium text-center">System</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">Reduce spacing for more content density</p>
                  </div>
                  <Switch 
                    checked={compactMode}
                    onCheckedChange={setCompactMode}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Animations</p>
                    <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                  </div>
                  <Switch 
                    checked={animations}
                    onCheckedChange={setAnimations}
                  />
                </div>
                <Button 
                  onClick={handleSaveAppearance} 
                  className="bg-accent hover:bg-accent/90"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Appearance
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
