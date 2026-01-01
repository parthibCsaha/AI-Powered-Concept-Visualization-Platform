import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { useStore } from '../store/useStore';

export default function OAuth2Redirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuth2Redirect = () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const name = searchParams.get('name');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Google login failed. Please try again.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (token && email && name) {
        try {
          const user = { email, name };
          authService.storeAuth(token, user);
          setUser(user);
          navigate('/');
        } catch (err) {
          console.error('Error storing auth:', err);
          setError('Failed to complete login. Please try again.');
          setTimeout(() => navigate('/'), 3000);
        }
      } else {
        setError('Invalid login response. Please try again.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleOAuth2Redirect();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="card-modern max-w-md w-full text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <p className="text-slate-600 text-sm">Redirecting to home page...</p>
          </>
        ) : (
          <>
            <svg
              className="animate-spin h-12 w-12 text-primary-600 mx-auto"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="mt-4 text-slate-600">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}