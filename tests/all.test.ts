import assert from 'node:assert/strict';
import { safeEvaluate, tokenize } from '../src/utils/mathParser';
import { formatBolivares, formatUSD, formatEUR, parseCurrencyInput } from '../src/utils/formatters';
import { validateRatePayload } from '../src/services/exchangeRateService';

console.log('🧪 Ejecutando suite de pruebas de VALORA...\n');

// 1. CALCULATOR TESTS
console.log('1. Pruebas de la Calculadora Matemática Segura:');

// Basic addition
{
  const res = safeEvaluate('2 + 2');
  assert.equal(res.success, true);
  assert.equal(res.value, 4);
  console.log('  ✔ Suma básica (2 + 2 = 4)');
}

// Precedence
{
  const res = safeEvaluate('150 + 25 * 2');
  assert.equal(res.success, true);
  assert.equal(res.value, 200);
  console.log('  ✔ Precedencia de operadores (150 + 25 * 2 = 200)');
}

// Subtraction and division
{
  const res = safeEvaluate('100 - 20 / 4');
  assert.equal(res.success, true);
  assert.equal(res.value, 95);
  console.log('  ✔ Resta y división (100 - 20 / 4 = 95)');
}

// Parentheses
{
  const res = safeEvaluate('(10 + 5) * 2');
  assert.equal(res.success, true);
  assert.equal(res.value, 30);
  console.log('  ✔ Paréntesis ((10 + 5) * 2 = 30)');
}

// Nested Parentheses
{
  const res = safeEvaluate('((2 + 3) * 4) + 10');
  assert.equal(res.success, true);
  assert.equal(res.value, 30);
  console.log('  ✔ Paréntesis anidados (((2 + 3) * 4) + 10 = 30)');
}

// Financial Percentages: 100 + 20% -> 120
{
  const res = safeEvaluate('100 + 20%');
  assert.equal(res.success, true);
  assert.equal(res.value, 120);
  console.log('  ✔ Porcentaje incremento (100 + 20% = 120)');
}

// Financial Percentages: 100 - 20% -> 80
{
  const res = safeEvaluate('100 - 20%');
  assert.equal(res.success, true);
  assert.equal(res.value, 80);
  console.log('  ✔ Porcentaje descuento (100 - 20% = 80)');
}

// Financial Percentages: 500 * 10% -> 50
{
  const res = safeEvaluate('500 * 10%');
  assert.equal(res.success, true);
  assert.equal(res.value, 50);
  console.log('  ✔ Porcentaje multiplicación (500 * 10% = 50)');
}

// Standalone Percent: 20% -> 0.2
{
  const res = safeEvaluate('20%');
  assert.equal(res.success, true);
  assert.equal(res.value, 0.2);
  console.log('  ✔ Porcentaje aislado (20% = 0.2)');
}

// Division by zero
{
  const res = safeEvaluate('100 / 0');
  assert.equal(res.success, false);
  assert.match(res.error || '', /dividir entre cero/i);
  console.log('  ✔ Detección de división por cero');
}

// Decimals
{
  const res = safeEvaluate('10.5 + 2.5');
  assert.equal(res.success, true);
  assert.equal(res.value, 13);
  console.log('  ✔ Operaciones con decimales (10.5 + 2.5 = 13)');
}

// Empty expression
{
  const res = safeEvaluate('');
  assert.equal(res.success, true);
  assert.equal(res.value, 0);
  console.log('  ✔ Entrada vacía manejada con valor 0');
}

// 2. CONVERSION AND FORMATTING TESTS
console.log('\n2. Pruebas de Conversión y Formato Monetario Venezolano:');

// Bolívares formatting with thousands dots and comma
{
  const formatted = formatBolivares(82010.5);
  assert.equal(formatted, 'Bs. 82.010,50');
  console.log('  ✔ Formato venezolano miles y decimales (82010.50 -> Bs. 82.010,50)');
}

// Large amount
{
  const formatted = formatBolivares(10000000);
  assert.equal(formatted, 'Bs. 10.000.000,00');
  console.log('  ✔ Cantidad grande (10.000.000 -> Bs. 10.000.000,00)');
}

// Small amount
{
  const formatted = formatBolivares(0.05);
  assert.equal(formatted, 'Bs. 0,05');
  console.log('  ✔ Cantidad pequeña (0.05 -> Bs. 0,05)');
}

// USD formatting
{
  const formatted = formatUSD(100, true, 'USD');
  assert.equal(formatted, 'USD 100,00');
  console.log('  ✔ Formato USD (100 -> USD 100,00)');
}

// EUR formatting
{
  const formatted = formatEUR(100, true, 'EUR');
  assert.equal(formatted, 'EUR 100,00');
  const symbolFormatted = formatEUR(100, true, '€');
  assert.equal(symbolFormatted, '€ 100,00');
  console.log('  ✔ Formato EUR (100 -> EUR 100,00 y € 100,00)');
}

// Conversion test: USD 100 at rate 820.10 -> 82010.00
{
  const rate = 820.10;
  const usd = 100;
  const ves = usd * rate;
  assert.equal(ves, 82010);
  assert.equal(formatBolivares(ves), 'Bs. 82.010,00');
  console.log('  ✔ Conversión USD -> VES a tasa 820.10 ($100 -> Bs. 82.010,00)');
}

// Conversion test: EUR 100 at current live BCV rate 954.0244 -> 95402.44
{
  const eurRate = 954.0244;
  const eur = 100;
  const ves = Math.round(eur * eurRate * 100) / 100;
  assert.equal(ves, 95402.44);
  assert.equal(formatBolivares(ves), 'Bs. 95.402,44');
  console.log('  ✔ Conversión EUR -> VES a tasa BCV oficial 954.0244 (€100 -> Bs. 95.402,44)');
}

// Conversion test: EUR 100 at rate 947.30 -> 94730.00
{
  const eurRate = 947.30;
  const eur = 100;
  const ves = eur * eurRate;
  assert.equal(ves, 94730);
  assert.equal(formatBolivares(ves), 'Bs. 94.730,00');
  console.log('  ✔ Conversión EUR -> VES a tasa 947.30 (€100 -> Bs. 94.730,00)');
}

// Inverse Conversion test: 94730 VES / 947.30 -> 100 EUR
{
  const eurRate = 947.30;
  const ves = 94730;
  const eur = ves / eurRate;
  assert.equal(eur, 100);
  assert.equal(formatEUR(eur), '€ 100,00');
  console.log('  ✔ Conversión inversa VES -> EUR (Bs. 94.730,00 / 947.30 -> € 100,00)');
}

// Inverse Conversion test: 82010 VES / 820.10 -> 100 USD
{
  const rate = 820.10;
  const ves = 82010;
  const usd = ves / rate;
  assert.equal(usd, 100);
  assert.equal(formatUSD(usd), '$ 100,00');
  console.log('  ✔ Conversión inversa VES -> USD (Bs. 82.010,00 / 820.10 -> $ 100,00)');
}

// Input parsing with commas and dots
{
  assert.equal(parseCurrencyInput('1.250,50'), 1250.5);
  assert.equal(parseCurrencyInput('100.50'), 100.5);
  assert.equal(parseCurrencyInput('Bs. 82.010,00'), 82010);
  assert.equal(parseCurrencyInput('$ 150,00'), 150);
  assert.equal(parseCurrencyInput('€ 150,00'), 150);
  console.log('  ✔ Parseo flexible de entradas con comas, puntos y símbolos ($, €, Bs.)');
}

// 3. BCV RATE VALIDATION AND FALLBACK TESTS
console.log('\n3. Pruebas de Validación de Tasa BCV:');

// Valid payload
{
  const valid = validateRatePayload({ rate: 820.1018, effectiveDate: '09/09/2026' });
  assert.equal(valid, true);
  console.log('  ✔ Validación positiva de tasa oficial numérica');
}

// Invalid payload: zero or negative
{
  assert.equal(validateRatePayload({ rate: 0 }), false);
  assert.equal(validateRatePayload({ rate: -50 }), false);
  assert.equal(validateRatePayload({ rate: null }), false);
  assert.equal(validateRatePayload({}), false);
  console.log('  ✔ Rechazo estricto de tasas cero, negativas o nulas');
}

console.log('\n✨ Todas las pruebas completadas con éxito sin fallos.');
