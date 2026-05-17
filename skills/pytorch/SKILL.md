---
name: pytorch
description: Deep learning framework for building and training neural networks. Use when creating CNN, RNN, Transformer, or custom architectures, training models with GPU acceleration, implementing custom loss functions, or optimizing with autograd. Trigger on imports of torch, torchvision, torchaudio, nn.Module, or mentions of neural network training, GPU, CUDA, tensor operations.
---
# pytorch

Use this skill for deep learning model development.

## Core patterns

- **Model**: Subclass `nn.Module`, define `__init__` and `forward()`.
- **Training loop**: Forward → loss → `loss.backward()` → `optimizer.step()` → `optimizer.zero_grad()`.
- **Data**: `Dataset` + `DataLoader(shuffle=True, num_workers=4, pin_memory=True)`.
- **GPU**: `tensor.to(device)`, `model.to(device)`. Check `torch.cuda.is_available()`.
- **Saving**: `torch.save(model.state_dict(), path)` / `model.load_state_dict(torch.load(path))`.

## Rules

- Use `torch.no_grad()` context during inference and evaluation.
- Set `model.eval()` before validation; `model.train()` before training.
- Use `nn.Sequential` for simple stacks; custom `forward()` for complex architectures.
- Learning rate scheduling: call `scheduler.step()` after `optimizer.step()`.
- Mixed precision: `torch.amp.autocast('cuda')` + `GradScaler` for faster training.

## Anti-patterns

- Don't forget `optimizer.zero_grad()` — gradients accumulate by default.
- Don't use `.item()` inside training loop on large tensors — only for scalar metrics.
- Don't hardcode device — always use `device = 'cuda' if torch.cuda.is_available() else 'cpu'`.
