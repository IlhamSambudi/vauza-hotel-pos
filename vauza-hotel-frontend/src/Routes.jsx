import { Routes as Switch, Route, Navigate } from 'react-router-dom';
import Clients from './pages/Clients';
import Hotels from './pages/Hotels';
import Reservations from './pages/Reservations';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ConfirmationLetter from './pages/ConfirmationLetter';
import Payments from './pages/Payments';
import PaymentReceipt from './pages/PaymentReceipt';
import OverviewHotelOrder from './pages/OverviewHotelOrder';
import OverviewClientPrint from './pages/OverviewClientPrint';
import NusukAgreement from './pages/NusukAgreement';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const RootRoute = () => {
    const token = localStorage.getItem('token');
    return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default function Routes() {
    return (
        <Switch>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<RootRoute />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/hotels" element={<ProtectedRoute><Hotels /></ProtectedRoute>} />
            <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/cl/:no_rsv" element={<ProtectedRoute><ConfirmationLetter /></ProtectedRoute>} />
            <Route path="/payment-receipt/:id_payment" element={<ProtectedRoute><PaymentReceipt /></ProtectedRoute>} />
            <Route path="/overview-order" element={<ProtectedRoute><OverviewHotelOrder /></ProtectedRoute>} />
            <Route path="/overview-order/print/:id_client" element={<ProtectedRoute><OverviewClientPrint /></ProtectedRoute>} />
            <Route path="/nusuk-agreement" element={<ProtectedRoute><NusukAgreement /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" />} />
        </Switch>
    );
}
