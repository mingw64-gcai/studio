import { config } from 'dotenv';
config();

import '@/ai/flows/generate-heatmap-overlay.ts';
import '@/ai/flows/analyze-image-for-crowds.ts';
import '@/ai/flows/analyze-map-location.ts';
import '@/ai/flows/find-person-in-crowd.ts';
import '@/ai/flows/solve-crowd-problem.ts';
import '@/ai/flows/analyze-crowd-image.ts';
