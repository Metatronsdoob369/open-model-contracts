import * as anime_module from 'animejs'

// Deep-probe the module for the core metabolic function.
let anime: any = anime_module;

// Handle the various ESM/CJS "Shatter" patterns
if (typeof (anime as any).default === 'function') {
  anime = (anime as any).default;
} 
else if ((anime as any).default && typeof (anime as any).default.default === 'function') {
  anime = (anime as any).default.default;
}
else if (typeof (anime as any).anime === 'function') {
  anime = (anime as any).anime;
}

export default anime;
