const express = require('express');
const cors = require('cors');
require('dotenv').config();

const restaurantRoutes = require('./routes/restaurants');
const reviewRoutes = require('./routes/reviews');
const { readJsonFile } = require('./utils/fileManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🍜 Restaurant Review API',
    version: '1.0.0',
    endpoints: {
      restaurants: '/api/restaurants',
      reviews: '/api/reviews',
      stats: '/api/stats'
    }
  });
});

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);

// ========================================
// GET /api/stats - ดึงสถิติทั้งหมด
// ========================================
app.get('/api/stats', async (req, res) => {
  try {
    // 1) อ่านข้อมูล restaurants.json และ reviews.json
    const restaurants = await readJsonFile('restaurants.json');
    const reviews = await readJsonFile('reviews.json');

    // 2) คำนวณสถิติรวม
    const totalRestaurants = restaurants.length;
    const totalReviews = reviews.length;

    // ค่าเฉลี่ยจาก "ทุกรีวิว" (ไม่ใช่เฉลี่ยของเฉลี่ย) ปัดเศษ 1 ตำแหน่ง
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + (parseInt(r.rating) || 0), 0) / totalReviews) * 10
          ) / 10
        : 0;

    // 3) หา Top 5 ร้าน (เฉพาะร้านที่มีรีวิว) เรียง: rating สูง → จำนวนรีวิวมาก → ชื่อ
    const topRatedRestaurants = [...restaurants]
      .filter(r => (r.totalReviews || 0) > 0)
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
        if ((b.totalReviews || 0) !== (a.totalReviews || 0)) return (b.totalReviews || 0) - (a.totalReviews || 0);
        return (a.name || '').localeCompare(b.name || '');
      })
      .slice(0, 5)
      .map(({ id, name, averageRating, totalReviews, category, priceRange }) => ({
        id, name, averageRating, totalReviews, category, priceRange
      }));

    // 4) ส่งผลลัพธ์
    res.json({
      success: true,
      data: {
        totalRestaurants,
        totalReviews,
        averageRating,
        topRatedRestaurants
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ'
    });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});
