// ============================================
// IMPORTS - Bringing in external libraries
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ============================================
// APP INITIALIZATION
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================
// DATA LOADING
// ============================================

const quotes = require('./data/quotes.json');

// ============================================
// API ROUTES
// ============================================

/**
 * Health Check Endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    quotesLoaded: quotes.length
  });
});

/**
 * Get All Quotes (with pagination)
 * GET /api/quotes?page=1&limit=11
 */
app.get('/api/quotes', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 11;
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedQuotes = quotes.slice(startIndex, endIndex);
  
  res.json({
    page: page,
    limit: limit,
    total: quotes.length,
    totalPages: Math.ceil(quotes.length / limit),
    quotes: paginatedQuotes
  });
});

/**
 * Get Random Quote
 * GET /api/quotes/random
 */
app.get('/api/quotes/random', (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  res.json(randomQuote);
});

/**
 * Get Quote by ID
 * GET /api/quotes/:id
 */
app.get('/api/quotes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const quote = quotes.find(q => q.id === id);
  
  if (quote) {
    res.json(quote);
  } else {
    res.status(404).json({
      error: 'Quote not found',
      id: id
    });
  }
});

/**
 * Get Quotes by Category
 * GET /api/quotes/category/:category
 */
app.get('/api/quotes/category/:category', (req, res) => {
  const category = req.params.category.toLowerCase();
  const filteredQuotes = quotes.filter(
    q => q.category.toLowerCase() === category
  );
  
  if (filteredQuotes.length > 0) {
    res.json({
      category: category,
      count: filteredQuotes.length,
      quotes: filteredQuotes
    });
  } else {
    res.status(404).json({
      error: 'No quotes found for this category',
      category: category
    });
  }
});

/**
 * Get All Categories
 * GET /api/categories
 */
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(quotes.map(q => q.category))];
  res.json({
    count: categories.length,
    categories: categories
  });
});

/**
 * Add New Quote
 * POST /api/quotes
 */
app.post('/api/quotes', (req, res) => {
  const { text, author, category } = req.body;
  
  if (!text || !author) {
    return res.status(400).json({
      error: 'Text and author are required'
    });
  }
  
  const newQuote = {
    id: quotes.length + 1,
    text: text,
    author: author,
    category: category || 'general'
  };
  
  quotes.push(newQuote);
  res.status(201).json(newQuote);
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// ============================================
// SERVER START
// ============================================

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log(`Quote App Server Running`);
    console.log(`Port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Total Quotes: ${quotes.length}`);
    console.log('=================================');
    console.log(`\nAPI Endpoints:`);
    console.log(`   Health:     http://localhost:${PORT}/health`);
    console.log(`   All Quotes: http://localhost:${PORT}/api/quotes`);
    console.log(`   Random:     http://localhost:${PORT}/api/quotes/random`);
    console.log(`   By ID:      http://localhost:${PORT}/api/quotes/1`);
    console.log(`   Category:   http://localhost:${PORT}/api/quotes/category/motivation`);
    console.log(`\nFrontend:   http://localhost:${PORT}\n`);
  });
}

module.exports = app;
