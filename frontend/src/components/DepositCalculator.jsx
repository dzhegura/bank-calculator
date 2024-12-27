import React, { useState } from 'react';
import EmailForm from './EmailForm';

function DepositCalculator() {
  const [initialDeposit, setInitialDeposit] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [annualRate, setAnnualRate] = useState('4');
  const [years, setYears] = useState('5');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/calculate/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialDeposit: Number(initialDeposit),
          monthlyContribution: Number(monthlyContribution),
          annualRate: Number(annualRate),
          years: Number(years),
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Ошибка сервера при расчёте.');
      }

      const data = await response.json();
      setResult(data);

      handleSaveCalculation('deposit', {
        initialDeposit,
        monthlyContribution,
        annualRate,
        years,
      }, data);
    } catch (error) {
      console.error('Ошибка при расчёте вклада:', error);
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
      <h2>Калькулятор вклада</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Начальная сумма вклада: </label>
        <input
          type="number"
          value={initialDeposit}
          onChange={(e) => setInitialDeposit(e.target.value)}
        />
      </div>
      <div>
        <label>Ежемесячный взнос: </label>
        <input
          type="number"
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(e.target.value)}
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
          value={years}
          onChange={(e) => setYears(e.target.value)}
        />
      </div>
      <button onClick={handleCalculate}>Рассчитать</button>

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <p>Итоговая сумма: <b>{result.totalAmount}</b> руб.</p>

          <EmailForm
            result={result}
            subject="Результаты расчёта вклада"
            calculatorType="deposit"
          />
        </div>
      )}
    </div>
  );
}

export default DepositCalculator;
