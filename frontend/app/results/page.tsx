import { Suspense } from 'react'
import { ResultsContent } from './results-content'

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResultsContent />
    </Suspense>
  )
}
