import React, { useState } from 'react';
import EmailForm from './EmailForm';

function AutoLoanCalculator() {
    const [carCost, setCarCost] = useState('');
    const [downPayment, setDownPayment] = useState('');
    const [annualRate, setAnnualRate] = useState('3.5');
    const [termYears, setTermYears] = useState('3');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleCalculate = async () => {
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/calculate/auto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carCost: Number(carCost),
                    downPayment: Number(downPayment),
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

            handleSaveCalculation('auto', {
                carCost,
                downPayment,
                annualRate,
                termYears,
            }, data);
        } catch (error) {
            console.error('Ошибка при расчёте автокредита:', error);
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
            <h2>Калькулятор автокредита</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label>Стоимость авто: </label>
                <input
                    type="number"
                    value={carCost}
                    onChange={(e) => setCarCost(e.target.value)}
                />
            </div>
            <div>
                <label>Первоначальный взнос: </label>
                <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
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
                <div>
                    <p>Сумма кредита: <b>{result.loanAmount}</b> руб.</p>
                    <p>Ежемесячный платёж: <b>{result.monthlyPayment}</b> руб.</p>
                    <p>Необходимый доход: <b>{result.requiredIncome}</b> руб.</p>

                    <EmailForm
                        result={result}
                        subject="Результаты расчёта автокредита"
                        calculatorType="auto"
                    />
                </div>
            )}
        </div>
    );
}

export default AutoLoanCalculator;
