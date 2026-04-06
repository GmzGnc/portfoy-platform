'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import IqviaTrPage from '@/components/modules/IqviaTrPage'
import IqviaGlobalPage from '@/components/modules/IqviaGlobalPage'
import CandidatesPage from '@/components/modules/CandidatesPage'
import CriteriaPage from '@/components/modules/CriteriaPage'
import TasksPage from '@/components/modules/TasksPage'
import TitckPage from '@/components/modules/TitckPage'
import AlertsPage from '@/components/modules/AlertsPage'
import SourcesPage from '@/components/modules/SourcesPage'
import UploadPage from '@/components/modules/UploadPage'

const PAGE_MAP: Record<string, React.ReactNode> = {
  'iqvia-tr': <IqviaTrPage />,
  'iqvia-global': <IqviaGlobalPage />,
  candidates: <CandidatesPage />,
  criteria: <CriteriaPage />,
  tasks: <TasksPage />,
  titck: <TitckPage />,
  alerts: <AlertsPage />,
  sources: <SourcesPage />,
}

export default function HomePage() {
  const [activePage, setActivePage] = useState('iqvia-tr')

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onPageChange={setActivePage} />
        <main className="flex-1 overflow-y-auto p-5">
          {activePage === 'upload'
            ? <UploadPage onSuccess={() => setActivePage('iqvia-tr')} />
            : PAGE_MAP[activePage] ?? (
              <div className="flex items-center justify-center h-full text-ink-tertiary">
                Sayfa bulunamadı: {activePage}
              </div>
            )
          }
        </main>
      </div>
    </div>
  )
}
