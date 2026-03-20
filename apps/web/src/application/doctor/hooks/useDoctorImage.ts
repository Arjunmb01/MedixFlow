import { useState, useCallback } from "react"
import { uploadImage } from "@/infrastructure/api/doctor.api"
import { toast } from "sonner"
import getCroppedImg from "@/modules/doctor/utils/cropImage"

export function useDoctorImage(onSuccess: (url: string) => void) {
    const [imageToCrop, setImageToCrop] = useState<string | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)
    const [uploading, setUploading] = useState(false)

    const onCropComplete = useCallback((_croppedArea: any, _croppedAreaPixels: any) => {
        setCroppedAreaPixels(_croppedAreaPixels)
    }, [])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setImageToCrop(reader.result as string)
                setIsCropModalOpen(true)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCropSave = async () => {
        if (!imageToCrop || !croppedAreaPixels) return

        try {
            setUploading(true)
            const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels)
            const file = new File([croppedImageBlob as Blob], "profile.jpg", { type: "image/jpeg" })
            
            const result = await uploadImage(file)
            onSuccess(result.url)
            toast.success("Image uploaded successfully")
            setIsCropModalOpen(false)
            setImageToCrop(null)
        } catch (error) {
            toast.error("Failed to upload image")
        } finally {
            setUploading(false)
        }
    }

    return {
        imageToCrop,
        setImageToCrop,
        crop,
        setCrop,
        zoom,
        setZoom,
        isCropModalOpen,
        setIsCropModalOpen,
        uploading,
        onCropComplete,
        handleImageSelect,
        handleCropSave
    }
}
