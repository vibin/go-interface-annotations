import * as vscode from "vscode";
import { Annotation } from "./Annotation";
import { AnnotationLens } from "./AnnotationLens";
import { SymbolInfo, LocatedSymbol } from "./SymbolInfo";

export class AnnotationLensProvider
  implements vscode.CodeLensProvider<AnnotationLens>
{
  public async provideCodeLenses(
    document: vscode.TextDocument
  ): Promise<vscode.CodeLens[]> {
    const goSymbols = await this.getGoSymbols(document);

    const results: AnnotationLens[] = [];
    for (const goSymbol of goSymbols) {
      const symbolInfo = await SymbolInfo.create(goSymbol);

      const locations =
        (await this.getSymbolLocations(document, symbolInfo)) ?? [];
      const symbols = await Promise.all(locations.map(SymbolInfo.getSymbol));
      if (symbols.length === 0) {
        continue;
      }

      const annotation = new Annotation(symbolInfo.symbol, symbols);
      results.push(new AnnotationLens(annotation));
    }

    return results;
  }

  private async getSymbolLocations(
    document: vscode.TextDocument,
    si: SymbolInfo
  ): Promise<vscode.Location[]> {
    return vscode.commands.executeCommand<vscode.Location[]>(
      "vscode.executeImplementationProvider",
      document.uri,
      si.symbol.location.range.start
    );
  }

  private async getGoSymbols(
    document: vscode.TextDocument
  ): Promise<LocatedSymbol[]> {
    const symbols =
      (await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        "vscode.executeDocumentSymbolProvider",
        document.uri
      )) ?? [];

    const flatten = (sym: vscode.DocumentSymbol[]): vscode.DocumentSymbol[] =>
      sym.flatMap((s) => [s, ...flatten(s.children || [])]);

    return flatten(symbols)
      .filter(
        (symbol) =>
          symbol.kind === vscode.SymbolKind.Class ||
          symbol.kind === vscode.SymbolKind.Struct ||
          symbol.kind === vscode.SymbolKind.Interface
      )
      .map(
        (symbol) => ({
          ...symbol,
          location: new vscode.Location(document.uri, symbol.range),
        }) as LocatedSymbol
      );
  }
}
