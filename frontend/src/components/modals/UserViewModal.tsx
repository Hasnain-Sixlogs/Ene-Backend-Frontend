import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface User {
  id?: number;
  _id?: string;
  sno?: number;
  name: string;
  email: string;
  phone?: string;
  mobileNumber?: string;
  location: string;
  city: string;
  avatar?: string;
  image?: string | null;
}

interface UserViewModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  onSave?: (userData: User) => void;
}

export function UserViewModal({ user, isOpen, onClose, mode, onSave }: UserViewModalProps) {
  const [formData, setFormData] = useState<User | null>(user);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update formData when user changes
  useEffect(() => {
    setFormData(user);
    setImagePreview(user?.image || user?.avatar || null);
    setSelectedImage(null);
  }, [user]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size should be less than 10MB",
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

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(user?.image || user?.avatar || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (formData && onSave) {
      // Pass both formData and selectedImage to onSave
      onSave({ ...formData, _imageFile: selectedImage } as any);
    } else {
      toast({
        title: "Success",
        description: `User ${formData?.name} has been updated successfully.`,
      });
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {mode === "view" ? "User Details" : "Edit User"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 border-4 border-muted">
              <AvatarImage src={imagePreview || undefined} />
              <AvatarFallback className="bg-muted text-muted-foreground text-3xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            {mode === "edit" && (
              <div className="flex flex-col items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="profile-image-upload"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {selectedImage ? "Change Image" : "Upload Image"}
                  </Button>
                  {selectedImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Max size: 10MB (JPG, PNG, etc.)
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Name</Label>
              {mode === "view" ? (
                <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg">{user.name}</p>
              ) : (
                <Input
                  value={formData?.name || ""}
                  onChange={(e) => setFormData(formData ? { ...formData, name: e.target.value } : null)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Email</Label>
              {mode === "view" ? (
                <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg">{user.email}</p>
              ) : (
                <Input
                  value={formData?.email || ""}
                  onChange={(e) => setFormData(formData ? { ...formData, email: e.target.value } : null)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Mobile Number</Label>
              {mode === "view" ? (
                <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg">{user.mobileNumber || user.phone || "N/A"}</p>
              ) : (
                <Input
                  value={formData?.mobileNumber || formData?.phone || ""}
                  onChange={(e) => setFormData(formData ? { ...formData, mobileNumber: e.target.value, phone: e.target.value } : null)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Location</Label>
              {mode === "view" ? (
                <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg">{user.location}</p>
              ) : (
                <Input
                  value={formData?.location || ""}
                  onChange={(e) => setFormData(formData ? { ...formData, location: e.target.value } : null)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">City</Label>
              {mode === "view" ? (
                <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg">{user.city}</p>
              ) : (
                <Input
                  value={formData?.city || ""}
                  onChange={(e) => setFormData(formData ? { ...formData, city: e.target.value } : null)}
                />
              )}
            </div>
          </div>

          {mode === "edit" && (
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
