import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [totalRevenue, lastMonthRevenue, totalOrders, lastMonthOrders, totalCustomers, lastMonthCustomers, totalProducts] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.countDocuments({ status: { $ne: 'cancelled' } }),
      Order.countDocuments({ status: { $ne: 'cancelled' }, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      Product.countDocuments(),
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const lastRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueChange = lastRevenue > 0 ? Math.round(((revenue - lastRevenue) / lastRevenue) * 100) : 0;

    const orderChange = lastMonthOrders > 0 ? Math.round(((totalOrders - lastMonthOrders) / lastMonthOrders) * 100) : 0;
    const customerChange = lastMonthCustomers > 0 ? Math.round(((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100) : 0;

    res.json({
      revenue: { value: revenue, change: revenueChange, up: revenueChange >= 0 },
      orders: { value: totalOrders, change: orderChange, up: orderChange >= 0 },
      customers: { value: totalCustomers, change: customerChange, up: customerChange >= 0 },
      products: { value: totalProducts, change: 0, up: false },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getSalesTrend = async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('en-US', { month: 'short' }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
      });
    }

    const data = await Promise.all(months.map(async (m) => {
      const result = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: m.start, $lte: m.end } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]);
      return { name: m.name, sales: result[0]?.total || 0 };
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.name', totalSold: { $sum: '$orderItems.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);
    res.json(data.map(d => ({ name: d._id, sold: d.totalSold })));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getOrderStatus = async (req, res) => {
  try {
    const total = await Order.countDocuments();
    if (total === 0) {
      return res.json([
        { status: 'delivered', count: 0, percentage: 0, color: '#2D5016' },
        { status: 'shipped', count: 0, percentage: 0, color: '#3498DB' },
        { status: 'processing', count: 0, percentage: 0, color: '#D4AF37' },
        { status: 'placed', count: 0, percentage: 0, color: '#C41E3A' },
      ]);
    }

    const statusColors = {
      delivered: '#2D5016', shipped: '#3498DB', processing: '#D4AF37',
      confirmed: '#9B59B6', placed: '#C41E3A', cancelled: '#666666', out_for_delivery: '#E67E22',
    };

    const data = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(data.map(d => ({
      status: d._id,
      count: d.count,
      percentage: Math.round((d.count / total) * 100),
      color: statusColors[d._id] || '#666666',
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json(orders.map(o => ({
      id: o.orderNumber || `#${o._id.toString().slice(-6).toUpperCase()}`,
      customer: o.user ? `${o.user.firstName} ${o.user.lastName}`.trim() : o.shippingAddress?.fullName || 'Guest',
      total: o.totalPrice,
      status: o.status,
      date: o.createdAt,
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const now = new Date();
    let startDate;

    switch (period) {
      case '7d': startDate = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now - 90 * 24 * 60 * 60 * 1000); break;
      case '365d': startDate = new Date(now - 365 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }

    const matchStage = { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } };

    const [revenueTrend, productRevenue, customerCount, orderCount, totalRevenue, avgOrderValue] = await Promise.all([
      Order.aggregate([
        { $match: matchStage },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
        }},
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: matchStage },
        { $unwind: '$orderItems' },
        { $group: {
          _id: '$orderItems.name',
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        }},
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(matchStage),
      Order.aggregate([
        { $match: matchStage },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.aggregate([
        { $match: matchStage },
        { $group: { _id: null, avg: { $avg: '$totalPrice' } } },
      ]),
    ]);

    const totalRev = totalRevenue[0]?.total || 0;
    const avg = avgOrderValue[0]?.avg || 0;

    res.json({
      revenueTrend: revenueTrend.map(d => ({ date: d._id, revenue: d.revenue })),
      productRevenue: productRevenue.map(d => ({ name: d._id, revenue: d.revenue })),
      keyMetrics: {
        totalRevenue: totalRev,
        avgOrderValue: Math.round(avg),
        totalOrders: orderCount,
        totalCustomers: customerCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
