import * as vscode from "vscode";

export interface LocatedSymbol extends vscode.DocumentSymbol {
  location: vscode.Location;
}

export class SymbolInfo {
  public readonly symbol: LocatedSymbol;

  public static async create(symbol: LocatedSymbol): Promise<SymbolInfo> {
    const createdSymbolInfo = new SymbolInfo(symbol);
    return createdSymbolInfo;
  }

  public static async getSymbol(location: vscode.Location): Promise<LocatedSymbol> {
    const documentSymbols =
      (await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        "vscode.executeDocumentSymbolProvider",
        location.uri
      )) ?? [];

    const findSymbol = (
      symbols: vscode.DocumentSymbol[]
    ): vscode.DocumentSymbol | undefined => {
      for (const symbol of symbols) {
        if (symbol.range.start.isEqual(location.range.start)) {
          return symbol;
        }
        const child = findSymbol(symbol.children || []);
        if (child) {
          return child;
        }
      }
      return undefined;
    };

    const found = findSymbol(documentSymbols);
    if (!found) {
      throw new Error("Symbol not found");
    }

    return { ...found, location } as LocatedSymbol;
  }

  private constructor(symbol: LocatedSymbol) {
    this.symbol = symbol;

    if (
      this.symbol.kind !== vscode.SymbolKind.Class &&
      this.symbol.kind !== vscode.SymbolKind.Struct &&
      this.symbol.kind !== vscode.SymbolKind.Interface
    ) {
      throw new Error("Expected struct or interface");
    }
  }
}
