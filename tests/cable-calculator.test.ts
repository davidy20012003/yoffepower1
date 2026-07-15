import * as assert from "node:assert/strict";
import {
  airTemperatureFactors,
  ampacityTables,
  groundTemperatureFactors,
  groundThermalResistivityFactors,
  groupingFactors
} from "../src/cable-calculator/regulation-data";
import { calculateCable, validateInput } from "../src/cable-calculator/calculate";
import type { CalculatorInput } from "../src/cable-calculator/types";

const base: CalculatorInput = {
  cableKind: "multicore",
  material: "copper",
  section: 16,
  parallelCount: 1,
  environment: "air",
  methodId: "dalet-wall-conduit-multicore",
  insulation: "70",
  phase: "three",
  ambientTemperature: 35,
  table4Arrangement: "bundled",
  groupCount: 1,
  protectionType: "mcb",
  breakerRating: 50
};

function result(input: Partial<CalculatorInput>) {
  return calculateCable({ ...base, ...input });
}

function cellCount() {
  let count = 0;
  for (const rows of Object.values(ampacityTables)) {
    for (const row of rows) {
      count += Number.isFinite(row.copperSingle) ? 1 : 0;
      count += Number.isFinite(row.copperThree) ? 1 : 0;
      count += Number.isFinite(row.aluminiumSingle) ? 1 : 0;
      count += Number.isFinite(row.aluminiumThree) ? 1 : 0;
    }
  }
  return count;
}

assert.equal(Object.keys(ampacityTables).length, 16, "all 70.1-70.8 and 90.1-90.8 Iz tables are present");
assert.equal(cellCount(), 852, "all numeric Iz cells from the 16 tables are represented");

for (const [tableNumber, rows] of Object.entries(ampacityTables)) {
  assert.ok(rows.length > 0, `${tableNumber} has rows`);
  for (const row of rows) {
    assert.ok(Number.isFinite(row.section), `${tableNumber} section is numeric`);
    assert.ok(Number.isFinite(row.copperSingle), `${tableNumber} copper single-phase value exists at ${row.section}`);
    assert.ok(Number.isFinite(row.copperThree), `${tableNumber} copper three-phase value exists at ${row.section}`);
    if (row.section >= 6 || tableNumber.endsWith(".8")) {
      assert.ok(Number.isFinite(row.aluminiumSingle), `${tableNumber} aluminium single-phase value exists at ${row.section}`);
      assert.ok(Number.isFinite(row.aluminiumThree), `${tableNumber} aluminium three-phase value exists at ${row.section}`);
    }
  }
}

assert.equal(result({}).iz, 58, "Table 70.4 copper three-phase, 16 mm²");
assert.equal(result({ material: "aluminium" }).iz, 45, "Table 70.4 aluminium three-phase, 16 mm²");
assert.equal(result({ cableKind: "singleCore", methodId: "gimel-wall-conduit-single" }).iz, 64, "Table 70.3 copper three-phase, 16 mm²");
assert.equal(
  result({
    environment: "ground",
    methodId: "lamed-ground-conduit",
    insulation: "90",
    section: 150,
    ambientTemperature: 30,
    spacing: "25cm",
    groupCount: 1,
    table4Arrangement: undefined
  }).iz,
  252,
  "Table 90.6 copper three-phase, 150 mm² returns 252"
);
assert.equal(
  result({
    methodId: "yod-bet-wall-surface",
    insulation: "90",
    section: 185,
    phase: "single",
    material: "copper"
  }).iz,
  486,
  "Table 90.5 copper single-phase, 185 mm²"
);

assert.deepEqual(airTemperatureFactors["70"], {
  10: 1.3,
  15: 1.24,
  20: 1.19,
  25: 1.13,
  30: 1.06,
  35: 1,
  40: 0.93,
  45: 0.84,
  50: 0.76,
  55: 0.65,
  60: 0.53
});
assert.deepEqual(airTemperatureFactors["90"], {
  10: 1.2,
  15: 1.17,
  20: 1.13,
  25: 1.08,
  30: 1.04,
  35: 1,
  40: 0.95,
  45: 0.91,
  50: 0.85,
  55: 0.79,
  60: 0.74,
  65: 0.68,
  70: 0.6,
  75: 0.52,
  80: 0.43
});
assert.deepEqual(groundTemperatureFactors["70"], {
  10: 1.24,
  15: 1.18,
  20: 1.12,
  25: 1.07,
  30: 1,
  35: 0.94,
  40: 0.87,
  45: 0.8,
  50: 0.71,
  55: 0.62,
  60: 0.51
});
assert.deepEqual(groundTemperatureFactors["90"], {
  10: 1.15,
  15: 1.12,
  20: 1.08,
  25: 1.03,
  30: 1,
  35: 0.96,
  40: 0.91,
  45: 0.86,
  50: 0.82,
  55: 0.76,
  60: 0.7,
  65: 0.65,
  70: 0.57,
  75: 0.49,
  80: 0.41
});
assert.deepEqual(groundThermalResistivityFactors, { 1: 1.18, 1.5: 1.1, 2: 1.05, 2.5: 1, 3: 0.96 });

assert.equal(result({ groupCount: 3, table4Arrangement: "bundled" }).groupingFactor, 0.7, "Table 4 bundled row is applied");
assert.equal(result({ groupCount: 3, table4Arrangement: "wallFloorTray" }).groupingFactor, 0.79, "Table 4 wall/floor/tray row is applied");
assert.equal(result({ groupCount: 3, table4Arrangement: "ceiling" }).groupingFactor, 0.72, "Table 4 ceiling row is applied");
assert.equal(result({ groupCount: 3, table4Arrangement: "perforatedTray" }).groupingFactor, 0.82, "Table 4 perforated tray row is applied");
assert.equal(result({ groupCount: 3, table4Arrangement: "ladderSupports" }).groupingFactor, 0.82, "Table 4 ladder/support row is applied");
assert.equal(groupingFactors.table5.de[2], 0.8, "Table 5 symbolic De spacing is represented");

assert.equal(
  result({
    environment: "ground",
    methodId: "lamed-aleph-direct-ground",
    ambientTemperature: 30,
    spacing: "25cm",
    groupCount: 3,
    table4Arrangement: undefined
  }).groupingTable,
  "טבלה 5",
  "direct burial uses Table 5"
);
assert.equal(
  result({
    cableKind: "singleCore",
    environment: "ground",
    methodId: "lamed-ground-conduit",
    ambientTemperature: 30,
    spacing: "25cm",
    groupCount: 3,
    table4Arrangement: undefined
  }).groupingTable,
  "טבלה 6",
  "single-core cables/conductor sets in buried conduits use Table 6"
);
assert.equal(
  result({
    environment: "ground",
    methodId: "lamed-ground-conduit",
    ambientTemperature: 30,
    spacing: "25cm",
    groupCount: 3,
    table4Arrangement: undefined
  }).groupingTable,
  "טבלה 7",
  "multicore cables in buried conduits use Table 7"
);

assert.equal(result({ methodId: "yod-het-building-void", vCategory: "large", table4Arrangement: "bundled" }).izTable, "טבלה 70.3");
assert.equal(result({ methodId: "yod-het-building-void", vCategory: "small", table4Arrangement: "bundled" }).izTable, "טבלה 70.4");

assert.equal(
  result({
    environment: "ground",
    methodId: "lamed-ground-conduit",
    ambientTemperature: 30,
    spacing: "25cm",
    groupCount: 1,
    table4Arrangement: undefined
  }).groundFactor,
  1,
  "ground thermal resistivity is fixed to 2.5 K·m/W with factor 1.00"
);

assert.equal(validateInput({ ...base, parallelCount: 3, groupCount: 2 }).length, 1, "group count cannot be lower than parallel count");
assert.equal(validateInput({ ...base, table4Arrangement: undefined }).length, 1, "Table 4 requires an arrangement row");
assert.equal(validateInput({ ...base, breakerRating: 4001 }).length, 1, "breaker rating is capped at 4000 A");

assert.equal(result({ breakerRating: 50 }).breakerPass, true, "passing circuit breaker selection");
assert.equal(result({ breakerRating: 80 }).inPass, false, "failure when In exceeds corrected current");
assert.equal(result({ protectionType: "mcb", breakerRating: 70 }).i2Pass, false, "failure when I2 condition is not satisfied");

console.log("Cable calculator tests passed");
