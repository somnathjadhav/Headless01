import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWooCommerce } from '../context/WooCommerceContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { CheckIcon, HomeIcon, ShoppingBagIcon, GiftIcon, TruckIcon, ShieldIcon, DownloadIcon, CreditCardIcon, ExclamationIcon, StarIcon } from '../components/icons';
import ReviewForm from '../components/reviews/ReviewForm';
import jsPDF from 'jspdf';

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId, orderNumber } = router.query;
  const { restoreCart, cartBackup } = useWooCommerce();
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  // Initialize with fallback data
  const [orderDetails, setOrderDetails] = useState({
    id: 'demo',
    number: '387',
    date: new Date().toISOString(),
    status: 'Processing',
    total: 129.99,
    currency: 'USD',
    items: [{
      id: 1,
      name: 'Sample Product',
      quantity: 1,
      price: 129.99,
      total: 129.99,
      image: '/placeholder-product.svg'
    }],
    billing: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: '',
      email: user?.email || '',
      phone: ''
    },
    shipping: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: ''
    },
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    trackingNumber: null,
    notes: '',
    dateModified: new Date().toISOString(),
    dateCompleted: null,
    subtotal: 129.99,
    shippingTotal: 0,
    taxTotal: 0,
    discountTotal: 0
  });
  const [siteInfo, setSiteInfo] = useState(null);
  const [loading, setLoading] = useState(false); // Set to false since we have fallback data
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submittedReviews, setSubmittedReviews] = useState([]);


  // Fetch order details and site info
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        // Fallback data is already set in the first useEffect
        return;
      }

      try {
        setLoading(true);
        
        // Fetch order details and site info in parallel
        const [orderResponse, siteResponse] = await Promise.all([
          fetch(`/api/orders/${orderId}`),
          fetch('/api/site-info')
        ]);

        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          if (orderData.success) {
            setOrderDetails(orderData.order);
          } else {
            throw new Error(orderData.message || 'Failed to fetch order');
          }
        } else {
          throw new Error('Failed to fetch order details');
        }

        if (siteResponse.ok) {
          const siteData = await siteResponse.json();
          setSiteInfo(siteData);
        }

      } catch (err) {
        console.error('Error fetching order data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Restore cart backup when component mounts (after order completion)
  useEffect(() => {
    if (cartBackup) {
      restoreCart();
    }
  }, [cartBackup, restoreCart]);


  // Function to handle PDF invoice download
  const handleDownloadInvoice = async () => {
    if (!orderDetails) {
      alert('Order details not available. Please try again.');
      return;
    }


    // Create fallback order details if the structure is incomplete
    const safeOrderDetails = {
      id: orderDetails.id || orderId || 'N/A',
      number: orderDetails.number || orderDetails.id || orderId || 'N/A',
      date: orderDetails.date || new Date().toISOString(),
      status: orderDetails.status || 'Processing',
      paymentMethod: orderDetails.paymentMethod || 'Credit Card',
      paymentStatus: orderDetails.paymentStatus || 'Paid',
      total: orderDetails.total || orderDetails.totalAmount || '129.99',
      billing: orderDetails.billing || {
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        phone: ''
      },
      items: orderDetails.items || [{
        name: 'Product Item',
        quantity: 1,
        price: 129.99
      }]
    };

    try {
      // Check if jsPDF is available
      if (typeof jsPDF === 'undefined') {
        throw new Error('jsPDF library not loaded');
      }
      
      const pdf = new jsPDF();

      // Helpers
      const formatCurrency = (value) => {
        const num = Number(value || 0);
        const symbol = orderDetails?.currency === 'INR' ? 'Rs.' : (orderDetails?.currency === 'USD' ? '$' : 'Rs.');
        return `${symbol} ${num.toFixed(2)}`;
      };
      const drawBox = (x, y, w, h, title) => {
        // Clean box drawing with just borders (no background fill)
        pdf.setDrawColor(180);
        pdf.setLineWidth(0.5);
        
        // Draw rounded rectangle using multiple small rectangles
        const radius = 2;
        pdf.rect(x + radius, y, w - 2*radius, h); // Top and bottom
        pdf.rect(x, y + radius, radius, h - 2*radius); // Left side
        pdf.rect(x + w - radius, y + radius, radius, h - 2*radius); // Right side
        
        if (title) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(60);
          pdf.text(title, x + 4, y + 7);
        }
      };

      // Header
      const companyName = siteInfo?.name || 'Your Store';
      const companyDescription = siteInfo?.description || 'Thank you for shopping with us';
      const companyUrl = siteInfo?.url || 'https://example.com';

      // Logo placeholder
      pdf.setDrawColor(200);
      pdf.rect(20, 15, 25, 25);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('LOGO', 32.5, 28);

      // Company info
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text(companyName, 50, 25);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(companyDescription, 50, 30);
      pdf.text(companyUrl, 50, 35);

      // Invoice title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('TAX INVOICE', 150, 25);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Bill of Supply', 150, 30);

      // Top boxes: Sold By, Bill To, Ship To, Invoice Details
      const topY = 45;
      drawBox(14, topY, 90, 35, 'Sold By');
      drawBox(106, topY, 90, 35, 'Invoice Details');

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(60);
      // Sold By content
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(40);
      pdf.text(companyName, 18, topY + 12);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(80);
      pdf.text('Email: support@example.com', 18, topY + 17);
      pdf.text('Phone: +91 98765 43210', 18, topY + 22);
      pdf.text('PAN: AAAPL1234C', 18, topY + 27);
      pdf.text('GSTIN: 22AAAAA0000A1Z5', 18, topY + 32);

      // Invoice details content
      const invDate = new Date(safeOrderDetails.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(80);
      const details = [
        `Invoice #: ${safeOrderDetails.number}`,
        `Invoice Date: ${invDate}`,
        `Order Status: ${safeOrderDetails.status}`,
        `Payment: ${safeOrderDetails.paymentMethod}`,
        `Status: ${safeOrderDetails.paymentStatus}`
      ];
      details.forEach((t, i) => pdf.text(t, 110, topY + 12 + i * 4));

      // Address boxes
      const addrY = topY + 40;
      drawBox(14, addrY, 90, 35, 'Billing Address');
      drawBox(106, addrY, 90, 35, 'Shipping Address');

      const bill = safeOrderDetails.billing;
      const billName = `${bill.first_name || ''} ${bill.last_name || ''}`.trim() || 'Customer';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(40);
      pdf.text(billName, 18, addrY + 12);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(80);
      const billLines = [
        bill.address_1,
        bill.address_2,
        `${bill.city}, ${bill.state} ${bill.postcode}`,
        bill.country,
        bill.email
      ].filter(Boolean);
      billLines.forEach((t, i) => pdf.text(t, 18, addrY + 16 + i * 4));

      const ship = orderDetails.shipping || bill;
      const shipName = `${ship.first_name || ''} ${ship.last_name || ''}`.trim() || billName;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(40);
      pdf.text(shipName, 110, addrY + 12);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(80);
      const shipLines = [
        ship.address_1,
        ship.address_2,
        `${ship.city}, ${ship.state} ${ship.postcode}`,
        ship.country
      ].filter(Boolean);
      shipLines.forEach((t, i) => pdf.text(t, 110, addrY + 16 + i * 4));

      // Items table - calculate height based on content
      const tableY = addrY + 40;
      const itemCount = (safeOrderDetails.items || []).length;
      const tableHeight = Math.max(60, 20 + (itemCount * 12)); // Minimum 60, adjust based on items
      drawBox(14, tableY, 182, tableHeight, 'Order Details');

      // Table headers with clean styling
      const colX = { desc: 18, unit: 120, qty: 145, tax: 160, total: 178 };
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(50);
      pdf.text('Description', colX.desc, tableY + 15);
      pdf.text('Unit Price', colX.unit, tableY + 15);
      pdf.text('Qty', colX.qty, tableY + 15);
      pdf.text('Tax %', colX.tax, tableY + 15);
      pdf.text('Total', colX.total, tableY + 15);
      pdf.setDrawColor(200);
      pdf.setLineWidth(0.3);
      pdf.line(16, tableY + 18, 194, tableY + 18);

      // Table rows with alternating row colors
      pdf.setFont('helvetica', 'normal');
      let y = tableY + 25;
      let sub = 0;
      let taxSum = 0;
      (safeOrderDetails.items || []).forEach((item, index) => {
        const lineTotal = Number(item.total || item.quantity * item.price || 0);
        const unit = Number(item.price || 0);
        const taxRate = item.taxRate != null ? Number(item.taxRate) : 0;
        const taxAmt = (lineTotal * taxRate) / 100;
        sub += lineTotal;
        taxSum += taxAmt;

        // Clean table rows without background

        // Wrap description if long
        const descLines = pdf.splitTextToSize(item.name || 'Item', 95);
        descLines.forEach((ln, idx) => {
          pdf.setFontSize(8);
          pdf.setTextColor(60);
          pdf.text(ln, colX.desc, y + idx * 4);
        });
        const rowHeight = Math.max(8, descLines.length * 4);
        
        pdf.setFontSize(8);
        pdf.setTextColor(70);
        pdf.text(formatCurrency(unit), colX.unit, y);
        pdf.text(String(item.quantity || 1), colX.qty, y);
        pdf.text(`${taxRate}%`, colX.tax, y);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatCurrency(lineTotal), colX.total, y);
        pdf.setFont('helvetica', 'normal');
        
        y += rowHeight + 2;
        if (y > tableY + 90) {
          pdf.addPage();
          y = 20;
        }
      });

      // Totals box with enhanced styling
      const totalsY = tableY + tableHeight + 5;
      drawBox(112, totalsY, 84, 35);
      
      // Totals header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(40);
      pdf.text('Order Summary', 116, totalsY + 8);
      
      pdf.setDrawColor(200);
      pdf.line(116, totalsY + 10, 190, totalsY + 10);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(70);
      pdf.text('Subtotal:', 116, totalsY + 16);
      pdf.text('Tax:', 116, totalsY + 22);
      pdf.text('Shipping:', 116, totalsY + 28);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30);
      pdf.text('Grand Total:', 116, totalsY + 34);

      const shipping = Number(orderDetails?.shippingTotal || 0);
      const grand = Number(safeOrderDetails.total || sub + taxSum + shipping);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(70);
      pdf.text(formatCurrency(sub), 188, totalsY + 16, { align: 'right' });
      pdf.text(formatCurrency(taxSum || Number(orderDetails?.taxTotal || 0)), 188, totalsY + 22, { align: 'right' });
      pdf.text(formatCurrency(shipping), 188, totalsY + 28, { align: 'right' });
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30);
      pdf.text(formatCurrency(grand), 188, totalsY + 34, { align: 'right' });

      // Footer with better styling
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(120);
      pdf.text('This is a computer generated invoice. No signature required.', 105, 290, { align: 'center' });
      pdf.text('Thank you for your business!', 105, 295, { align: 'center' });

      pdf.save(`invoice-${safeOrderDetails.number}.pdf`);

    } catch (error) {
      console.error('Error generating PDF invoice:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        orderDetails: orderDetails,
        siteInfo: siteInfo
      });
      
      // Try a simple fallback PDF
      try {
        const fallbackPdf = new jsPDF();
        const formatCurrencyFallback = (value) => {
          const num = Number(value || 0);
          const symbol = orderDetails?.currency === 'INR' ? 'Rs.' : (orderDetails?.currency === 'USD' ? '$' : 'Rs.');
          return `${symbol} ${num.toFixed(2)}`;
        };
        fallbackPdf.setFontSize(20);
        fallbackPdf.text('INVOICE', 20, 30);
        fallbackPdf.setFontSize(12);
        fallbackPdf.text(`Invoice #: ${safeOrderDetails.number}`, 20, 50);
        fallbackPdf.text(`Date: ${new Date(safeOrderDetails.date).toLocaleDateString()}`, 20, 60);
        fallbackPdf.text(`Total: ${formatCurrencyFallback(safeOrderDetails.total)}`, 20, 70);
        fallbackPdf.text('Thank you for your order!', 20, 90);
        fallbackPdf.save(`invoice-${safeOrderDetails.number}.pdf`);
      } catch (fallbackError) {
        console.error('Fallback PDF generation also failed:', fallbackError);
        alert(`Failed to generate PDF invoice: ${error.message}. Please check the console for details.`);
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center py-8 relative overflow-hidden">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center relative z-10 overflow-hidden">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center py-8 relative overflow-hidden">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center relative z-10 overflow-hidden">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Order</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-200">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Show success state with order details
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center py-8 relative">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center relative z-10">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-4 shadow-lg">
          <CheckIcon className="h-8 w-8 text-white" />
        </div>


        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Order Confirmed! 🎉
        </h1>
        
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Thank you for your purchase! We've received your order and will begin processing it right away.
        </p>

        {/* Order Details - One item per row */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-base flex items-center">
            <GiftIcon className="w-5 h-5 mr-2 text-purple-600" />
            Order Details
          </h3>
          <div className="space-y-0 text-sm">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Order ID:</span>
              <span className="font-semibold text-gray-900">#{orderDetails?.number || orderDetails?.id || orderId || 'N/A'}</span>
              </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Date:</span>
              <span className="font-semibold text-gray-900">
                {orderDetails?.date ? 
                  new Date(orderDetails.date).toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                  }) : 
                  new Date().toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                  })
                }
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-green-600 capitalize">{orderDetails?.status || 'Processing'}</span>
              </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-gray-900">{formatPrice(parseFloat(orderDetails?.total) || 0)}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-base flex items-center">
            <CreditCardIcon className="w-5 h-5 mr-2 text-blue-600" />
            Payment Details
          </h3>
          <div className="space-y-0 text-sm">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900">{orderDetails?.paymentMethod || 'Credit Card'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-semibold text-green-600 capitalize">{orderDetails?.paymentStatus || 'Paid'}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Customer Email:</span>
              <span className="font-semibold text-gray-900">{orderDetails?.billing?.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - In one row */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={handleDownloadInvoice}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>Invoice</span>
          </button>

          <Link
            href="/products"
            className="flex-1 flex items-center justify-center space-x-2 bg-black text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            <ShoppingBagIcon className="w-4 h-4" />
            <span>Shop More</span>
          </Link>
          
          <Link
            href="/"
            className="flex-1 flex items-center justify-center space-x-2 bg-white text-gray-700 py-2 px-4 rounded-lg font-medium text-sm border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            Need help? Contact our support team
          </p>
          <div className="flex items-center justify-center space-x-3 text-xs">
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800 font-medium">
              support@example.com
            </a>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">+91 98765 43210</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
