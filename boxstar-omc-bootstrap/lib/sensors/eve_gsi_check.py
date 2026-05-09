"""
EVE v1 GSI Gate — OMC Bridge 2
Reads JSON from stdin, runs TriadGAT diffusion_lock, outputs GSI result to stdout.

Usage:
  echo '{"landmarks_count": 68}' | conda run -n agents python eve_gsi_check.py

Output:
  {"gsi": 0.9712, "passed": true, "threshold": 0.95, "diagnostics": {...}}
"""

import sys
import json
import os

# Suppress torch/numpy warnings
os.environ["PYTHONWARNINGS"] = "ignore"

import warnings
warnings.filterwarnings("ignore")

import torch
import numpy as np

# Add eve_v1.py to path
EVE_PATH = os.path.join(
    os.path.dirname(__file__),
    "../../domicile_live/Skills/HK_101"
)
sys.path.insert(0, os.path.abspath(EVE_PATH))

from eve_v1 import TriadGATGraphRAG  # type: ignore


def run_gsi_check(landmarks_count: int = 68, seed: int = 42) -> dict:
    torch.manual_seed(seed)
    np.random.seed(seed)

    model = TriadGATGraphRAG(
        in_dim=3, hid=128, out=512, num_layers=4, heads=8, tau=0.87,
        num_traces=15, low_k=12, heat_tau=0.05, lambda_op=0.15
    )

    # Generate landmarks via model's extractor
    audio_mel = torch.randn(1, 80, 200)
    landmarks = model.extract_landmarks(audio_mel=audio_mel)
    
    # Build graph and embed (required for spectral features used in diffusion_lock)
    data = model.forge_graph(landmarks)
    h, g_global = model.embed_graph(data)

    # Run diffusion lock — this is where GSI is computed
    prompt_emb = torch.randn(512)
    enhanced_prompt, _ = model.rag_strike(prompt_emb, h, g_global)
    target_landmarks = torch.tensor(landmarks, dtype=torch.float)
    
    # The fix in eve_v1.py makes this reliable now
    _, gsi_score = model.diffusion_lock(enhanced_prompt, target_landmarks)

    diagnostics = model.get_triad_diagnostics()

    return {
        "gsi": round(float(gsi_score), 6),
        "passed": gsi_score > 0.95,
        "threshold": 0.95,
        "gate": "ARMED" if gsi_score > 0.95 else "SAFE-GATE LOCK",
        "engine": "TriadGAT (EVE v1)",
        "diagnostics": {
            "landmarks_used": len(landmarks),
            "tau_hess": round(float(diagnostics["current_tau_hess"]), 6),
            "avg_hessian_trace": round(float(diagnostics["avg_hessian_trace"]), 6),
            "avg_operator_norm": round(float(diagnostics["avg_operator_norm"]), 6),
            "eigenval_count": diagnostics["eigenval_count"],
        }
    }


if __name__ == "__main__":
    try:
        raw = sys.stdin.read().strip()
        payload = json.loads(raw) if raw else {}
        landmarks_count = payload.get("landmarks_count", 68)
        seed = payload.get("seed", 42)
        result = run_gsi_check(landmarks_count=landmarks_count, seed=seed)
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"gsi": 0.0, "passed": False, "threshold": 0.95, "gate": "SAFE-GATE LOCK", "error": str(e)}))
        sys.exit(1)
