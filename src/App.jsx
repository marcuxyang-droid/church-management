import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';

// Public pages
import Landing from './pages/Landing';
import About from './pages/About';
import Events from './pages/Events';
import Sermons from './pages/Sermons';
import Give from './pages/Give';
import Newcomer from './pages/Newcomer';
import Login from './pages/Login';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Offerings from './pages/admin/Offerings';
import AdminEvents from './pages/admin/Events';
import Courses from './pages/admin/Courses';
import CellGroups from './pages/admin/CellGroups';
import Volunteers from './pages/admin/Volunteers';
import Finance from './pages/admin/Finance';
import Surveys from './pages/admin/Surveys';
import Media from './pages/admin/Media';
import Tags from './pages/admin/Tags';
import SystemSettings from './pages/admin/SystemSettings';
import HomeSettings from './pages/admin/HomeSettings';
import AboutSettings from './pages/admin/AboutSettings';
import GiveSettings from './pages/admin/GiveSettings';
import AdminNews from './pages/admin/News';
import AccessControl from './pages/admin/AccessControl';

// Layout components
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/sermons" element={<Sermons />} />
                    <Route path="/give" element={<Give />} />
                    <Route path="/newcomer" element={<Newcomer />} />
                </Route>

                {/* Auth routes */}
                <Route path="/login" element={<Login />} />

                {/* Admin routes */}
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <AdminLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="members" element={<Members />} />
                    <Route path="offerings" element={<Offerings />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="cellgroups" element={<CellGroups />} />
                    <Route path="volunteers" element={<Volunteers />} />
                    <Route path="finance" element={<Finance />} />
                    <Route path="surveys" element={<Surveys />} />
                    <Route path="media" element={<Media />} />
                    <Route path="tags" element={<Tags />} />
                    <Route path="home" element={<HomeSettings />} />
                    <Route path="about" element={<AboutSettings />} />
                    <Route path="give" element={<GiveSettings />} />
                    <Route path="news" element={<AdminNews />} />
                    <Route path="settings" element={<SystemSettings />} />
                    <Route path="access" element={<AccessControl />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
