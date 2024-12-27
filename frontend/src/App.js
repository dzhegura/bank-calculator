import React, { useState } from 'react';
import MortgageCalculator from './components/MortgageCalculator';
import AutoLoanCalculator from './components/AutoLoanCalculator';
import PensionCalculator from './components/PensionCalculator';
import CustomLoanCalculator from './components/CustomLoanCalculator';
import DepositCalculator from './components/DepositCalculator';
import AdminModule from './components/AdminModule';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('calculators');
  const [activeCalc, setActiveCalc] = useState('mortgage');

  return (
    <div className="App">
      <h1>Сервис расчётов</h1>

      <div className="navigation-container">
        <button
          onClick={() => setActivePage('calculators')}
          className={`navigation-button ${activePage === 'calculators' ? 'active' : ''}`}
        >
          🧮 Калькуляторы
        </button>
        <button
          onClick={() => setActivePage('admin')}
          className={`navigation-button ${activePage === 'admin' ? 'active' : ''}`}
        >
          🛠️ Административный модуль
        </button>
      </div>

      <div className="content-container">
        {activePage === 'calculators' && (
          <div>
            <div className="calc-buttons-container">
              <button
                onClick={() => setActiveCalc('mortgage')}
                className={`calc-button ${activeCalc === 'mortgage' ? 'active' : ''}`}
              >
                Ипотека
              </button>
              <button
                onClick={() => setActiveCalc('auto')}
                className={`calc-button ${activeCalc === 'auto' ? 'active' : ''}`}
              >
                Автокредит
              </button>
              <button
                onClick={() => setActiveCalc('pension')}
                className={`calc-button ${activeCalc === 'pension' ? 'active' : ''}`}
              >
                Пенсия
              </button>
              <button
                onClick={() => setActiveCalc('custom')}
                className={`calc-button ${activeCalc === 'custom' ? 'active' : ''}`}
              >
                Пользовательский кредит
              </button>
              <button
                onClick={() => setActiveCalc('deposit')}
                className={`calc-button ${activeCalc === 'deposit' ? 'active' : ''}`}
              >
                Вклады
              </button>
            </div>

            {activeCalc === 'mortgage' && <MortgageCalculator />}
            {activeCalc === 'auto' && <AutoLoanCalculator />}
            {activeCalc === 'pension' && <PensionCalculator />}
            {activeCalc === 'custom' && <CustomLoanCalculator />}
            {activeCalc === 'deposit' && <DepositCalculator />}
          </div>
        )}

        {activePage === 'admin' && <AdminModule />}
      </div>
    </div>
  );
}

export default App;