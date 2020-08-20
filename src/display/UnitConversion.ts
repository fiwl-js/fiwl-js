import DisplayManager from "./DisplayManager";

// WARNING: These constants currently static because of JS limitation.
//          Future development uses low-level request to get DPI and PPI.
//
// Standardized constants:
const PPI = 72;
const DPI = 96;

// Pixel unit is main unit of Render Engine
const PX = 1;

// Get dynamic constant functions for conversion relative to PX:
function getPT(): number {
  return (PX * PPI) / DPI;
}
function getDP(): number {
  return PX * DisplayManager.getScale();
}
function getSP(): number {
  return getPT() * DisplayManager.getScale();
}
function getPercent(factor: number): number {
  return 0.01 * factor * PX;
}
function getVW(): number {
  return getPercent(DisplayManager.getWidth());
}
function getVH(): number {
  return getPercent(DisplayManager.getHeight());
}

// Dynamic constants below are not available because PPI and DPI are static.
// Therefore, the results will be inaccurate.
/* function getIN():number { return getPX() / PPI; }  **
 * function getMM():number { return getIN() * 25.4; } *
 ** function getCM():number { return getCM() * 0.1; }  */

function convert(value: number, fromUnit: number, toUnit: number = PX): number {
  return (value * fromUnit) / toUnit;
}

function getUnit(value: string) {
  for (let iter = 0; iter < value.length; iter++) {
    const eachChar = value[iter];
    if (isNaN(parseFloat(eachChar)) && eachChar != ".") {
      return value.substr(iter).trim();
    }
  }
  return "";
}

function resolve(value: string | number, percentFactor: number = 100): number {
  switch (typeof value) {
    case "string":
      const numValue: number = parseFloat(value);
      if (isNaN(numValue)) {
        throw new SyntaxError(`"${value}" is not a valid value`);
      }
      const unit: string = getUnit(value);
      switch (unit) {
        case "":
          return numValue;
        case "px":
          return numValue;
        case "dp":
          return convert(numValue, getDP());
        case "pt":
          return convert(numValue, getPT());
        case "sp":
          return convert(numValue, getSP());
        case "%":
          return convert(numValue, getPercent(percentFactor));
        case "vw":
          return convert(numValue, getVW());
        case "vh":
          return convert(numValue, getVH());
        default:
          throw new SyntaxError(`"${value}" has invalid unit`);
      }
    case "number":
      return value;
    default:
      return NaN;
  }
}

export default {
  convert: convert,
  resolve: resolve,
  typesGetters: {
    PX: () => {
      return PX;
    },
    DP: getDP,
    PT: getPT,
    SP: getSP,
    percent: getPercent,
    VW: getVW,
    VH: getVH,
  },
};
