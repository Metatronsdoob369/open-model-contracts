"""
director_launch.py  —  Director Agent v0 Smoke Test
─────────────────────────────────────────────────────
Does everything in one shot:
  1. Creates your HF dataset repo  (Joe-C-Wales/director-training-data)
  2. Uploads director_dataset_train.jsonl to it
  3. Submits the training job to HF Jobs (t4-small, ~20 min)

FROM YOUR TERMINAL, run these two commands:

    pip3 install "huggingface_hub[cli]>=0.23"
    python3 director_launch.py

You'll be prompted for your HF token if it's not already saved.
Get one at https://huggingface.co/settings/tokens  (needs Write permission)
"""

import os, sys, textwrap
from pathlib import Path

# ── 1. Check deps ─────────────────────────────────────────────────────────────
try:
    from huggingface_hub import (
        HfApi, create_repo, whoami,
        get_token, run_uv_job,
    )
except ImportError:
    print('\n  pip3 install "huggingface_hub[cli]>=0.23"\n')
    sys.exit(1)

# ── 2. Authenticate ───────────────────────────────────────────────────────────
token = get_token()
if not token:
    print("\nNot logged in. Running: hf auth login")
    os.system("hf auth login")
    token = get_token()
    if not token:
        print("Login failed. Get a token at https://huggingface.co/settings/tokens")
        sys.exit(1)

me = whoami(token=token)["name"]
print(f"\n✓ Logged in as: {me}")

# ── 3. Config ─────────────────────────────────────────────────────────────────
DATASET_REPO   = f"{me}/director-training-data"
MODEL_OUT_REPO = f"{me}/director-agent-v0"
BASE_MODEL     = "Qwen/Qwen2.5-Coder-7B-Instruct"
JSONL_FILE     = Path(__file__).parent / "director_dataset_train.jsonl"

if not JSONL_FILE.exists():
    print(f"\n✗ Missing: {JSONL_FILE.name}")
    print("  Make sure director_dataset_train.jsonl is in the same folder as this script.")
    sys.exit(1)

api = HfApi(token=token)

# ── 4. Create dataset repo ────────────────────────────────────────────────────
print(f"\n[1/3] Creating dataset repo: {DATASET_REPO}")
create_repo(DATASET_REPO, repo_type="dataset", private=True,
            token=token, exist_ok=True)
print(f"      ✓ https://huggingface.co/datasets/{DATASET_REPO}")

# ── 5. Upload JSONL ───────────────────────────────────────────────────────────
print(f"\n[2/3] Uploading training data...")
api.upload_file(
    path_or_fileobj=str(JSONL_FILE),
    path_in_repo="train.jsonl",
    repo_id=DATASET_REPO,
    repo_type="dataset",
    commit_message="Director v0 smoke-test — ProfileService pairs",
)
n = JSONL_FILE.read_text().strip().count("\n") + 1
print(f"      ✓ {n} training pairs live at huggingface.co/datasets/{DATASET_REPO}")

# ── 6. Training script (inline — submitted directly to HF Jobs) ───────────────
TRAINING_SCRIPT = textwrap.dedent(f"""
    # /// script
    # dependencies = [
    #   "trl>=0.12.0",
    #   "peft>=0.7.0",
    #   "transformers>=4.40.0",
    #   "datasets>=2.18.0",
    #   "torch>=2.2.0",
    #   "trackio",
    #   "bitsandbytes>=0.43.0",
    # ]
    # ///

    import os
    from datasets import load_dataset
    from peft import LoraConfig
    from trl import SFTTrainer, SFTConfig

    DATASET_REPO   = "{DATASET_REPO}"
    MODEL_OUT_REPO = "{MODEL_OUT_REPO}"
    BASE_MODEL     = "{BASE_MODEL}"

    print(f"Loading dataset: {{DATASET_REPO}}")
    dataset = load_dataset(DATASET_REPO, split="train")
    print(f"Loaded {{len(dataset)}} examples | columns: {{dataset.column_names}}")

    trainer = SFTTrainer(
        model=BASE_MODEL,
        train_dataset=dataset,
        peft_config=LoraConfig(
            r=16, lora_alpha=32,
            target_modules=["q_proj", "v_proj"],
            lora_dropout=0.05, bias="none",
            task_type="CAUSAL_LM",
        ),
        args=SFTConfig(
            output_dir="director-agent-v0",
            num_train_epochs=3,
            per_device_train_batch_size=1,
            gradient_accumulation_steps=4,
            gradient_checkpointing=True,
            learning_rate=2e-4,
            lr_scheduler_type="cosine",
            warmup_ratio=0.1,
            max_length=2048,
            logging_steps=1,
            save_strategy="epoch",
            push_to_hub=True,
            hub_model_id=MODEL_OUT_REPO,
            report_to="none",
            run_name="director-v0-smoketest",
        ),
    )

    print("Training Director v0...")
    trainer.train()
    trainer.push_to_hub()
    print(f"\\n✓ Model pushed → https://huggingface.co/{{MODEL_OUT_REPO}}")
""").strip()

# ── 7. Submit job ─────────────────────────────────────────────────────────────
import tempfile

print(f"\n[3/3] Submitting training job to HF Jobs (t4-small)...")

# Newer huggingface_hub requires a file path, not an inline string
with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as tmp:
    tmp.write(TRAINING_SCRIPT)
    tmp_path = tmp.name

job = run_uv_job(
    script=tmp_path,
    flavor="t4-small",
    timeout=1800,           # 30 minutes
    secrets={"HF_TOKEN": token},
)

print(f"""
┌─────────────────────────────────────────────────────────┐
│  ✅  Director v0 smoke test submitted!                  │
├─────────────────────────────────────────────────────────┤
│  Job ID  : {job.id:<45}│
│  Monitor : https://huggingface.co/jobs/{me}/{job.id:<{max(1,44-len(me))}}│
│  Model   : https://huggingface.co/{MODEL_OUT_REPO:<{max(1,51-len(MODEL_OUT_REPO))}}│
├─────────────────────────────────────────────────────────┤
│  Expected time : ~20 minutes                            │
│  Loss will overfit (expected with 5 pairs) — that's ok  │
│  Come back here and I'll read the logs for you          │
└─────────────────────────────────────────────────────────┘
""")
