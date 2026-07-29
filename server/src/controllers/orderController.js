import Order from '../models/Order.js';

// @desc    Get all orders
// @route   GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get order tracking info
// @route   GET /api/orders/:id/tracking
export const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!order.trackingNumber || !order.courierName) {
      return res.status(400).json({ message: 'Tracking information not available for this order' });
    }

    const { getTrackingInfo } = await import('../services/trackingService.js');
    const tracking = await getTrackingInfo(order.courierName, order.trackingNumber);

    res.json({
      orderNumber: order.orderNumber,
      courierName: order.courierName,
      trackingNumber: order.trackingNumber,
      tracking,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tracking', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const oldStatus = order.status;
    const newStatus = req.body.status || order.status;
    order.status = newStatus;

    if (newStatus === 'delivered') {
      order.deliveredAt = new Date();
    }

    if (oldStatus !== newStatus) {
      order.timeline = order.timeline || [];
      order.timeline.push({
        status: newStatus,
        timestamp: new Date(),
        description: req.body.description || `Order status changed to ${newStatus.replace(/_/g, ' ')}`,
      });
    }

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
