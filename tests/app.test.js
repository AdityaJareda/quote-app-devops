// ============================================
// IMPORTS
// ============================================

// Import the app (our Express server)
const app = require('../src/app');

// Import supertest (for testing HTTP endpoints)
const request = require('supertest');

// ============================================
// TEST SUITE: API ENDPOINTS
// ============================================

describe('Quote App API Tests', () => {
  
  // ==========================================
  // HEALTH CHECK ENDPOINT TESTS
  // ==========================================
  
  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      // Make GET request to /health
      const response = await request(app)
        .get('/health')
        .expect(200)              // Expect HTTP 200 status
        .expect('Content-Type', /json/); // Expect JSON response
      
      // Check response body properties
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('quotesLoaded');
    });
  });
  
  // ==========================================
  // GET ALL QUOTES TESTS
  // ==========================================
  
  describe('GET /api/quotes', () => {
    it('should return all quotes with pagination', async () => {
      const response = await request(app)
        .get('/api/quotes')
        .expect(200)
        .expect('Content-Type', /json/);
      
      // Verify response structure
      expect(response.body).toHaveProperty('quotes');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalPages');
      
      // Verify quotes is an array
      expect(Array.isArray(response.body.quotes)).toBe(true);
      
      // Verify we have quotes
      expect(response.body.quotes.length).toBeGreaterThan(0);
    });
    
    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/quotes?page=1&limit=5')
        .expect(200);
      
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(5);
      expect(response.body.quotes.length).toBeLessThanOrEqual(5);
    });
  });
  
  // ==========================================
  // GET RANDOM QUOTE TESTS
  // ==========================================
  
  describe('GET /api/quotes/random', () => {
    it('should return a random quote', async () => {
      const response = await request(app)
        .get('/api/quotes/random')
        .expect(200)
        .expect('Content-Type', /json/);
      
      // Verify quote structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('author');
      expect(response.body).toHaveProperty('category');
      
      // Verify types
      expect(typeof response.body.id).toBe('number');
      expect(typeof response.body.text).toBe('string');
      expect(typeof response.body.author).toBe('string');
      expect(typeof response.body.category).toBe('string');
    });
    
    it('should return different quotes on multiple calls', async () => {
      // Get first quote
      const response1 = await request(app).get('/api/quotes/random');
      
      // Get second quote
      const response2 = await request(app).get('/api/quotes/random');
      
      // They should both be valid quotes
      expect(response1.body).toHaveProperty('id');
      expect(response2.body).toHaveProperty('id');
      
      // Note: They might be the same by chance, so we just verify structure
    });
  });
  
  // ==========================================
  // GET QUOTE BY ID TESTS
  // ==========================================
  
  describe('GET /api/quotes/:id', () => {
    it('should return a specific quote by ID', async () => {
      const response = await request(app)
        .get('/api/quotes/1')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body.id).toBe(1);
      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('author');
    });
    
    it('should return 404 for non-existent quote', async () => {
      const response = await request(app)
        .get('/api/quotes/99999')
        .expect(404)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Quote not found');
    });
  });
  
  // ==========================================
  // GET QUOTES BY CATEGORY TESTS
  // ==========================================
  
  describe('GET /api/quotes/category/:category', () => {
    it('should return quotes for a valid category', async () => {
      const response = await request(app)
        .get('/api/quotes/category/motivation')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('category', 'motivation');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('quotes');
      expect(Array.isArray(response.body.quotes)).toBe(true);
      expect(response.body.quotes.length).toBeGreaterThan(0);
    });
    
    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/quotes/category/nonexistent')
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
    });
  });
  
  // ==========================================
  // GET ALL CATEGORIES TESTS
  // ==========================================
  
  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBeGreaterThan(0);
    });
  });
  
  // ==========================================
  // POST NEW QUOTE TESTS
  // ==========================================
  
  describe('POST /api/quotes', () => {
    it('should create a new quote with valid data', async () => {
      const newQuote = {
        text: 'Test quote for testing',
        author: 'Test Author',
        category: 'testing'
      };
      
      const response = await request(app)
        .post('/api/quotes')
        .send(newQuote)
        .expect(201)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.text).toBe(newQuote.text);
      expect(response.body.author).toBe(newQuote.author);
      expect(response.body.category).toBe(newQuote.category);
    });
    
    it('should return 400 if text is missing', async () => {
      const invalidQuote = {
        author: 'Test Author'
        // text is missing
      };
      
      const response = await request(app)
        .post('/api/quotes')
        .send(invalidQuote)
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
    
    it('should return 400 if author is missing', async () => {
      const invalidQuote = {
        text: 'Test quote'
        // author is missing
      };
      
      const response = await request(app)
        .post('/api/quotes')
        .send(invalidQuote)
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });
  
  // ==========================================
  // 404 HANDLER TEST
  // ==========================================
  
  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('error', 'Route not found');
      expect(response.body).toHaveProperty('path', '/non-existent-route');
    });
  });
  
});
