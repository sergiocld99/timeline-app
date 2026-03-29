"use client";

import type { AxiosErrorResponse } from "@/types/commons";

import { useState } from "react";
import { toast } from "sonner";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import UserService from "@/services/UserService";

export default function ProfilePage() {
  const { users, refreshUsers, loading } = useUser();
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [newUser, setNewUser] = useState<{ userId: number; name: string } | null>(null);
  const [guestDataInfo, setGuestDataInfo] = useState<{ travelCount: number; visitCount: number } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // useEffect(() => {
  //   refreshUsers();
  // }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !name) {
      toast.error("User ID and name are required");
      return;
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      toast.error("User ID must be a number");
      return;
    }

    setIsSubmitting(true);

    UserService.create(userIdNum, name).then(async (u) => {
      toast.success(`User ${u.name} created successfully`);
      setUserId("");
      setName("");

      // Check if this is the first user and if there's guest data
      const wasFirstUser = users.length === 0;
      if (wasFirstUser) {
        try {
          const guestData = await UserService.checkGuestData();
          if (guestData.hasGuestData) {
            setNewUser({ userId: u.userId, name: u.name });
            setGuestDataInfo({ travelCount: guestData.travelCount, visitCount: guestData.visitCount });
            setShowMigrationDialog(true);
          } else {
            await refreshUsers();
          }
        } catch (error) {
          console.error("Error checking guest data:", error);
          await refreshUsers();
        }
      } else {
        await refreshUsers();
      }
    }).catch(() => {
      toast.error("Error creating user");
    }).finally(() => {
      setIsSubmitting(false);
    });
  };

  const handleMigrate = async () => {
    if (!newUser) return;

    setIsMigrating(true);
    try {
      const result = await UserService.migrateGuestData(newUser.userId);
      toast.success(
        `Migration complete! ${result.travelsMigrated} travels and ${result.visitsMigrated} visits migrated to ${newUser.name}.`
      );
      setShowMigrationDialog(false);
      setNewUser(null);
      setGuestDataInfo(null);
      await refreshUsers();
    } catch (error) {
      toast.error("Error migrating data. Please try again.");
      console.error("Migration error:", error);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSkipMigration = async () => {
    setShowMigrationDialog(false);
    setNewUser(null);
    setGuestDataInfo(null);
    await refreshUsers();
  };

  const handleEdit = (user: { userId: number; name: string }) => {
    setEditingUserId(user.userId);
    setEditName(user.name);
  };

  const handleUpdate = async (userIdNum: number) => {
    if (!editName) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);

    UserService.update(userIdNum, editName).then(u => {
      toast.success(`User ${u.name} edited successfully`)
      setEditingUserId(null)
      setEditName("")
      void refreshUsers()
    }).catch(() => {
      toast.error("Error updating user")
    }).finally(() => {
      setIsSubmitting(false)
    })
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditName("");
  };

  const handleDelete = async (userIdNum: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setIsSubmitting(true);
      try {
        await UserService.delete(userIdNum);
        toast.success("User deleted successfully");
        await refreshUsers();
      } catch (e: unknown) {
        const axiosError = e as AxiosErrorResponse
        const errorMsg = axiosError.response?.data?.message || "Error deleting user";
        toast.error(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          User Management
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>
              Add a new user with a unique numeric ID and name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g., 2"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Users</CardTitle>
            <CardDescription>
              Manage existing users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">No users found. Create one above.</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    {editingUserId === user.userId ? (
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <Label>Name</Label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(user.userId)}
                            disabled={isSubmitting}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="font-medium">
                            #{user.userId} - {user.name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                            disabled={isSubmitting}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(user.userId)}
                            disabled={isSubmitting}
                          >
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Migrate Guest Data?</DialogTitle>
              <DialogDescription>
                We found {guestDataInfo?.travelCount || 0} travels and {guestDataInfo?.visitCount || 0} visits
                that don&apos;t have a user assigned (guest mode data).
                <br /><br />
                Would you like to migrate all this data to <strong>{newUser?.name}</strong> (ID: {newUser?.userId})?
                <br /><br />
                This action cannot be undone, but you can always reassign data later if needed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleSkipMigration}
                disabled={isMigrating}
              >
                Skip
              </Button>
              <Button
                onClick={handleMigrate}
                disabled={isMigrating}
              >
                {isMigrating ? "Migrating..." : "Yes, Migrate Data"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

