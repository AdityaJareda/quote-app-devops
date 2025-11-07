// ============================================
// CONFIGURATION & GLOBAL VARIABLES
// ============================================

// Get the VM's IP address dynamically or use localhost
// When testing from Windows, you'll need to update this to your VM IP
const API_URL = window.location.origin; // Uses current page's URL

// DOM Element References - Get all HTML elements we need
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteCategory = document.getElementById('quoteCategory');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const shareBtn = document.getElementById('shareBtn');
const totalQuotesElement = document.getElementById('totalQuotes');
const quotesViewedElement = document.getElementById('quotesViewed');
const categoryTagsContainer = document.getElementById('categoryTags');
const quoteCard = document.getElementById('quoteCard');

// State Variables - Track application state
let quotesViewed = 0;
let currentQuote = null;
let allCategories = [];

// ============================================
// INITIALIZATION - Run when page loads
// ============================================

/**
 * Initialize the application
 * This function runs as soon as the page loads
 */
function init() {
    console.log('🚀 Quote App Initialized');
    console.log('📡 API URL:', API_URL);
    
    // Load initial data
    getTotalQuotes();
    loadCategories();
    
    // Attach event listeners to buttons
    newQuoteBtn.addEventListener('click', getRandomQuote);
    shareBtn.addEventListener('click', shareQuote);
    
    // Load first quote automatically
    getRandomQuote();
}

// ============================================
// API FUNCTIONS - Communicate with backend
// ============================================

/**
 * Fetch a random quote from the API
 * This is the main feature of our app!
 */
async function getRandomQuote() {
    try {
        // Show loading state
        setLoadingState(true);
        
        // Make HTTP GET request to backend
        const response = await fetch(`${API_URL}/api/quotes/random`);
        
        // Check if request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse JSON response
        const quote = await response.json();
        
        // Store current quote
        currentQuote = quote;
        
        // Display the quote
        displayQuote(quote);
        
        // Update statistics
        quotesViewed++;
        quotesViewedElement.textContent = quotesViewed;
        
        console.log('✅ Quote loaded:', quote);
        
    } catch (error) {
        // Handle errors
        console.error('❌ Error fetching quote:', error);
        showError('Failed to load quote. Please check if the server is running.');
    } finally {
        // Always remove loading state (success or error)
        setLoadingState(false);
    }
}

/**
 * Get total number of quotes from API
 */
async function getTotalQuotes() {
    try {
        const response = await fetch(`${API_URL}/api/quotes?limit=1`);
        const data = await response.json();
        
        // Update the total count display
        totalQuotesElement.textContent = data.total;
        
        console.log('📊 Total quotes available:', data.total);
        
    } catch (error) {
        console.error('❌ Error getting total quotes:', error);
        totalQuotesElement.textContent = '?';
    }
}

/**
 * Load all categories from API
 */
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/api/categories`);
        const data = await response.json();
        
        allCategories = data.categories;
        displayCategories(data.categories);
        
        console.log('🏷️  Categories loaded:', data.categories);
        
    } catch (error) {
        console.error('❌ Error loading categories:', error);
    }
}

/**
 * Get quotes by category
 * @param {string} category - The category to filter by
 */
async function getQuoteByCategory(category) {
    try {
        setLoadingState(true);
        
        const response = await fetch(`${API_URL}/api/quotes/category/${category}`);
        const data = await response.json();
        
        if (data.quotes && data.quotes.length > 0) {
            // Pick a random quote from the category
            const randomIndex = Math.floor(Math.random() * data.quotes.length);
            const quote = data.quotes[randomIndex];
            
            currentQuote = quote;
            displayQuote(quote);
            
            quotesViewed++;
            quotesViewedElement.textContent = quotesViewed;
            
            console.log(`✅ Quote from category "${category}":`, quote);
        }
        
    } catch (error) {
        console.error('❌ Error fetching category quote:', error);
        showError(`No quotes found for category: ${category}`);
    } finally {
        setLoadingState(false);
    }
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

/**
 * Display a quote in the UI
 * @param {Object} quote - Quote object from API
 */
function displayQuote(quote) {
    // Update quote text with fade animation
    quoteCard.style.opacity = '0';
    
    setTimeout(() => {
        quoteText.textContent = quote.text;
        quoteAuthor.textContent = quote.author;
        quoteCategory.textContent = quote.category;
        
        // Fade back in
        quoteCard.style.opacity = '1';
    }, 300);
}

/**
 * Display category tags
 * @param {Array} categories - Array of category names
 */
function displayCategories(categories) {
    // Clear existing tags
    categoryTagsContainer.innerHTML = '';
    
    // Create a tag for each category
    categories.forEach(category => {
        const tag = document.createElement('span');
        tag.className = 'category-tag';
        tag.textContent = category;
        
        // Add click handler
        tag.addEventListener('click', () => {
            getQuoteByCategory(category);
        });
        
        categoryTagsContainer.appendChild(tag);
    });
}

/**
 * Set loading state for buttons and UI
 * @param {boolean} isLoading - Whether app is loading
 */
function setLoadingState(isLoading) {
    if (isLoading) {
        newQuoteBtn.disabled = true;
        newQuoteBtn.textContent = '⏳ Loading...';
        quoteCard.classList.add('loading');
    } else {
        newQuoteBtn.disabled = false;
        newQuoteBtn.textContent = '🔄 New Quote';
        quoteCard.classList.remove('loading');
    }
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    quoteText.textContent = message;
    quoteAuthor.textContent = '';
    quoteCategory.textContent = '';
}

/**
 * Share quote functionality
 * Creates a shareable text version of the current quote
 */
function shareQuote() {
    if (!currentQuote) {
        showToast('Load a quote first!', 'error');
        return;
    }
    
    // Create shareable text
    const shareText = `"${currentQuote.text}" — ${currentQuote.author}`;
    
    // Try to use Web Share API (modern browsers/mobile)
    if (navigator.share) {
        navigator.share({
            title: 'Quote of the Day',
            text: shareText,
            url: window.location.href
        })
        .then(() => {
            console.log('✅ Quote shared successfully');
            showToast('Quote shared!', 'success');
        })
        .catch(error => {
            console.log('❌ Share cancelled or failed');
        });
    } else {
        // Fallback: Copy to clipboard
        copyToClipboard(shareText);
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    // Select and copy
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('Quote copied to clipboard!', 'success');
        console.log('✅ Copied to clipboard');
    } catch (error) {
        showToast('Failed to copy', 'error');
        console.error('❌ Copy failed:', error);
    }
    
    // Remove textarea
    document.body.removeChild(textarea);
}

/**
 * Show a toast notification
 * @param {string} message - Message to show
 * @param {string} type - Type of toast (success/error)
 */
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#48bb78' : '#f56565';
    
    // Add to page
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', (event) => {
    // Space bar = New quote
    if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault(); // Prevent page scroll
        getRandomQuote();
    }
    
    // 'S' key = Share
    if (event.key === 's' || event.key === 'S') {
        if (event.target === document.body) {
            event.preventDefault();
            shareQuote();
        }
    }
});

// ============================================
// START THE APP
// ============================================

// Wait for page to fully load, then initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Log app info to console
console.log(`
╔══════════════════════════════════════╗
║      QUOTE APP - DEVOPS PROJECT      ║
╠══════════════════════════════════════╣
║     Frontend Loaded Successfully     ║
║     API: ${API_URL}                  ║
║     Keyboard Shortcuts:              ║
║     Space - New Quote                ║
║     S     - Share Quote              ║
╚══════════════════════════════════════╝
`);
