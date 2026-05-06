// Local development entry point. 
// For Vercel deployment, see api/index.js
const app = require('./api/index');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
