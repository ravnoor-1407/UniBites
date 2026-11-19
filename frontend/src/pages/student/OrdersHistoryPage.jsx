import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, MapPin, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { API_BASE } from '../../config/api';

const OrdersHistoryPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/orders?studentRoll=${user?.rollNumber || '12204891'}`);
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-24">
      
      <div className="border-b border-border pb-3">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text">
          My Campus Orders
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Track active food preparation tokens and view order history
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center font-mono text-sm text-text-muted">
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Yet"
          description="You haven't placed any food pre-orders yet. Browse campus canteens to skip counter lines."
          actionText="Browse Canteens"
          onAction={() => window.location.href = '/home'}
        />
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isActive = ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(order.status);

            return (
              <Card key={order.id} hoverable className="p-4 sm:p-5">
                <Link to={`/orders/${order.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-primary text-white font-mono font-bold text-xs">
                        {order.token}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold ${
                        isActive
                          ? 'bg-success/15 text-success'
                          : order.status === 'Collected'
                          ? 'bg-surface-alt text-text'
                          : 'bg-danger/15 text-danger'
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-xs font-mono text-text-muted">
                        {order.orderedAt}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-lg text-text">
                      {order.outletName}
                    </h3>

                    <p className="text-xs text-text-muted">
                      {order.items?.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    <span className="font-mono font-black text-base sm:text-lg text-text">
                      ₹{order.totalAmount}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-1">
                      <span>{isActive ? 'Track Order' : 'View Details'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default OrdersHistoryPage;
