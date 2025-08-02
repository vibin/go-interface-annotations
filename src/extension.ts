import * as vscode from "vscode";
import { AnnotationLensProvider } from "./AnnotateLensProvider";

export const output = vscode.window.createOutputChannel(
  "Go Interface Annotations"
);

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(output);
  output.appendLine("Go Interface Annotations activated");

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      [{ language: "go" }],
      new AnnotationLensProvider()
    )
  );
}

export function deactivate() {}
