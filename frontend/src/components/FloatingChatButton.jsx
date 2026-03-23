import { useLocation } from 'react-router-dom';
import FinanceChatbot from '@/pages/FinanceChatbot';

const FloatingChatButton = () => {
  const location = useLocation();

  // Don't show on login/landing pages
  const hiddenPaths = ['/login', '/landing', '/', '/create-profile', '/create-pin', '/enter-pin', '/add-bank-account', '/forgot-password', '/reset-password'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return <FinanceChatbot />;
};

export default FloatingChatButton;
