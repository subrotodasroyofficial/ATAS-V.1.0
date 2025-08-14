# Custom LLM Scaffold

This project lets you fine-tune a small base language model on your own instruction-style data and run inference locally.

## Quickstart

1) Create a virtual environment and install deps

```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

2) Train on the sample dataset (replace with your data later)

```bash
python src/train.py \
  --base_model sshleifer/tiny-gpt2 \
  --dataset_path data/sample_instructions.jsonl \
  --output_dir outputs/tiny-gpt2-custom \
  --num_train_epochs 1 \
  --per_device_train_batch_size 4 \
  --learning_rate 5e-5
```

3) Run inference

```bash
python src/generate.py \
  --model_path outputs/tiny-gpt2-custom \
  --prompt "Write a haiku about the sea."
```

## Data format

Training data is JSONL with one example per line. Supported keys:
- `instruction` (required)
- `input` (optional)
- `output` or `response` or `answer` (one required)

Example (`data/sample_instructions.jsonl`):

```json
{"instruction": "Write a haiku about the sea.", "output": "Endless blue whispers\nFoam-kissed shores breathe ancient songs\nGulls stitch sky with wind"}
{"instruction": "Translate 'Hello' to Spanish.", "output": "Hola"}
{"instruction": "Explain what Python is in one sentence.", "output": "Python is a high-level, general-purpose programming language known for its readability and vast ecosystem."}
```

## Prompt template used

During training and inference the prompt is formatted as:

```
Instruction: {instruction}
[optional] Input: {input}
Response:
```

The model is trained to generate the `Response:`. Only the response portion contributes to the loss.

## Notes and next steps

- Start with `sshleifer/tiny-gpt2` for fast iteration. When ready, swap `--base_model` to a larger model (e.g., `TinyLlama/TinyLlama-1.1B-Chat-v1.0`) and consider parameter-efficient finetuning (LoRA) to reduce memory. 
- If you want LoRA later, we can extend the trainer to use PEFT.
- For instruction/RAG use-cases, couple this with retrieval; we can scaffold a simple RAG reader if needed.
