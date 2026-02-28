import { FileX } from 'lucide-react'
export default function DevisNotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <FileX size={48} className="mx-auto text-zinc-600" />
        <h1 className="text-xl font-bold text-zinc-100">Devis introuvable</h1>
        <p className="text-sm text-zinc-500">Ce lien est invalide ou le devis a été supprimé.<br />Contactez votre diagnostiqueur pour obtenir un nouveau lien.</p>
      </div>
    </div>
  )
}
