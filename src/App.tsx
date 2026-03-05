import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import UserList from './pages/UserList';
import AssignTask from './pages/AssignTask';
import CreateBaseTask from './pages/CreateBaseTask';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background-light">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas protegidas — requerem login */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskList />} />

              {/* Rotas restritas apenas para supervisor */}
              <Route path="/users" element={<PrivateRoute supervisorOnly={true} />} >
                <Route index element={<UserList />} />
              </Route>
              <Route path="/register" element={<PrivateRoute supervisorOnly={true} />} >
                <Route index element={<Register />} />
              </Route>
              <Route path="/tasks/assign" element={<PrivateRoute supervisorOnly={true} />} >
                <Route index element={<AssignTask />} />
              </Route>
              <Route path="/tasks/new-base" element={<PrivateRoute supervisorOnly={true} />} >
                <Route index element={<CreateBaseTask />} />
              </Route>

              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
