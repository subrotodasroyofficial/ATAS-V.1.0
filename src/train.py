import argparse
import json
import os
import random
from dataclasses import dataclass
from typing import Dict, List, Optional

import torch
from torch.utils.data import Dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)


def seed_everything(seed: int) -> None:
    random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


@dataclass
class Example:
    prompt_text: str
    response_text: str


class InstructionJsonlDataset(Dataset):
    def __init__(
        self,
        jsonl_path: str,
        tokenizer: AutoTokenizer,
        max_length: int,
    ) -> None:
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.examples: List[Example] = []

        if not os.path.exists(jsonl_path):
            raise FileNotFoundError(f"Dataset not found: {jsonl_path}")

        with open(jsonl_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                data = json.loads(line)
                instruction = (data.get("instruction") or data.get("prompt") or "").strip()
                input_text = (data.get("input") or "").strip()
                response = (
                    data.get("output")
                    or data.get("response")
                    or data.get("answer")
                    or ""
                )
                response = str(response).strip()
                if not instruction or not response:
                    continue

                parts = [f"Instruction: {instruction}"]
                if input_text:
                    parts.append(f"Input: {input_text}")
                parts.append("Response:")
                prompt_text = "\n".join(parts).strip()

                self.examples.append(Example(prompt_text=prompt_text, response_text=response))

        if not self.examples:
            raise ValueError("No valid examples found in dataset.")

    def __len__(self) -> int:
        return len(self.examples)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        ex = self.examples[idx]
        tokenizer = self.tokenizer
        max_len = self.max_length

        prompt_ids = tokenizer(ex.prompt_text, add_special_tokens=False).input_ids

        # Ensure there is a space before response for better tokenization on GPT-style models
        response_with_eos = " " + ex.response_text.strip()
        if tokenizer.eos_token is not None:
            response_with_eos += tokenizer.eos_token
        response_ids = tokenizer(response_with_eos, add_special_tokens=False).input_ids

        # Fit into max_length by truncating the response first. If prompt itself is too long,
        # keep the tail of the prompt (rare for short prompts).
        if len(prompt_ids) + len(response_ids) > max_len:
            available_for_resp = max(0, max_len - len(prompt_ids))
            response_ids = response_ids[:available_for_resp]
        if len(prompt_ids) + len(response_ids) > max_len:
            overflow = len(prompt_ids) + len(response_ids) - max_len
            prompt_ids = prompt_ids[overflow:]

        input_ids = prompt_ids + response_ids
        attention_mask = [1] * len(input_ids)

        labels = input_ids.copy()
        prompt_len = len(prompt_ids)
        for i in range(prompt_len):
            labels[i] = -100

        return {
            "input_ids": torch.tensor(input_ids, dtype=torch.long),
            "attention_mask": torch.tensor(attention_mask, dtype=torch.long),
            "labels": torch.tensor(labels, dtype=torch.long),
        }


def make_collate_fn(tokenizer: AutoTokenizer):
    pad_id = tokenizer.pad_token_id if tokenizer.pad_token_id is not None else tokenizer.eos_token_id

    def collate(batch: List[Dict[str, torch.Tensor]]) -> Dict[str, torch.Tensor]:
        max_len = max(item["input_ids"].size(0) for item in batch)
        input_ids_list, attn_masks_list, labels_list = [], [], []
        for item in batch:
            seq_len = item["input_ids"].size(0)
            pad_len = max_len - seq_len
            if pad_len > 0:
                input_ids = torch.nn.functional.pad(item["input_ids"], (0, pad_len), value=pad_id)
                attn_mask = torch.nn.functional.pad(item["attention_mask"], (0, pad_len), value=0)
                labels = torch.nn.functional.pad(item["labels"], (0, pad_len), value=-100)
            else:
                input_ids = item["input_ids"]
                attn_mask = item["attention_mask"]
                labels = item["labels"]
            input_ids_list.append(input_ids)
            attn_masks_list.append(attn_mask)
            labels_list.append(labels)
        return {
            "input_ids": torch.stack(input_ids_list),
            "attention_mask": torch.stack(attn_masks_list),
            "labels": torch.stack(labels_list),
        }

    return collate


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fine-tune a causal LM on instruction data.")
    parser.add_argument("--base_model", type=str, default="sshleifer/tiny-gpt2")
    parser.add_argument("--dataset_path", type=str, default="data/sample_instructions.jsonl")
    parser.add_argument("--output_dir", type=str, default="outputs/tiny-gpt2-custom")
    parser.add_argument("--num_train_epochs", type=float, default=1.0)
    parser.add_argument("--per_device_train_batch_size", type=int, default=4)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=1)
    parser.add_argument("--learning_rate", type=float, default=5e-5)
    parser.add_argument("--weight_decay", type=float, default=0.0)
    parser.add_argument("--warmup_ratio", type=float, default=0.03)
    parser.add_argument("--max_length", type=int, default=256)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--save_steps", type=int, default=100)
    parser.add_argument("--logging_steps", type=int, default=10)
    parser.add_argument("--fp16", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    os.makedirs(args.output_dir, exist_ok=True)

    seed_everything(args.seed)

    tokenizer = AutoTokenizer.from_pretrained(args.base_model, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(args.base_model)

    train_dataset = InstructionJsonlDataset(
        jsonl_path=args.dataset_path,
        tokenizer=tokenizer,
        max_length=args.max_length,
    )

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=args.per_device_train_batch_size,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        num_train_epochs=args.num_train_epochs,
        learning_rate=args.learning_rate,
        weight_decay=args.weight_decay,
        warmup_ratio=args.warmup_ratio,
        logging_steps=args.logging_steps,
        save_steps=args.save_steps,
        bf16=False,
        fp16=args.fp16,
        dataloader_pin_memory=False,
        gradient_checkpointing=False,
        save_total_limit=2,
        report_to=[],
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        data_collator=make_collate_fn(tokenizer),
        tokenizer=tokenizer,
    )

    trainer.train()

    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    print(f"Model saved to: {args.output_dir}")


if __name__ == "__main__":
    main()