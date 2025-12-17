import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { User, Lock, Globe, Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function Settings() {
  const handleSave = () => {
    toast({ title: "Settings Saved", description: "Your settings have been updated successfully" });
  };

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
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue="Admin" />
                  </div>
                  {/* <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue="User" />
                  </div> */}
                {/* </div> */}
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" defaultValue="admin@everynation.edu" disabled/>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input defaultValue="+1 234 567 890" disabled/>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea placeholder="Tell us about yourself..." rows={4} />
                </div>
                <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
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
                  <Input type="password" placeholder="Enter current password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Login Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">
                  <Save className="w-4 h-4 mr-2" />
                  Update Security
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
                    <div className="p-4 border-2 border-accent rounded-lg cursor-pointer bg-background">
                      <div className="w-full h-20 bg-card rounded mb-2 border"></div>
                      <p className="text-sm font-medium text-center">Light</p>
                    </div>
                    <div className="p-4 border-2 border-border rounded-lg cursor-pointer bg-background hover:border-accent transition-colors">
                      <div className="w-full h-20 bg-slate-800 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Dark</p>
                    </div>
                    <div className="p-4 border-2 border-border rounded-lg cursor-pointer bg-background hover:border-accent transition-colors">
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
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Animations</p>
                    <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Appearance
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
