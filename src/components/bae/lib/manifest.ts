// Single source of truth for which model + autoencoder the frontend is pointed
// at. Written by ``uv run dashboard <weights> --repoint`` (see
// ``src/cli/dashboard.py``). Splitting this out from the data-fetching helpers
// lets the rest of the app import "what we are looking at" without dragging in
// HTTP machinery, and vice versa.
import manifest from "./manifest.json";

// HF model facts, read at repoint time from ``transformers.AutoConfig``. The
// navbar's *model* hover surfaces these — describe what we're hooking *into*,
// not the AE we trained on top.
interface ModelFacts {
  d_model: number;
  layers: number;
  vocab: number;
  ctx: number;
}

// Declared subset of the training Config — only what the navbar renders. The Python side
// (``cli/dashboard.py:repoint()``) cherry-picks these fields explicitly so a rename in
// ``autoencoders.Config`` doesn't silently leak into the frontend.
interface AutoencoderConfig {
  layer: number;
  kind: string;
  hook: string;
  d_model: number;
  d_latent: number;
  hoyer: number;
}

export const BASE: string = manifest.base;
export const NAME: string = manifest.name;

// Human-readable labels for the navbar breadcrumb + page titles.
export const BASE_DISPLAY: string = manifest.base_display ?? manifest.base;
export const NAME_DISPLAY: string = manifest.name_display
  ?? manifest.name.replace(/^production\//, "");

// Model facts for the model hover; AE knobs for the AE hover. See interfaces above.
export const MODEL: ModelFacts = manifest.model;
export const AE_CONFIG: AutoencoderConfig = manifest.config;
