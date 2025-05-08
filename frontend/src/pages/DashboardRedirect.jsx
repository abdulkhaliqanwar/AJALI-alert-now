import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const DashboardRedirect = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  }, [user, isAuthenticated, navigate]);

  return null;
};

export default DashboardRedirect;
