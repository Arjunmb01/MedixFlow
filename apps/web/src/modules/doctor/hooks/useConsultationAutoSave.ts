import { useEffect, useRef, useState, useCallback } from "react";
import { saveConsultationDraft } from "@/infrastructure/api/consultation.api";
import { debounce } from "lodash";

export const useConsultationAutoSave = (consultationId: string | undefined, formData: any, skip: boolean = false) => {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const isFirstRender = useRef(true);

    const debouncedSave = useRef(
        debounce(async (id: string, data: any) => {
            setIsSaving(true);
            try {
                await saveConsultationDraft(id, data);
                setLastSaved(new Date());
                setError(null);
            } catch (err) {
                console.error("Auto-save failed", err);
                setError("Auto-save failed. Check your connection.");
            } finally {
                setIsSaving(false);
            }
        }, 3000)
    ).current;

    useEffect(() => {
        if (!consultationId || skip) return;

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        debouncedSave(consultationId, formData);
        
        return () => {
            debouncedSave.cancel();
        };
    }, [formData, consultationId, debouncedSave]);

    const manualSave = useCallback(async () => {
        if (!consultationId) return;
        setIsSaving(true);
        try {
            await saveConsultationDraft(consultationId, formData);
            setLastSaved(new Date());
            setError(null);
            return true;
        } catch (err) {
            setError("Failed to save draft.");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [consultationId, formData]);

    return { isSaving, lastSaved, error, manualSave };
};
