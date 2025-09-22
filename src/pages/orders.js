import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWooCommerce } from '../context/WooCommerceContext';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import PleaseSignIn from '../components/auth/PleaseSignIn';
import { 
  TruckIcon, 
  CheckIcon, 
  ClockIcon, 
  ExclamationIcon,
  EyeIcon,
  MapPinIcon,
  CreditCardIcon
} from '../components/icons';

export default function Orders() {
  const router = useRouter();
  const { cartCount } = useWooCommerce();
  const { isAuthenticated, user } = useAuth();
  
    // Real orders data from WooCommerce
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real orders from WooCommerce
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/user-orders?userId=${user.id}`);
        const data = await response.json();
        
        if (data.success) {
          setOrders(data.orders);
        } else {
          setError(data.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user?.id]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="w-4 h-4" />;
      case 'processing':
        return <ClockIcon className="w-4 h-4" />;
      case 'shipped':
        return <TruckIcon className="w-4 h-4" />;
      case 'cancelled':
        return <ExclamationIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show not authenticated message
  if (!isAuthenticated) {
    return (
      <PleaseSignIn 
        title="View Your Orders"
        message="Please sign in to view your order history, track shipments, and manage your purchases."
        redirectTo="orders"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track your orders and view order history
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('processing')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'processing'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Processing ({orders.filter(o => o.status === 'processing').length})
            </button>
            <button
              onClick={() => setFilterStatus('shipped')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'shipped'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Shipped ({orders.filter(o => o.status === 'shipped').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Completed ({orders.filter(o => o.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {filterStatus === 'all' 
                  ? "You haven't placed any orders yet."
                  : `No ${filterStatus} orders found.`
                }
              </p>
              {filterStatus !== 'all' && (
                <button
                  onClick={() => setFilterStatus('all')}
                  className="mt-4 text-black hover:text-gray-700 font-medium"
                >
                  View all orders
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Order #{order.id}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Order Date</div>
                        <div className="font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="text-lg font-bold text-gray-900">₹{order.total.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <Link href={`/products/${item.id}`}>
                          <img
                            src={item.image || '/placeholder-product.svg'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg bg-gray-100 hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        </Link>
                        <div className="flex-1">
                          <Link href={`/products/${item.id}`}>
                            <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer" style={{fontSize: '16px', fontWeight: '500'}}>{item.name}</h4>
                          </Link>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">₹{item.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-4 text-gray-500" style={{ fontSize: '11px' }}>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-3 h-3" />
                          <span>{order.shipping?.city || 'N/A'}, {order.shipping?.state || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CreditCardIcon className="w-3 h-3" />
                          <span>{order.paymentMethod}</span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex items-center space-x-1">
                            <TruckIcon className="w-3 h-3" />
                            <span>Track: {order.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Enhanced Header */}
            <div className="relative bg-gradient-to-r from-gray-50 to-white p-8 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Order Details</h2>
                      <p className="text-gray-600 mt-1">Order #{selectedOrder.id}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeOrderDetails}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
              <div className="p-8 space-y-8">
                {/* Order Status & Summary */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="capitalize">{selectedOrder.status}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        {new Date(selectedOrder.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">₹{selectedOrder.total.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>
                  </div>
                </div>

                {/* Order Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Information */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CreditCardIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-medium text-gray-900">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Payment Status</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Paid
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {selectedOrder.shipping?.address_1 && (
                        <div>{selectedOrder.shipping.address_1}</div>
                      )}
                      {selectedOrder.shipping?.address_2 && (
                        <div>{selectedOrder.shipping.address_2}</div>
                      )}
                      <div>
                        {selectedOrder.shipping?.city || 'N/A'}, {selectedOrder.shipping?.state || 'N/A'} {selectedOrder.shipping?.postcode || 'N/A'}
                      </div>
                      <div>{selectedOrder.shipping?.country || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {selectedOrder.items.length} item{selectedOrder.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <Link href={`/products/${item.id}`} className="flex-shrink-0">
                          <img
                            src={item.image || '/placeholder-product.svg'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.svg';
                            }}
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.id}`}>
                            <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer truncate">
                              {item.name}
                            </h4>
                          </Link>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end space-y-2">
                          <div className="font-bold text-lg text-gray-900">₹{item.total.toFixed(2)}</div>
                          {selectedOrder.status === 'completed' && (
                            <button
                              onClick={() => {
                                router.push(`/products/${item.id}?review=true&orderId=${selectedOrder.id}`);
                              }}
                              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors font-medium flex items-center space-x-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              <span>Review</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Information */}
                {selectedOrder.trackingNumber && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TruckIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900">Tracking Information</h3>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-blue-600 font-medium">Tracking Number</div>
                          <div className="text-lg font-mono font-bold text-blue-900">{selectedOrder.trackingNumber}</div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Track Package
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeOrderDetails}
                  className="flex-1 bg-black text-white py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  Close
                </button>
                {selectedOrder.status === 'completed' && (
                  <button 
                    onClick={() => {
                      // If single item, go directly to product review
                      if (selectedOrder.items.length === 1) {
                        router.push(`/products/${selectedOrder.items[0].id}?review=true&orderId=${selectedOrder.id}`);
                      } else {
                        // For multiple items, go to a review page for the order
                        router.push(`/orders/${selectedOrder.id}/review`);
                      }
                    }}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>
                      {selectedOrder.items.length === 1 ? 'Write a Review' : 'Review Products'}
                    </span>
                  </button>
                )}
                <button className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium">
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
