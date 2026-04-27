const env = require('./src/config/env');
const app = require('./src/app');

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Tu Tiendita backend running on port ${PORT}`);
});
