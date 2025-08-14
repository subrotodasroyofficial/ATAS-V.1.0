import argparse
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


def build_prompt(instruction: str, input_text: str = "") -> str:
    parts = [f"Instruction: {instruction.strip()}"]
    if input_text.strip():
        parts.append(f"Input: {input_text.strip()}")
    parts.append("Response:")
    return "\n".join(parts).strip()


def generate_once(model_path: str, instruction: str, input_text: str = "", max_new_tokens: int = 128, temperature: float = 0.7, top_p: float = 0.9) -> str:
    tokenizer = AutoTokenizer.from_pretrained(model_path, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(model_path)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()

    prompt = build_prompt(instruction, input_text)
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to(device)

    with torch.no_grad():
        output_ids = model.generate(
            input_ids=input_ids,
            max_new_tokens=max_new_tokens,
            do_sample=temperature > 0.0,
            temperature=temperature,
            top_p=top_p,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

    # Decode only the generated part
    gen_ids = output_ids[0, input_ids.shape[1]:]
    text = tokenizer.decode(gen_ids, skip_special_tokens=True)
    return text.strip()


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate text from a fine-tuned model.")
    parser.add_argument("--model_path", type=str, required=True)
    parser.add_argument("--prompt", type=str, default="")
    parser.add_argument("--input", dest="input_text", type=str, default="")
    parser.add_argument("--max_new_tokens", type=int, default=128)
    parser.add_argument("--temperature", type=float, default=0.7)
    parser.add_argument("--top_p", type=float, default=0.9)
    args = parser.parse_args()

    if args.prompt:
        output = generate_once(
            model_path=args.model_path,
            instruction=args.prompt,
            input_text=args.input_text,
            max_new_tokens=args.max_new_tokens,
            temperature=args.temperature,
            top_p=args.top_p,
        )
        print(output)
    else:
        print("Interactive mode. Type 'quit' to exit.")
        while True:
            try:
                user = input("You: ").strip()
            except EOFError:
                break
            if not user or user.lower() in {"quit", "exit"}:
                break
            output = generate_once(
                model_path=args.model_path,
                instruction=user,
                input_text="",
                max_new_tokens=args.max_new_tokens,
                temperature=args.temperature,
                top_p=args.top_p,
            )
            print(f"Model: {output}\n")


if __name__ == "__main__":
    main()