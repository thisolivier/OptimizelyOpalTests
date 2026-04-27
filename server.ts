import 'reflect-metadata';
import express from 'express';
import { ToolsService } from '@optimizely-opal/opal-tools-sdk';
import hello from './src/hello';

const app = express();
app.use(express.json());

new ToolsService(app);
require('./src/tool_convert_temperature');
require('./src/tool_preview_cms');

app.use('/api', hello);

const port: number = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
