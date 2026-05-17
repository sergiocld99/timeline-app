"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !name) {
      toast.error(t("messages.userIdNameRequired"));
      return;
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      toast.error(t("messages.userIdNumber"));
      return;
    }

    setIsSubmitting(true);

    UserService.create(userIdNum, name).then(async (u) => {
      toast.success(t("messages.createSuccess", { name: u.name }));
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
      toast.error(t("messages.createError"));
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
        t("messages.migrationSuccess", { travels: result.travelsMigrated, visits: result.visitsMigrated, name: newUser.name })
      );
      setShowMigrationDialog(false);
      setNewUser(null);
      setGuestDataInfo(null);
      await refreshUsers();
    } catch (error) {
      toast.error(t("messages.migrationError"));
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
      toast.error(t("messages.nameRequired"));
      return;
    }

    setIsSubmitting(true);

    UserService.update(userIdNum, editName).then(u => {
      toast.success(t("messages.updateSuccess", { name: u.name }));
      setEditingUserId(null)
      setEditName("")
      void refreshUsers()
    }).catch(() => {
      toast.error(t("messages.updateError"))
    }).finally(() => {
      setIsSubmitting(false)
    })
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditName("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">{tCommon("loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          {t("title")}
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("createNewUser")}</CardTitle>
            <CardDescription>
              {t("createUserDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label htmlFor="userId">{t("userId")}</Label>
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
                  <Label htmlFor="name">{t("name")}</Label>
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
                {isSubmitting ? t("creating") : t("createUser")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("existingUsers")}</CardTitle>
            <CardDescription>
              {t("existingUsersDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">{t("noUsers")}</p>
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
                          <Label>{t("name")}</Label>
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
                            {t("save")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                          >
                            {t("cancel")}
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
                            {t("edit")}
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
              <DialogTitle>{t("migrationTitle")}</DialogTitle>
              <DialogDescription>
                {t.rich("migrationDescription", {
                  travelCount: guestDataInfo?.travelCount || 0,
                  visitCount: guestDataInfo?.visitCount || 0,
                  name: newUser?.name || "",
                  userId: newUser?.userId || 0,
                  strong: (chunks) => <strong>{chunks}</strong>,
                  br: () => <br />
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleSkipMigration}
                disabled={isMigrating}
              >
                {t("skip")}
              </Button>
              <Button
                onClick={handleMigrate}
                disabled={isMigrating}
              >
                {isMigrating ? t("migrating") : t("migrateData")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

