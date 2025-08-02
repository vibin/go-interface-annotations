import type { LocatedSymbol } from "./SymbolInfo";

export class Annotation {
  public constructor(
    public readonly from: LocatedSymbol,
    public readonly to: Array<LocatedSymbol>
  ) {}
}
