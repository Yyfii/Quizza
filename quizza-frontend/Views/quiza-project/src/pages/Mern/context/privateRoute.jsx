import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from './AppContext';

const PrivateRoute = ({ children }) => {
  const { isLoggedin, authChecked } = useContext(AppContext);

  if (!authChecked) {
    // Enquanto verifica autenticação, mostra algo (loading)
    return <div>Loading...</div>;
  }

  if (!isLoggedin) {
    // Se não está logado, redireciona para login ou GetStarted
    return <Navigate to="/" replace />;
  }

  // Se está logado, renderiza o componente filho normalmente
  return children;
};

export default PrivateRoute;
