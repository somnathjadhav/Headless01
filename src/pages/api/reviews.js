import { wooCommerceAPI } from '../../lib/woocommerce';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('Review submission request received:', {
      body: req.body,
      headers: req.headers
    });

    const { product_id, rating, review, reviewer, reviewer_email } = req.body;

    // Validate required fields
    if (!product_id || !rating || !review || !reviewer || !reviewer_email) {
      console.log('Validation failed - missing required fields:', {
        product_id: !!product_id,
        rating: !!rating,
        review: !!review,
        reviewer: !!reviewer,
        reviewer_email: !!reviewer_email
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reviewer_email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Create review data for WooCommerce
    const reviewData = {
      product_id: parseInt(product_id),
      review: review.trim(),
      reviewer: reviewer.trim(),
      reviewer_email: reviewer_email.trim(),
      rating: parseInt(rating),
      status: 'approved' // Auto-approve reviews
    };

    console.log('Submitting review to WooCommerce:', reviewData);

    // Submit review to WooCommerce using the new method
    const response = await wooCommerceAPI.createProductReview(reviewData);

    console.log('WooCommerce API response:', response);

    if (response) {
      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        review: response
      });
    } else {
      throw new Error('Invalid response from WooCommerce API');
    }

  } catch (error) {
    console.error('Error submitting review:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      stack: error.stack
    });
    
    // Handle specific WooCommerce API errors
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 400) {
        return res.status(400).json({
          success: false,
          message: data.message || 'Invalid review data',
          details: data
        });
      } else if (status === 404) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      } else if (status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - API credentials invalid'
        });
      } else if (status === 403) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden - Insufficient permissions'
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit review. Please try again later.',
      error: error.message
    });
  }
}
