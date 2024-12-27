import React, { useState } from 'react';
import EmailForm from './EmailForm';

function PensionCalculator() {
  const [currentSavings, setCurrentSavings] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [annualRate, setAnnualRate] = useState('5');
  const [years, setYears] = useState('20');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/calculate/pension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSavings: Number(currentSavings),
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

      handleSaveCalculation('pension', {
        currentSavings,
        monthlyContribution,
        annualRate,
        years,
      }, data);
    } catch (error) {
      console.error('Ошибка при расчёте пенсионных накоплений:', error);
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
        throw new Error('Ошибка при сохранении расчета');
      }

      console.log('Расчет успешно сохранен в базе данных.');
    } catch (error) {
      console.error('Ошибка при сохранении расчета:', error);
    }
  };

  return (
    <div>
      <h2>Калькулятор пенсионных накоплений</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Текущие накопления: </label>
        <input
          type="number"
          value={currentSavings}
          onChange={(e) => setCurrentSavings(e.target.value)}
        />
      </div>
      <div>
        <label>Ежемесячный вклад: </label>
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
        <div>
          <p>Итоговые накопления: <b>{result.totalSavings}</b> руб.</p>

          <EmailForm
            result={result}
            subject="Результаты расчёта пенсионных накоплений"
            calculatorType="pension"
          />
        </div>
      )}
    </div>
  );
}

export default PensionCalculator;
