# Ntent

Ntent is a strict, intent-driven Python coding engine for VS Code. Instead of relying on cloud APIs, Ntent runs entirely on local compute using Ollama, providing instant scaffolding, refactoring, and terminal diagnostics directly inside your editor.

## Features

*   **Architecture Scaffolding (`Shift + Alt + N`)**: Trigger the command, type your specific technical intent (e.g., "FastAPI server with SQLite connection pool"), and Ntent will inject the compiled code directly at your cursor.
*   **OOP Extraction (Highlight + Code Action)**: Select a block of messy procedural Python, click the VS Code lightbulb (or trigger the command), and Ntent will instantly refactor the logic into a clean, typed Object-Oriented class.
*   **Terminal Diagnostics (Command Palette)**: Copy a terminal Traceback error to your clipboard and run the Ntent Diagnose command. It cross-references the error with your active file and opens a split-screen markdown document pointing out the exact point of failure with corrected code.
*   **Vague Intent Rejection**: Built-in system safeguards refuse vague prompts (e.g., "make an app"), forcing specific, framework-level architectural requests to guarantee production-ready output.

## Prerequisites

Ntent requires a local LLM engine running in the background.

1. Install [Ollama](https://ollama.com/).
2. Pull the Qwen 2.5 Coder model:
   ```bash
   ollama run qwen2.5-coder:1.5b

   ### Automated One-Click Install (Windows / PowerShell)
If you are modifying the extension, you do not need to manually package and install it through the GUI. Just run the deployment script in your terminal:

```powershell
.\install.ps1