import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { Particles } from "@/components/ui/particles";
import Navbar from "@/components/layout/Navbar";
import { CreditCard, Plus, Loader2, CheckCircle, XCircle, Clock, Calendar, Home, LineChart as LineChartIcon, Target, BookOpen, MessageSquare, Calculator, LogOut, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const Transactions = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [newPayment, setNewPayment] = useState({
    type: 'expense',
    category: '',
    name: '',
    amount: '',
    due_date: '',
    recurrence: 'none',
    // Bills specific
    billType: '',
    provider: '',
    accountNumber: '',
    // Subscriptions specific
    service: '',
    subscriptionAccount: '',
    // Credit card specific
    cardNumber: '',
  });

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // Load PayPal SDK and render button when payment is selected
  useEffect(() => {
    if (selectedPayment && showPaymentDialog) {
      // Remove previous script if exists
      const existingScript = document.getElementById('paypal-sdk');
      if (existingScript) existingScript.remove();

      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      script.onload = () => {
        if (window.paypal) {
          // Clear any existing buttons
          const container = document.getElementById('paypal-button-container');
          if (container) {
            container.innerHTML = '';
            
            window.paypal.Buttons({
              createOrder: (data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: { value: selectedPayment.amount.toFixed(2) },
                    description: selectedPayment.name,
                  }],
                });
              },
              onApprove: async (data, actions) => {
                setIsProcessing(true);
                try {
                  const details = await actions.order.capture();

                  // Insert transaction into Supabase
                  const transactionRes = await supabase.from('transactions').insert([{
                    user_id: user.id,
                    type: selectedPayment.type,
                    category: selectedPayment.type,
                    amount: selectedPayment.amount,
                    description: selectedPayment.name,
                    status: 'completed',
                    payment_method: 'paypal',
                  }]).select().single();

                  if (transactionRes.error) {
                    throw transactionRes.error;
                  }

                  // Mark payment as paid
                  const updateRes = await supabase
                    .from('pending_payments')
                    .update({ is_paid: true })
                    .eq('id', selectedPayment.id)
                    .select();

                  if (updateRes.error) {
                    throw updateRes.error;
                  }

                  toast.success('Payment completed successfully!');
                  setShowPaymentDialog(false);
                  setSelectedPayment(null);
                  await fetchData();
                } catch (err) {
                  toast.error(err.message || 'Payment save failed');
                } finally {
                  setIsProcessing(false);
                }
              },
              onError: (err) => {
                toast.error('PayPal payment failed');
                setIsProcessing(false);
              },
              onCancel: () => {
                toast.info('Payment cancelled');
                setIsProcessing(false);
              }
            }).render('#paypal-button-container');
          }
        }
      };

      document.body.appendChild(script);

      // Cleanup function
      return () => {
        const scriptToRemove = document.getElementById('paypal-sdk');
        if (scriptToRemove) scriptToRemove.remove();
      };
    }
  }, [selectedPayment, showPaymentDialog, user?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transactionsRes, paymentsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('pending_payments')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_paid', false)
          .order('due_date', { ascending: true }),
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      if (paymentsRes.error) throw paymentsRes.error;

      setTransactions(transactionsRes.data || []);
      setPendingPayments(paymentsRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount) {
      toast.error('Please enter an amount');
      return;
    }

    // Generate display name based on type
    let displayName = newPayment.name;
    if (newPayment.type === 'bills') {
      if (!newPayment.billType || !newPayment.provider) {
        toast.error('Please fill in bill type and provider');
        return;
      }
      displayName = `${newPayment.billType.charAt(0).toUpperCase() + newPayment.billType.slice(1)} Bill - ${newPayment.provider}`;
    } else if (newPayment.type === 'subscription') {
      if (!newPayment.service) {
        toast.error('Please select a subscription service');
        return;
      }
      displayName = newPayment.service === 'other' ? newPayment.name : 
        newPayment.service.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    } else if (newPayment.type === 'credit_card') {
      if (!newPayment.name || !newPayment.cardNumber) {
        toast.error('Please fill in card details');
        return;
      }
      displayName = `${newPayment.name} (****${newPayment.cardNumber})`;
    } else if (!displayName) {
      toast.error('Please enter a name');
      return;
    }

    setIsAddingPayment(true);
    try {
      const paymentData = {
        user_id: user.id,
        type: newPayment.type,
        name: displayName,
        amount: parseFloat(newPayment.amount),
        due_date: newPayment.due_date || null,
        recurrence: newPayment.recurrence,
        is_paid: false,
      };

      const { error } = await supabase.from('pending_payments').insert([paymentData]);

      if (error) throw error;

      toast.success('Payment added successfully');
      setShowAddDialog(false);
      setNewPayment({
        type: 'expense',
        category: '',
        name: '',
        amount: '',
        due_date: '',
        recurrence: 'none',
        billType: '',
        provider: '',
        accountNumber: '',
        service: '',
        subscriptionAccount: '',
        cardNumber: '',
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to add payment');
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDialog(true);
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pending_payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Payment deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete payment');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'bills':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'subscription':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'credit_card':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'expense':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'loan':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Navigation items for navbar
  const navItems = [
    { name: "Dashboard", url: "/dashboard", icon: Home },
    { name: "Investments", url: "/stocks", icon: LineChartIcon },
    { name: "Goals", url: "/goals", icon: Target },
    { name: "Loan Analyzer", url: "/loan-analyzer", icon: Calculator },
    { name: "Learn", url: "/learn", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-black relative">
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#ffffff"
        refresh={false}
      />
      {/* Navbar */}
      <Navbar items={navItems} className="" showLogo={true} />
      
      {/* Logout Button */}
      <button
        onClick={async () => { await signOut(); navigate('/login'); }}
        className="fixed top-8 right-8 flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-full text-destructive hover:text-destructive transition-all duration-200 backdrop-blur-lg"
        style={{ zIndex: 9999 }}
      >
        <LogOut size={18} />
        <span className="hidden sm:inline">Logout</span>
      </button>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Transactions</h1>
          <p className="text-muted-foreground">Manage your expenses, loans, and subscriptions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-xl border border-white/10 bg-card/70 backdrop-blur-lg shadow-lg">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Pending Payments</h2>
                  <p className="text-sm text-muted-foreground">Items awaiting payment</p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-black hover:bg-black/90 text-white border-white/20 min-w-[180px] flex items-center justify-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment
                    </Button>
                  </DialogTrigger>
                    <DialogContent className="z-[100] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Payment</DialogTitle>
                        <DialogDescription>
                          Create a new pending payment for expenses, loans, or subscriptions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select value={newPayment.type} onValueChange={(value) => setNewPayment({ ...newPayment, type: value, category: '' })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[150]">
                              <SelectItem value="bills">Bills</SelectItem>
                              <SelectItem value="subscription">Subscription</SelectItem>
                              <SelectItem value="credit_card">Credit Card</SelectItem>
                              <SelectItem value="expense">Other Expense</SelectItem>
                              <SelectItem value="loan">Loan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Bills specific fields */}
                        {newPayment.type === 'bills' && (
                          <>
                            <div>
                              <Label htmlFor="billType">Bill Type</Label>
                              <Select value={newPayment.billType} onValueChange={(value) => setNewPayment({ ...newPayment, billType: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bill type" />
                                </SelectTrigger>
                                <SelectContent className="z-[150]">
                                  <SelectItem value="electricity">Electricity</SelectItem>
                                  <SelectItem value="gas">Gas</SelectItem>
                                  <SelectItem value="water">Water</SelectItem>
                                  <SelectItem value="internet">Internet</SelectItem>
                                  <SelectItem value="phone">Phone</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="provider">Provider</Label>
                              <Input
                                id="provider"
                                value={newPayment.provider}
                                onChange={(e) => setNewPayment({ ...newPayment, provider: e.target.value })}
                                placeholder="e.g., BESCOM, BSNL"
                              />
                            </div>
                            <div>
                              <Label htmlFor="accountNumber">Account Number</Label>
                              <Input
                                id="accountNumber"
                                value={newPayment.accountNumber}
                                onChange={(e) => setNewPayment({ ...newPayment, accountNumber: e.target.value })}
                                placeholder="Enter account number"
                              />
                            </div>
                          </>
                        )}

                        {/* Subscription specific fields */}
                        {newPayment.type === 'subscription' && (
                          <>
                            <div>
                              <Label htmlFor="service">Subscription Service</Label>
                              <Select value={newPayment.service} onValueChange={(value) => setNewPayment({ ...newPayment, service: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent className="z-[150]">
                                  <SelectItem value="netflix">Netflix</SelectItem>
                                  <SelectItem value="amazon_prime">Amazon Prime</SelectItem>
                                  <SelectItem value="spotify">Spotify</SelectItem>
                                  <SelectItem value="zee5">Zee5</SelectItem>
                                  <SelectItem value="disney_hotstar">Disney+ Hotstar</SelectItem>
                                  <SelectItem value="youtube_premium">YouTube Premium</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="subscriptionAccount">Account Email/Username</Label>
                              <Input
                                id="subscriptionAccount"
                                value={newPayment.subscriptionAccount}
                                onChange={(e) => setNewPayment({ ...newPayment, subscriptionAccount: e.target.value })}
                                placeholder="Account email or username"
                              />
                            </div>
                          </>
                        )}

                        {/* Credit Card specific fields */}
                        {newPayment.type === 'credit_card' && (
                          <>
                            <div>
                              <Label htmlFor="cardNumber">Card Number (Last 4 digits)</Label>
                              <Input
                                id="cardNumber"
                                value={newPayment.cardNumber}
                                onChange={(e) => setNewPayment({ ...newPayment, cardNumber: e.target.value })}
                                placeholder="XXXX"
                                maxLength={4}
                              />
                            </div>
                            <div>
                              <Label htmlFor="name">Card Name/Bank</Label>
                              <Input
                                id="name"
                                value={newPayment.name}
                                onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                                placeholder="e.g., HDFC Credit Card"
                              />
                            </div>
                          </>
                        )}

                        {/* Common fields for other types */}
                        {(newPayment.type === 'expense' || newPayment.type === 'loan') && (
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={newPayment.name}
                              onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                              placeholder="e.g., Groceries, Personal Loan"
                            />
                          </div>
                        )}

                        <div>
                          <Label htmlFor="amount">Amount (₹)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={newPayment.amount}
                            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label htmlFor="due_date">Due Date</Label>
                          <Input
                            id="due_date"
                            type="date"
                            value={newPayment.due_date}
                            onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="recurrence">Recurrence</Label>
                          <Select value={newPayment.recurrence} onValueChange={(value) => setNewPayment({ ...newPayment, recurrence: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[150]">
                              <SelectItem value="none">One-time</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button onClick={handleAddPayment} disabled={isAddingPayment} className="w-full">
                          {isAddingPayment ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            'Add Payment'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
              </div>
              <div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingPayments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="bg-muted/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-10 h-10 opacity-50" />
                    </div>
                    <p className="text-lg font-medium mb-1">No pending payments</p>
                    <p className="text-sm">Add a payment to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/40 transition-all border border-border/50 hover:border-border">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-foreground">{payment.name}</h3>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getTypeColor(payment.type)}`}>
                              {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-bold text-xl text-foreground">₹{payment.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            {payment.due_date && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                Due: {new Date(payment.due_date).toLocaleDateString()}
                              </span>
                            )}
                            {payment.recurrence !== 'none' && (
                              <span className="text-xs bg-secondary px-2 py-1 rounded-md">
                                {payment.recurrence.charAt(0).toUpperCase() + payment.recurrence.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button onClick={() => handlePayNow(payment)} size="lg" className="bg-black hover:bg-black/90 text-white border-white/20 min-w-[140px] flex items-center justify-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                          <Button 
                            onClick={() => handleDeletePayment(payment.id)} 
                            size="lg" 
                            variant="destructive"
                            className="px-3"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-card/70 backdrop-blur-lg shadow-lg">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-foreground">Transaction History</h2>
                <p className="text-sm text-muted-foreground">All your completed transactions</p>
              </div>
              <div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="bg-muted/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-10 h-10 opacity-50" />
                    </div>
                    <p className="text-lg font-medium mb-1">No transactions yet</p>
                    <p className="text-sm">Your payment history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/30 transition-all border border-border/30">
                        <div className="flex items-center gap-4">
                          <div className="bg-background rounded-full p-2">
                            {getStatusIcon(transaction.status)}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-lg text-foreground">{transaction.description}</h3>
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${getTypeColor(transaction.type)}`}>
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xl text-foreground">
                            ₹{transaction.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </span>
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="p-6 rounded-xl border border-white/10 bg-card/70 backdrop-blur-lg shadow-lg sticky top-8">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-foreground">Summary</h2>
                <p className="text-sm text-muted-foreground">Your payment overview</p>
              </div>
              <div className="space-y-5">
                <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-2 border-yellow-500/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total Pending</p>
                  <p className="text-3xl font-bold text-foreground">
                    ₹{pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingPayments.length} payment{pendingPayments.length !== 1 ? 's' : ''} awaiting
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total Paid</p>
                  <p className="text-3xl font-bold text-foreground">
                    ₹{transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {transactions.filter(t => t.status === 'completed').length} completed transaction{transactions.filter(t => t.status === 'completed').length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="space-y-3 pt-4 border-t-2">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">Payment Breakdown</p>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm font-medium text-foreground">Expenses</span>
                    <span className="font-bold text-lg bg-blue-600 text-white px-3 py-1 rounded-full">
                      {pendingPayments.filter(p => p.type === 'expense').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <span className="text-sm font-medium text-foreground">Loans</span>
                    <span className="font-bold text-lg bg-orange-600 text-white px-3 py-1 rounded-full">
                      {pendingPayments.filter(p => p.type === 'loan').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <span className="text-sm font-medium text-foreground">Subscriptions</span>
                    <span className="font-bold text-lg bg-purple-600 text-white px-3 py-1 rounded-full">
                      {pendingPayments.filter(p => p.type === 'subscription').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md z-[100]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Process Payment</DialogTitle>
            <DialogDescription>
              Complete the payment for {selectedPayment?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/20">
              <p className="text-sm text-muted-foreground mb-1">Amount to pay</p>
              <p className="text-3xl font-bold text-foreground">
                ₹{selectedPayment?.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>

            {/* PayPal Button Container */}
            <div id="paypal-button-container" className="mt-4"></div>

            {isProcessing && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-muted-foreground">Processing payment...</span>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-center text-muted-foreground">
                <span className="font-medium">Sandbox Mode:</span> Use PayPal sandbox account or test card for testing
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
