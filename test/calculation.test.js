const calc = require('../actions/calculations');
const test_array = ['$1','$2','$3'];

/***  DCF Calculations  ***/
test('Calculate DFC', () => {
    expect(calc.dcf(5.07, 0.1464, 0.04, 0.12, 10, 10))
        .toStrictEqual({"fair_value": "$101.31", "growth_value": "$57.76", "terminal_value": "$43.55"});
});

test('Create DCF saving string', () => {
    expect(calc.multi_dfc_string(test_array))
        .toBe('stock_id=$1 OR stock_id=$2 OR stock_id=$3');
});

test('create Aggregation String', () => {
    expect(calc.createAggregationString(test_array))
        .toBe('$1, $2, $3');
});
/***  Value Calculator Tests  ***/

test('Test for OverEvaluation', () => {
    expect(calc.value_calculator(10, 20))
        .toBe('OverValued');
});

test('Test for UnderEvaluation', () => {
    expect(calc.value_calculator(20, 10))
        .toBe('UnderValued');
});

test('Test for expected Evaluation', () => {
    expect(calc.value_calculator(15, 15))
        .toBe('Expected');
});

test('Test for no Evaluation', () => {
    expect(calc.value_calculator('null', 15))
        .toBe(null);
});

// calculate_default_growth_func
test('Test for valid default growth value', () => {
    expect(calc.calculate_default_growth_func(15, 5.07, 1.2))
    .toBe(10.08);
});

test('Test for invalid default growth value', () => {
    expect(calc.calculate_default_growth_func(10, 2.08, -0.165))
    .toBe(null);
});

// initial_values_calc
test('test for valid initial values calc', () => {
    expect(calc.initial_values_calc(15, 0.07, -0.09, 0.04, 0.12, 10, 10))
    .toStrictEqual({"fair_value": "$0.55", "growth_value": "$0.4", "terminal_value": "$0.15"});
});

