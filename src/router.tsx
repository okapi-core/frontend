import LoginPage from '@/app/login/page';
import DashboardEditPage from '@/app/main/dashboard-edit-page/page';
import DashboardViewPage from '@/app/main/dashboard-view-page/page';
import DashboardsPage from '@/app/main/dashboards-home/dashboards-home';
import LogsHome from '@/app/main/logs/logs-home';
import PanelEditorPage from '@/app/main/dashboards-home/panel-editor';
import MainLayout from '@/app/main/layout';
import MetricsExplorerPage from '@/app/main/metrics-explorer/page';
import OscarHome from '@/app/main/oscar-home/page';
import OscarSession from '@/app/main/oscar-session/page';
import ProfilePage from '@/app/main/profile/profile-home';
import SpansHome from '@/app/main/spans-home/page';
import TraceViewPage from '@/app/main/trace-view/page';
import SignupPage from '@/app/signup/page';
import { DASH_EDIT_PATH } from '@/lib/routing';
import { Navigate, Route, Routes } from 'react-router-dom';
import RedBoard from './app/main/red-board/page';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/main" element={<MainLayout />}>
        <Route index element={<Navigate to="/main/dashboards" replace />} />
        <Route path="dashboards" element={<DashboardsPage />} />
        <Route
          path="dashboards/:slug/:dashVersion"
          element={<DashboardViewPage />}
        />
        <Route path={DASH_EDIT_PATH} element={<DashboardEditPage />} />
        <Route
          path="dashboards/:slug/:dashVersion/rows/:rowId/panels/:panelId/edit"
          element={<PanelEditorPage />}
        />
        <Route path="metrics-explorer" element={<MetricsExplorerPage />} />
        <Route path="logs" element={<LogsHome />} />
        <Route path="oscar" element={<OscarHome />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="drill-down" element={<Navigate to="/main/trace-view" replace />} />
        <Route path="spans" element={<SpansHome />} />
        <Route path="trace-view" element={<TraceViewPage />} />
        <Route path="svc-health" element={<RedBoard />} />
        <Route path="chat/:sessionId" element={<OscarSession />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
