const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../eos_env.env") });
const app = require("./app");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
