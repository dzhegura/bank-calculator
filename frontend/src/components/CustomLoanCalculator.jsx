import React, { useState } from 'react';
import EmailForm from './EmailForm';

function CustomLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('');
  const [annualRate, setAnnualRate] = useState('10');
  const [termYears, setTermYears] = useState('5');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/calculate/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanAmount: Number(loanAmount),
          annualRate: Number(annualRate),
          termYears: Number(termYears),
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Ошибка сервера при расчёте.');
      }

      const data = await response.json();
      setResult(data);

      handleSaveCalculation('custom', {
        loanAmount,
        annualRate,
        termYears,
      }, data);
    } catch (error) {
      console.error('Ошибка при расчёте пользовательского кредита:', error);
      setError(error.message);
    }
  };

  const handleSaveCalculation = async (type, input, result) => {
    try {
      const response = await fetch('http://localhost:5000/api/save-calculation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, input, result }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при сохранении расчета.');
      }

      console.log('Расчет успешно сохранен в базе данных.');
    } catch (error) {
      console.error('Ошибка при сохранении расчёта:', error);
    }
  };

  return (
    <div>
      <h2>Калькулятор пользовательского кредита</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Сумма кредита: </label>
        <input
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
        />
      </div>
      <div>
        <label>Годовая ставка (%): </label>
        <input
          type="number"
          value={annualRate}
          onChange={(e) => setAnnualRate(e.target.value)}
        />
      </div>
      <div>
        <label>Срок (лет): </label>
        <input
          type="number"
          value={termYears}
          onChange={(e) => setTermYears(e.target.value)}
        />
      </div>
      <button onClick={handleCalculate}>Рассчитать</button>

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <p>Ежемесячный платёж: <b>{result.monthlyPayment}</b> руб.</p>
          <p>Необходимый доход: <b>{result.requiredIncome}</b> руб.</p>

          <EmailForm
            result={result}
            subject="Результаты расчёта пользовательского кредита"
            calculatorType="custom"
          />
        </div>
      )}
    </div>
  );
}

export default CustomLoanCalculator;
