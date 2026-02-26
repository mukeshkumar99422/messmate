import {Navigate, Outlet} from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import {useContext} from 'react';
import Loader from '../components/common/Loader.jsx';

function ProtectedRoute() {
    const {auth, authReady} = useContext(AuthContext);

    if (!authReady){
        return <div className="h-screen flex items-center justify-center">
            <Loader text='Loading Please Wait...' loaderNumber={0}/>
        </div>;
    }
    return auth.isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute