/**
 * Safe Mathematical Expression Evaluator for VALORA
 * 
 * Complies with strict security guidelines:
 * - NEVER uses eval() or Function()
 * - Strictly parses tokens and evaluates with correct operator precedence
 * - Handles percentage operations intuitively:
 *     100 + 20% -> 120
 *     100 - 20% -> 80
 *     500 * 10% -> 50
 *     50 / 10%  -> 500
 *     20%       -> 0.2
 * - Supports parentheses: (10 + 5) * 2 -> 30
 * - Detects division by zero with friendly localized errors
 */

type TokenType = 'NUMBER' | 'OPERATOR' | 'PERCENT' | 'LPAREN' | 'RPAREN';

interface Token {
  type: TokenType;
  value: string | number;
}

export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  // Normalize symbols
  const normalized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\s+/g, '');

  let i = 0;
  while (i < normalized.length) {
    const char = normalized[i];

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
    } else if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
    } else if (char === '%') {
      tokens.push({ type: 'PERCENT', value: '%' });
      i++;
    } else if (char === '+' || char === '*' || char === '/') {
      tokens.push({ type: 'OPERATOR', value: char });
      i++;
    } else if (char === '-') {
      // Could be negative number if preceded by operator, lparen, or at start
      const prev = tokens[tokens.length - 1];
      if (!prev || prev.type === 'OPERATOR' || prev.type === 'LPAREN') {
        // Unary minus: check if next is number or decimal
        let numStr = '-';
        i++;
        let hasDot = false;
        while (i < normalized.length && (/\d/.test(normalized[i]) || (normalized[i] === '.' && !hasDot))) {
          if (normalized[i] === '.') hasDot = true;
          numStr += normalized[i];
          i++;
        }
        if (numStr === '-') {
          // It's a unary negation of an expression or token
          tokens.push({ type: 'OPERATOR', value: '-' });
        } else {
          tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
        }
      } else {
        tokens.push({ type: 'OPERATOR', value: '-' });
        i++;
      }
    } else if (/\d/.test(char) || char === '.') {
      let numStr = '';
      let hasDot = false;
      while (i < normalized.length && (/\d/.test(normalized[i]) || (normalized[i] === '.' && !hasDot))) {
        if (normalized[i] === '.') hasDot = true;
        numStr += normalized[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
    } else {
      // Ignore unknown or skip
      i++;
    }
  }

  return tokens;
}

export interface EvalResult {
  success: boolean;
  value: number;
  error?: string;
}

/**
 * Evaluates tokens with intuitive percentages and mathematical precedence
 */
export function evaluateTokens(tokens: Token[]): EvalResult {
  if (tokens.length === 0) {
    return { success: true, value: 0 };
  }

  // First pass: Handle parentheses recursively
  const resolvedTokens: Token[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].type === 'LPAREN') {
      // Find matching RPAREN
      let depth = 1;
      const subTokens: Token[] = [];
      i++;
      while (i < tokens.length && depth > 0) {
        if (tokens[i].type === 'LPAREN') depth++;
        else if (tokens[i].type === 'RPAREN') depth--;

        if (depth > 0) {
          subTokens.push(tokens[i]);
          i++;
        }
      }
      if (depth !== 0) {
        return { success: false, value: 0, error: 'Paréntesis desbalanceados' };
      }
      i++; // Skip closing paren

      const subRes = evaluateTokens(subTokens);
      if (!subRes.success) return subRes;
      resolvedTokens.push({ type: 'NUMBER', value: subRes.value });
    } else {
      resolvedTokens.push(tokens[i]);
      i++;
    }
  }

  // Second pass: Process percentages
  // In financial calculators:
  // A + B% => A + (A * B / 100)
  // A - B% => A - (A * B / 100)
  // A * B% => A * (B / 100)
  // A / B% => A / (B / 100)
  // standalone B% => B / 100
  const percentProcessedTokens: Token[] = [];
  let j = 0;
  while (j < resolvedTokens.length) {
    const cur = resolvedTokens[j];
    const next = resolvedTokens[j + 1];

    if (cur.type === 'NUMBER' && next && next.type === 'PERCENT') {
      const b = cur.value as number;
      // Look back for preceding operator and base number
      const prevOp = percentProcessedTokens[percentProcessedTokens.length - 1];
      const baseNum = percentProcessedTokens[percentProcessedTokens.length - 2];

      if (prevOp && prevOp.type === 'OPERATOR' && baseNum && baseNum.type === 'NUMBER') {
        const base = baseNum.value as number;
        if (prevOp.value === '+' || prevOp.value === '-') {
          // Transform B% to (base * b / 100)
          percentProcessedTokens.push({ type: 'NUMBER', value: (base * b) / 100 });
        } else {
          // For * or /: transform B% to (b / 100)
          percentProcessedTokens.push({ type: 'NUMBER', value: b / 100 });
        }
      } else {
        // Standalone B% -> b / 100
        percentProcessedTokens.push({ type: 'NUMBER', value: b / 100 });
      }
      j += 2; // skip NUMBER and PERCENT
    } else {
      percentProcessedTokens.push(cur);
      j++;
    }
  }

  // Third pass: Multiplication and Division
  const additiveTokens: Token[] = [];
  let k = 0;
  while (k < percentProcessedTokens.length) {
    const token = percentProcessedTokens[k];

    if (token.type === 'OPERATOR' && (token.value === '*' || token.value === '/')) {
      const left = additiveTokens.pop();
      const right = percentProcessedTokens[k + 1];

      if (!left || left.type !== 'NUMBER' || !right || right.type !== 'NUMBER') {
        return { success: false, value: 0, error: 'Expresión inválida' };
      }

      const lVal = left.value as number;
      const rVal = right.value as number;

      if (token.value === '/' && rVal === 0) {
        return { success: false, value: 0, error: 'No es posible dividir entre cero' };
      }

      const res = token.value === '*' ? lVal * rVal : lVal / rVal;
      additiveTokens.push({ type: 'NUMBER', value: res });
      k += 2;
    } else {
      additiveTokens.push(token);
      k++;
    }
  }

  // Fourth pass: Addition and Subtraction
  if (additiveTokens.length === 0) {
    return { success: true, value: 0 };
  }

  let finalResult = 0;
  let currentOp = '+';

  // Handle leading sign if present
  let m = 0;
  if (additiveTokens[0].type === 'OPERATOR' && (additiveTokens[0].value === '+' || additiveTokens[0].value === '-')) {
    currentOp = additiveTokens[0].value as string;
    m = 1;
  } else if (additiveTokens[0].type === 'NUMBER') {
    finalResult = additiveTokens[0].value as number;
    m = 1;
  }

  while (m < additiveTokens.length) {
    const token = additiveTokens[m];

    if (token.type === 'OPERATOR') {
      currentOp = token.value as string;
      m++;
    } else if (token.type === 'NUMBER') {
      const val = token.value as number;
      if (currentOp === '+') {
        finalResult += val;
      } else if (currentOp === '-') {
        finalResult -= val;
      }
      m++;
    } else {
      return { success: false, value: 0, error: 'Error de sintaxis' };
    }
  }

  // Fix floating point quirks e.g. 0.1 + 0.2
  const cleaned = Math.round((finalResult + Number.EPSILON) * 1e10) / 1e10;

  return { success: true, value: cleaned };
}

/**
 * Main safe evaluation entry point
 */
export function safeEvaluate(expr: string): EvalResult {
  if (!expr || !expr.trim()) {
    return { success: true, value: 0 };
  }

  try {
    const tokens = tokenize(expr);
    return evaluateTokens(tokens);
  } catch {
    return { success: false, value: 0, error: 'Error en la operación' };
  }
}
