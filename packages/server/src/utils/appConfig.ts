import fs from 'fs';
import path from 'path';

import { ROOT_DIR } from '../constants/fs';

const data = fs.readFileSync(path.join(ROOT_DIR, 'appConfig.json'), 'utf-8');

export default JSON.parse(data);
