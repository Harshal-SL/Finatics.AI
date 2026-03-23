import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedButton } from "@/components/ui/animated-button";

const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-xl text-neutral-400 mb-2">
            Developer tools are not allowed in this application.
          </p>
          <p className="text-sm text-neutral-500">
            For security reasons, we have disabled developer tools access.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/">
            <AnimatedButton className="w-full bg-gradient-to-r from-primary to-success">
              Return to Home
            </AnimatedButton>
          </Link>
          <p className="text-xs text-neutral-600">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
