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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/clients" replace />} />
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
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
