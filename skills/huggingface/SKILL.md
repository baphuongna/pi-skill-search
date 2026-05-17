---
name: huggingface
description: Machine learning model hub and transformer inference. Use when loading pretrained models, running NLP tasks, text generation, image classification, or working with transformers, tokenizers, and model hubs. Trigger on imports of transformers, datasets, torch, or mentions of BERT, GPT, fine-tuning, NLP, model hub, scikit, sklearn.
---
# huggingface

Use this skill for working with pretrained ML models and transformers.

## Core patterns

- **Pipeline**: `pipeline('text-classification', model='bert-base-uncased')` for quick inference.
- **Tokenizer + Model**: `AutoTokenizer.from_pretrained()` + `AutoModelForSequenceClassification.from_pretrained()`.
- **Fine-tuning**: `Trainer(model, args, train_dataset, eval_dataset)` with `TrainingArguments`.
- **Datasets**: `load_dataset('squad')` for benchmark datasets.
- **GPU**: `model = model.to('cuda')` + `inputs = tokenizer(text, return_tensors='pt').to('cuda')`.

## Rules

- Always specify `revision` when loading models in production — default `main` can change.
- Use `torch.no_grad()` for inference to save memory.
- Tokenize with `truncation=True, max_length=512` to prevent oversized inputs.
- For custom training, implement `compute_metrics()` for evaluation during training.

## Anti-patterns

- Don't load models without checking GPU memory — large models OOM silently.
- Don't use `pipeline()` without specifying model — defaults change between versions.
- Don't fine-tune on raw text — tokenize and format as Dataset first.

