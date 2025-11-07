module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/data/**',
    '!node_modules/**'
  ],
  
  // Coverage thresholds
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  
  // Verbose output
  verbose: true
};
