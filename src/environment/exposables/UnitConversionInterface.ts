import ParamsTemplate from "../ParamsTemplate";
import UnitConversion from "../../display/UnitConversion";

/** Interfaces with FIWL's built-in Unit Conversion */
export default interface UnitConversionInterface {
  /**
   *  Scale a number based on two units
   *
   *  @param fromUnit Use app.unit.Types.*
   *  @param toUnit Use app.unit.Types.*, default is app.unit.Types.PX
   */
  convert: (value: number, fromUnit: number, toUnit?: number) => number;

  /**
   *  Resolve unit suffix of a string then convert it to px
   *
   *  @param percentFactor If value is percent: result = value * percentFactor / 100, with default percentFactor is 100.
   */
  resolve: (value: string | number, percentFactor?: number) => number;

  /** Collection of each unit relatives to px unit, use this for app.unit.convert(...) parameters */
  Types: UnitsPreset;
}

interface UnitsPreset {
  PX: number;
  DP: number;
  PT: number;
  SP: number;
  VW: number;
  VH: number;
  percent: (factor: number) => number;
}

export const name = "unit";

export const bind = async (
  _params: ParamsTemplate
): Promise<UnitConversionInterface> => {
  const unitsPreset: UnitsPreset = {
    PX: 1,
    DP: 1,
    PT: 1,
    SP: 1,
    VW: 1,
    VH: 1,
    percent: UnitConversion.typesGetters.percent,
  };
  Object.defineProperty(unitsPreset, "PX", {
    get: UnitConversion.typesGetters.PX,
  });
  Object.defineProperty(unitsPreset, "DP", {
    get: UnitConversion.typesGetters.DP,
  });
  Object.defineProperty(unitsPreset, "PT", {
    get: UnitConversion.typesGetters.PT,
  });
  Object.defineProperty(unitsPreset, "SP", {
    get: UnitConversion.typesGetters.SP,
  });
  Object.defineProperty(unitsPreset, "VW", {
    get: UnitConversion.typesGetters.VW,
  });
  Object.defineProperty(unitsPreset, "VH", {
    get: UnitConversion.typesGetters.VH,
  });

  const conversion: UnitConversionInterface = {
    convert: UnitConversion.convert,
    resolve: UnitConversion.resolve,
    Types: Object.freeze(unitsPreset),
  };

  return Object.freeze(conversion);
};
