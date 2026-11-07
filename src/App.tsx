import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { NoEncontrado } from './components/AccesoDenegado'
import { Layout } from './components/Layout'
import { RequireRole } from './components/RequireRole'
import { AppProvider } from './context/AppContext'
import { Ajustes } from './pages/Ajustes'
import { BacheDetalle } from './pages/BacheDetalle'
import { Baches } from './pages/Baches'
import { Danos } from './pages/Danos'
import { Inicio } from './pages/Inicio'
import { Ordenes } from './pages/Ordenes'
import { ReportarBache } from './pages/ReportarBache'

const Panel = lazy(() =>
  import('./pages/Panel').then((modulo) => ({ default: modulo.Panel })),
)

function CargandoPanel() {
  return (
    <div className="card flex items-center justify-center px-6 py-16 text-sm text-slate-500">
      Cargando panel…
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route
              path="reportar"
              element={
                <RequireRole roles={['ciudadano', 'personal']}>
                  <ReportarBache />
                </RequireRole>
              }
            />
            <Route path="baches" element={<Baches />} />
            <Route path="baches/:id" element={<BacheDetalle />} />
            <Route
              path="ordenes"
              element={
                <RequireRole roles={['personal', 'equipo', 'supervisor']}>
                  <Ordenes />
                </RequireRole>
              }
            />
            <Route
              path="danos"
              element={
                <RequireRole roles={['ciudadano', 'personal', 'supervisor']}>
                  <Danos />
                </RequireRole>
              }
            />
            <Route
              path="panel"
              element={
                <RequireRole roles={['supervisor']}>
                  <Suspense fallback={<CargandoPanel />}>
                    <Panel />
                  </Suspense>
                </RequireRole>
              }
            />
            <Route
              path="ajustes"
              element={
                <RequireRole roles={['supervisor']}>
                  <Ajustes />
                </RequireRole>
              }
            />
            <Route path="*" element={<NoEncontrado />} />
          </Route>
        </Routes>
      </AppProvider>
    </HashRouter>
  )
}
