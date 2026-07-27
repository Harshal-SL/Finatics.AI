import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import API_BASE_URL from "@/lib/api";

const DashboardDebug = () => {
  const { user } = useAuth();
  const [apiTests, setApiTests] = useState({
    bankAccounts: null,
    dashboard: null,
    investments: null
  });

  useEffect(() => {
    const testAPIs = async () => {
      if (!user?.id) return;

      console.log('Testing APIs for user:', user.id);

      // Test Bank Accounts
      try {
        const res = await fetch(`${API_BASE_URL}/bank-accounts/${user.id}`);
        const data = await res.json();
        setApiTests(prev => ({ ...prev, bankAccounts: { status: res.status, data } }));
      } catch (error) {
        setApiTests(prev => ({ ...prev, bankAccounts: { error: error.message } }));
      }

      // Test Dashboard
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard?userId=${user.id}`);
        const data = await res.json();
        setApiTests(prev => ({ ...prev, dashboard: { status: res.status, data } }));
      } catch (error) {
        setApiTests(prev => ({ ...prev, dashboard: { error: error.message } }));
      }

      // Test Investments
      try {
        const res = await fetch(`${API_BASE_URL}/investments?userId=${user.id}`);
        const data = await res.json();
        setApiTests(prev => ({ ...prev, investments: { status: res.status, data } }));
      } catch (error) {
        setApiTests(prev => ({ ...prev, investments: { error: error.message } }));
      }
    };

    testAPIs();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard Debug Panel</h1>

        <div className="grid gap-6">
          {/* User Info */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-bold text-white mb-4">User Information</h2>
            <pre className="bg-background p-4 rounded text-sm text-white overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          {/* Bank Accounts API */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-bold text-white mb-4">Bank Accounts API</h2>
            <p className="text-sm text-muted-foreground mb-2">
              GET /api/bank-accounts/{user?.id || 'NO_USER_ID'}
            </p>
            {apiTests.bankAccounts ? (
              <pre className="bg-background p-4 rounded text-sm text-white overflow-auto max-h-96">
                {JSON.stringify(apiTests.bankAccounts, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
            )}
          </div>

          {/* Dashboard API */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-bold text-white mb-4">Dashboard API</h2>
            <p className="text-sm text-muted-foreground mb-2">
              GET /api/dashboard?userId={user?.id || 'NO_USER_ID'}
            </p>
            {apiTests.dashboard ? (
              <pre className="bg-background p-4 rounded text-sm text-white overflow-auto max-h-96">
                {JSON.stringify(apiTests.dashboard, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
            )}
          </div>

          {/* Investments API */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-bold text-white mb-4">Investments API</h2>
            <p className="text-sm text-muted-foreground mb-2">
              GET /api/investments?userId={user?.id || 'NO_USER_ID'}
            </p>
            {apiTests.investments ? (
              <pre className="bg-background p-4 rounded text-sm text-white overflow-auto max-h-96">
                {JSON.stringify(apiTests.investments, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDebug;
