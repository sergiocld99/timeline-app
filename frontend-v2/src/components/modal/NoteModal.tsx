import type { Travel } from "@/types/travel";
import type { AxiosErrorResponse } from "@/types/commons";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from 'sonner';
import { useTranslations } from "next-intl";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  travel: Travel | null
  isSaving: boolean
  setTravel: Dispatch<SetStateAction<Travel | null>>
  setIsSaving: Dispatch<SetStateAction<boolean>>
  onUpdate?: (id: string, updates: Partial<Travel>) => Promise<Travel>;
}

const NoteModal = ({travel, isSaving, setTravel, setIsSaving, onUpdate}: Props) => {
  const [noteValue, setNoteValue] = useState('')
  const [title, setTitle] = useState('')
  const t = useTranslations("Modal")

  const handleSaveNote = async () => {
    if (!travel || !onUpdate) return;

    try {
      setIsSaving(true);
      await onUpdate(travel._id, {
        notes: noteValue
      });
      toast.success(t("messageSuccess"), { style: { background: 'green' } });
      setTravel(null);
    } catch (error) {
      const axiosError = error as AxiosErrorResponse;
      toast.error(axiosError.response?.data?.message || t("messageError"), { style: { background: 'red' } });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (travel) {
      const result = travel.notes ? t("editNote") : t("addNote")
      setTitle(result)
      setNoteValue(travel.notes || '')
    }
  }, [travel, t])

  return (
    <Dialog open={!!travel} onOpenChange={(open) => !open && setTravel(null)}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="modal-note-textarea" className="text-gray-700 dark:text-gray-300">{t("content")}</Label>
            <Textarea
              id="modal-note-textarea"
              placeholder={t("notePlaceholder")}
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTravel(null)} disabled={isSaving}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSaveNote} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NoteModal