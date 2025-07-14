'use client'

import { Suspense } from 'react'
import NewsIntelligence from '@/components/NewsIntelligence'
import Loading from '@/components/newsloader/Loader'

export default function NewsIntelligencePage() {
  return (
    <Suspense fallback={<Loading />}>
      <NewsIntelligence />
    </Suspense>
  )
} 