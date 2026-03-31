import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CompletionParams, Provider, ProviderResponse } from "./types";

function extractLastNonEmptyLine(text: string): string {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.at(-1) ?? "";
}

export class CodexProvider implements Provider {
  readonly name = "codex";

  constructor(
    private readonly model: string,
    private readonly workdir: string,
  ) {}

  async complete(params: CompletionParams): Promise<ProviderResponse> {
    const prompt = params.messages.map((message) => `${message.role}\n${message.content}`).join("\n\n");
    const tmpBase = mkdtempSync(join(tmpdir(), "aether-codex-"));
    const outputPath = join(tmpBase, "last-message.txt");

    const proc = Bun.spawn(
      [
        "codex",
        "exec",
        "--skip-git-repo-check",
        "-C",
        this.workdir,
        "-s",
        "workspace-write",
        "-m",
        params.model ?? this.model,
        "-o",
        outputPath,
        "-",
      ],
      {
        cwd: this.workdir,
        stdin: "pipe",
        stdout: "pipe",
        stderr: "pipe",
      },
    );

    proc.stdin.write(prompt);
    proc.stdin.end();

    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    if (exitCode !== 0) {
      throw new Error(`Codex exec failed (${exitCode}): ${stderr || stdout}`.trim());
    }

    const fileText = await Bun.file(outputPath).text();
    const content = fileText.trim() || extractLastNonEmptyLine(stdout);

    if (!content) {
      throw new Error("Codex exec returned no final message");
    }

    return {
      content,
      model: params.model ?? this.model,
      provider: this.name,
      tokensIn: 0,
      tokensOut: 0,
    };
  }
}
