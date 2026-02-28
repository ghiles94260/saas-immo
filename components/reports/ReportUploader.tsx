'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, FileText, Loader2 } from 'lucide-react'

interface ReportUploaderProps {
  quoteId: string
  userId: string
  diagnosticCode?: string
  onUploaded?: () => void
}

export default function ReportUploader({ quoteId, userId, diagnosticCode, onUploaded }: ReportUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      setIsUploading(true)
      try {
        const ext = file.name.split('.').pop()
        const path = `${userId}/${quoteId}/${Date.now()}_${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('reports')
          .upload(path, file, { contentType: file.type, upsert: false })

        if (uploadError) {
          toast.error(`Erreur upload : ${uploadError.message}`)
          continue
        }

        await supabase.from('reports').insert({
          user_id: userId,
          quote_id: quoteId,
          diagnostic_code: diagnosticCode || null,
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          mime_type: file.type,
        })

        toast.success(`${file.name} uploadé`)
        onUploaded?.()
      } finally {
        setIsUploading(false)
      }
    }
  }, [quoteId, userId, diagnosticCode, supabase, onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    disabled: isUploading,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-600">Upload en cours...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {isDragActive ? (
            <FileText className="h-8 w-8 text-blue-500" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
          <p className="text-sm font-medium text-gray-700">
            {isDragActive ? 'Déposez ici' : 'Glissez vos rapports PDF ici'}
          </p>
          <p className="text-xs text-gray-500">ou cliquez pour parcourir · PDF uniquement</p>
        </div>
      )}
    </div>
  )
}
