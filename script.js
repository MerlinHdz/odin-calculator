// Math operators //
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;


function operate(operator, a, b) {
    switch(operator) {
        case '+': return add(a, b);
        case '-': return subtract(a, b);
        case 'x': return multiply(a, b);
        case '÷': return divide(a, b);
    }
}


// State //
let firstNum = null;
let secondNum = null;
let operator = null;
let currentInput = '0';
let justEvaluated = false;
let hasError = false;


// DOM references
const displayValue = document.getElementById("value");
const displayExpression = document.getElementById("expression");
const clearBtn = document.getElementById('btn-clear');
const decimalBtn = document.getElementById('btn-decimal');
const equalsBtn = document.getElementById('btn-equals');
const backspaceBtn = document.getElementById('btn-backspace');


// Display Helpers //
function formatResult(n) {
    if (!isFinite(n)) return null;

    // round to max 10 significant digits to avoid float display issues
    const rounded = parseFloat(n.toPrecision(10));

    // If too long, use exponential
    const str = String(rounded);
    return str.length > 12 ? rounded.toExponential(5) : str;
}

function updateDisplay(value, isErr = false) {
    displayValue.classList.remove('small', 'error');
    if (isErr) {
        displayValue.classList.add('error');
    } else if (String(value).length > 9) {
        displayValue.classList.add('small');
    }

    displayValue.textContent = value;
}

function updateExpression(text) {
    displayExpression.textContent = text;
}

function setActiveOp(op) {
    document.querySelectorAll('.btn__operator').forEach(b => {
        b.classList.toggle('active', b.dataset.op === op);
    })
}

function updateDecimalBtn() {
    decimalBtn.disabled = currentInput.includes('.');
}

function updateClearBtn() {
    clearBtn.textContent = (currentInput != '0' || firstNum !== null) ? 'C' : 'AC';
}


// Logic //
function inputDigit(digit) {
    if (hasError) return;

    if (justEvaluated) {
        // After = pressed, new digit starts fresh
        currentInput = digit;
        firstNum = null;
        operator = null;
        justEvaluated = false;
    } else {
        if (currentInput == '0') {
            currentInput = digit;
        } else if (currentInput.length < 12) {
            currentInput += digit;
        }
    }

    updateDisplay(currentInput);
}


function inputDecimal() {
    if (hasError) return;
    if (decimalBtn.disabled) return;

    if (justEvaluated) {
        currentInput = '0.';
        firstNum = null;
        operator = null;
        justEvaluated = false;
    } else if (!currentInput.includes('.')) {
        currentInput += '.';
    }

    updateDisplay(currentInput);
    updateDecimalBtn();
    updateClearBtn();
}

function inputOperator(op) {
    if (hasError) return;

    // If we already have firstNum and operator, and currentInput is new -> evaluate first
    if (firstNum !== null && operator !== null && !justEvaluated && currentInput !== '') {
        const result = operate(operator, firstNum, parseFloat(currentInput));

        // check divison by zero
        if (op === '÷' && parseFloat(currentInput) === 0) {
            showError("Cannot divide by zero");
            return;
        }

        const formatted = formatResult(result);
        firstNum = result;
        currentInput = String(formatted);
        updateDisplay(currentInput);
        updateExpression(`${formatted} ${op}`);
    }

    // first operator press, or consecutive operator press (just update operator)
    if (!justEvaluated) {
        firstNum = parseFloat(currentInput);
    }

    updateExpression(`${firstNum} ${op}`);

    operator = op;
    justEvaluated = false;
    currentInput = '';
    setActiveOp(op);
    updateClearBtn();
    updateDecimalBtn();
}

function calculate() {
    if (hasError) return;
    if (firstNum === null || operator === null || currentInput === '') return;

    const b = parseFloat(currentInput);

    if (operator === '÷' && b === 0) {
        showError("Cannot divide by zero");
        return;
    }

    const result = operate(operator, firstNum, b);
    const formatted = formatResult(result);

    updateExpression(`${firstNum} ${operator} ${b} =`);
    updateDisplay(formatted);

    firstNum = result;
    operator = null;
    currentInput = String(formatted);
    justEvaluated = true;
    setActiveOp(null);
    updateDecimalBtn();
    updateClearBtn();
}

function backspace() {
    if (hasError) { clearAll(); return;}
    if (justEvaluated) return;

    if (currentInput.length <= 1 || currentInput === '0') {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }

    updateDisplay(currentInput);
    updateDecimalBtn();
    updateClearBtn();
}

function clearAll() {
    firstNum = null;
    operator = null;
    secondNum = null;
    currentInput = '0';
    justEvaluated = false;
    hasError = false;
    updateDisplay(currentInput);
    updateExpression('');
    setActiveOp(null);
    clearBtn.textContent = 'AC';
    updateDecimalBtn();
}

function showError(msg) {
    hasError = true;
    updateDisplay(msg, hasError);
    updateExpression('');
    firstNum = null; operator = null; currentInput = '0';
    setActiveOp(null);
    clearBtn.textContent = 'AC';
}


// Event Listeners //
document.querySelectorAll('[data-digit]').forEach(btn => {
    btn.addEventListener('click', () => inputDigit(btn.dataset.digit));
});

document.querySelectorAll('[data-op]').forEach(btn => {
    btn.addEventListener('click', () => inputOperator(btn.dataset.op));
});


equalsBtn.addEventListener('click', calculate);
clearBtn.addEventListener('click', clearAll);
decimalBtn.addEventListener('click', inputDecimal);
backspaceBtn.addEventListener('click', backspace);