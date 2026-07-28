import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ClientsListPage } from './pages/ClientsListPage';
import { ClientFormPage } from './pages/ClientFormPage';
import { ClientFichePage } from './pages/ClientFichePage';
import { ProgrammeFormPage } from './pages/ProgrammeFormPage';
import { ProgrammeCalendarPage } from './pages/ProgrammeCalendarPage';
import { SeanceFormPage } from './pages/SeanceFormPage';
import { ProgressionPage } from './pages/ProgressionPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExportPage } from './pages/ExportPage';
import { ProspectsPage } from './pages/ProspectsPage';
import { PublicProspectPage } from './pages/PublicProspectPage';
import { ParametresPage } from './pages/ParametresPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/p/:slug" element={<PublicProspectPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsListPage />} />
              <Route path="/prospects" element={<ProspectsPage />} />
              <Route path="/clients/new" element={<ClientFormPage />} />
              <Route path="/clients/:id" element={<ClientFichePage onglet="bilan" />} />
              <Route path="/clients/:id/programme" element={<ClientFichePage onglet="programme" />} />
              <Route path="/clients/:id/nutrition" element={<ClientFichePage onglet="nutrition" />} />
              <Route path="/clients/:clientId/programmes/new" element={<ProgrammeFormPage />} />
              <Route path="/clients/:clientId/programmes/:programmeId" element={<ProgrammeFormPage />} />
              <Route
                path="/clients/:clientId/programmes/:programmeId/calendrier"
                element={<ProgrammeCalendarPage />}
              />
              <Route path="/clients/:clientId/seances/new" element={<SeanceFormPage />} />
              <Route path="/clients/:clientId/seances/:seanceId" element={<SeanceFormPage />} />
              <Route path="/clients/:clientId/progression" element={<ProgressionPage />} />
              <Route path="/export" element={<ExportPage />} />
              <Route path="/parametres" element={<ParametresPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
