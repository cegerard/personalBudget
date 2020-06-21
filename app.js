'use strict';

import express from 'express';

const app = express();
const port = 8080; // TODO use config via env var

app.listen(port, () => console.log(`Application start on port ${port}`));