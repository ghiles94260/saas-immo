'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Trash2, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Report {
  id: string
  file_name: string
  file_path: string
  file_size: number | null
  diagnostic_code: string | null
  uploaded_at: string
}

interface ReportListProps {
  quoteId: string
  userId: string
  refresh?: number
}

export default function ReportList({ quoteId, userId, refresh }: ReportListProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('reports')
        .select('*')
        .eq('quote_id', quoteId)
        .order('uploaded_at', { ascending: false })
      setReports(data || [])
      setLoading(false)
    }
    load()
  }, [quoteId, refresh])

  async function handleDownload(report: Report) {
    const { data } = await supabase.storage.from('reports').createSignedUrl(report.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function handleDelete(report: Report) {
    await supabase.storage.from('reports').remove([report.file_path])
    await supabase.from('reports').delete().eq('id', report.id)
    setReports((prev) => prev.filter((r) => r.id !== report.id))
    toast.success('Rapport supprimé')
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return ''
    return bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} Ko`
      : `${(bytes / 1024 / 1024).toFixed(1)} Mo`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">Aucun rapport uploadé</p>
    )
  }

  return (
    <ul className="space-y-2">
      {reports.map((report) => (
        <li key={report.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">{report.file_name}</p>
              <p className="text-xs text-gray-500">
                {report.diagnostic_code && `${report.diagnostic_code} · `}
                {formatSize(report.file_size)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload(report)}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="Télécharger"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(report)}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
