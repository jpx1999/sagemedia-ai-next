'use client'

import { Suspense, use } from 'react'
import NewsIntelligence from '@/components/NewsIntelligence'
import Loading from '@/components/newsloader/Loader'

export default function NewsDetailPage({ params }) {
  const { newsId } = use(params)
  
  return (
    <Suspense fallback={<Loading />}>
      <NewsIntelligence newsIdParam={newsId} />
    </Suspense>
  )
} 