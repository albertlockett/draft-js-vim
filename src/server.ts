import * as express from 'express';
import * as path from 'path';

console.log("attempt to start server!");

const PORT = process.env.PORT || 9001;

const app = express();
const routes = ['/', '/index.html', '/bundle.js'];
app.get(routes, express.static(path.resolve(__dirname, '..', 'docbase')));

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});

