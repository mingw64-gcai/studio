import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-historical-data.ts';
import '@/ai/flows/generate-heatmap-overlay.ts';
import '@/ai/flows/analyze-image-for-crowds.ts';
import '@/ai/flows/analyze-map-location.ts';
