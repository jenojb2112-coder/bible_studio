module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js$": "<rootDir>/tests/mocks/firebase-app.js",
    "^https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js$": "<rootDir>/tests/mocks/firebase-auth.js",
    "^https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js$": "<rootDir>/tests/mocks/firebase-firestore.js",
  }
};
