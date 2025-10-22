const express = require('express');
const router = express.Router();
const { readJsonFile } = require('../utils/fileManager');

// ========================================
// GET /api/restaurants - ดึงรายการร้านทั้งหมด (พร้อม filtering)
// ========================================
router.get('/', async (req, res) => {
  try {
    let restaurants = await readJsonFile('restaurants.json');
    const { search, category, minRating, priceRange } = req.query;
    
    // TODO 1: กรองตามชื่อ (search)
    if (search) {
      const searchLower = String(search).toLowerCase();
      restaurants = restaurants.filter(r => 
        (r.name && r.name.toLowerCase().includes(searchLower)) ||
        (r.description && r.description.toLowerCase().includes(searchLower))
      );
    }
    
    // TODO 2: กรองตามหมวดหมู่ (category)
    if (category) {
      restaurants = restaurants.filter(r => r.category === category);
    }
    
    // TODO 3: กรองตาม rating ขั้นต่ำ (minRating)
    if (minRating) {
      const min = parseFloat(minRating);
      if (!isNaN(min)) {
        restaurants = restaurants.filter(r => (r.averageRating || 0) >= min);
      }
    }
    
    // TODO 4: กรองตามช่วงราคา (priceRange)
    if (priceRange) {
      const pr = parseInt(priceRange);
      if (!isNaN(pr)) {
        restaurants = restaurants.filter(r => parseInt(r.priceRange) === pr);
      }
    }
    
    res.json({
      success: true,
      data: restaurants,
      total: restaurants.length,
      filters: {
        search: search || null,
        category: category || null,
        minRating: minRating || null,
        priceRange: priceRange || null
      }
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลร้าน'
    });
  }
});

// ========================================
// GET /api/restaurants/:id - ดึงข้อมูลร้านตาม ID พร้อมรีวิว
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1) อ่านไฟล์
    const restaurants = await readJsonFile('restaurants.json');
    const reviews = await readJsonFile('reviews.json');

    // 2) หา restaurant ตาม id
    const restaurant = restaurants.find(r => r.id === parseInt(id));
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบร้านอาหารนี้'
      });
    }

    // 4) กรองรีวิวของร้านนี้ และ 5) เรียงจากใหม่สุด -> เก่าสุด
    const restaurantReviews = reviews
      .filter(r => r.restaurantId === parseInt(id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 6) ส่งข้อมูลกลับ
    res.json({
      success: true,
      data: {
        ...restaurant,
        reviews: restaurantReviews
      }
    });
    
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลร้าน'
    });
  }
});

module.exports = router;
