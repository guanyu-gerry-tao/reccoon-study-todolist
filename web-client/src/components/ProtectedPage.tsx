import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // Check if the user is authenticated when the component mounts
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const res = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include', // Include cookies for session management
        });
        if (!res.ok) {
          throw new Error('Unauthorized access, redirecting to login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    }
    // Call the authentication check function
    checkAuthentication();
  }, []);

  return <>{children}</>; // Render children if authenticated
}