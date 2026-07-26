import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ClientsListPage } from './pages/ClientsListPage';
import { ClientFormPage } from './pages/ClientFormPage';
import { ProgrammesListPage } from './pages/ProgrammesListPage';
import { ProgrammeFormPage } from './pages/ProgrammeFormPage';
import { ProgrammeCalendarPage } from './pages/ProgrammeCalendarPage';
import { NutritionPage } from './pages/NutritionPage';
import { SeancesListPage } from './pages/SeancesListPage';
import { SeanceFormPage } from './pages/SeanceFormPage';
import { ProgressionPage } from './pages/ProgressionPage';
import { MesuresPage } from './pages/MesuresPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsListPage />} />
              <Route path="/clients/new" element={<ClientFormPage />} />
              <Route path="/clients/:id" element={<ClientFormPage />} />
              <Route path="/clients/:clientId/programmes" element={<ProgrammesListPage />} />
              <Route path="/clients/:clientId/programmes/new" element={<ProgrammeFormPage />} />
              <Route path="/clients/:clientId/programmes/:programmeId" element={<ProgrammeFormPage />} />
              <Route
                path="/clients/:clientId/programmes/:programmeId/calendrier"
                element={<ProgrammeCalendarPage />}
              />
              <Route path="/clients/:clientId/nutrition" element={<NutritionPage />} />
              <Route path="/clients/:clientId/seances" element={<SeancesListPage />} />
              <Route path="/clients/:clientId/seances/new" element={<SeanceFormPage />} />
              <Route path="/clients/:clientId/seances/:seanceId" element={<SeanceFormPage />} />
              <Route path="/clients/:clientId/progression" element={<ProgressionPage />} />
              <Route path="/clients/:clientId/mesures" element={<MesuresPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
