import React, { useState } from 'react';
import EmailForm from './EmailForm';

function MortgageCalculator() {
    const [propertyCost, setPropertyCost] = useState('');
    const [downPayment, setDownPayment] = useState('');
    const [annualRate, setAnnualRate] = useState('9.6');
    const [termYears, setTermYears] = useState('20');
    const [result, setResult] = useState(null);

    const handleCalculate = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/calculate/mortgage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyCost: Number(propertyCost),
                    downPayment: Number(downPayment),
                    annualRate: Number(annualRate),
                    termYears: Number(termYears),
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при расчете');
            }

            const data = await response.json();
            setResult(data);

            handleSaveCalculation('mortgage', {
                propertyCost,
                downPayment,
                annualRate,
                termYears,
            }, data);
        } catch (error) {
            console.error('Ошибка при расчете ипотеки:', error);
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
            <h2>Ипотечный калькулятор</h2>
            <div>
                <label>Стоимость недвижимости: </label>
                <input
                    type="number"
                    value={propertyCost}
                    onChange={(e) => setPropertyCost(e.target.value)}
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
                <div style={{ marginTop: '1rem' }}>
                    <p>Сумма кредита: <b>{result.loanAmount}</b> руб.</p>
                    <p>Ежемесячный платёж: <b>{result.monthlyPayment}</b> руб.</p>
                    <p>Необходимый доход: <b>{result.requiredIncome}</b> руб.</p>

                    <EmailForm
                        result={result}
                        subject="Результаты расчёта ипотеки"
                        calculatorType="mortgage"
                    />
                </div>
            )}
        </div>
    );
}

export default MortgageCalculator;