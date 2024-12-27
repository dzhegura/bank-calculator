import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import './AdminModule.css';

function AdminModule() {
    const [calculators, setCalculators] = useState([]);
    const [calculations, setCalculations] = useState([]);
    const [editingCalculator, setEditingCalculator] = useState(null);
    const [newCalculator, setNewCalculator] = useState({ name: '', type: '', description: '' });

    useEffect(() => {
        fetch('http://localhost:5000/api/calculators')
            .then((response) => response.json())
            .then((data) => setCalculators(data))
            .catch((error) => console.error('Ошибка при загрузке калькуляторов:', error));
    }, []);

    const fetchCalculations = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/calculations');
            const data = await response.json();
            setCalculations(data.map(calc => ({
                ...calc,
                type: {
                    mortgage: 'Ипотека',
                    auto: 'Автокредит',
                    pension: 'Пенсия',
                    deposit: 'Вклад',
                    custom: 'Пользовательский кредит',
                }[calc.type] || calc.type,
            })));
        } catch (error) {
            console.error('Ошибка при загрузке расчетов:', error);
        }
    };

    const handleAddCalculator = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/calculators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCalculator),
            });
            const addedCalculator = await response.json();
            setCalculators([...calculators, addedCalculator]);
            setNewCalculator({ name: '', type: '', description: '' });
        } catch (error) {
            console.error('Ошибка при добавлении калькулятора:', error);
        }
    };

    const handleEditCalculator = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/calculators/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCalculator),
            });
            const updatedCalculator = await response.json();
            setCalculators(
                calculators.map((calc) => (calc._id === id ? updatedCalculator : calc))
            );
            setEditingCalculator(null);
        } catch (error) {
            console.error('Ошибка при редактировании калькулятора:', error);
        }
    };

    const handleDeleteCalculator = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/calculators/${id}`, {
                method: 'DELETE',
            });
            setCalculators(calculators.filter((calc) => calc._id !== id));
        } catch (error) {
            console.error('Ошибка при удалении калькулятора:', error);
        }
    };

    const handleExportCalculations = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/export-calculations');
            if (!response.ok) throw new Error('Ошибка при экспорте расчетов');
            const blob = await response.blob();
            saveAs(blob, 'calculations.xlsx');
        } catch (error) {
            console.error('Ошибка при экспорте расчетов:', error);
        }
    };

    return (
        <div className="admin-module">
            <h2>Добавить новый калькулятор</h2>
            <div className="calculator-form">
                <input
                    type="text"
                    placeholder="Название"
                    value={newCalculator.name}
                    onChange={(e) => setNewCalculator({ ...newCalculator, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Тип"
                    value={newCalculator.type}
                    onChange={(e) => setNewCalculator({ ...newCalculator, type: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Описание"
                    value={newCalculator.description}
                    onChange={(e) => setNewCalculator({ ...newCalculator, description: e.target.value })}
                />
            </div>
            <button className="add-button" onClick={handleAddCalculator}>Добавить</button>

            <h2>Список калькуляторов</h2>
            {calculators.map((calculator) => (
                <div key={calculator._id} className="calculator-item">
                    {editingCalculator && editingCalculator._id === calculator._id ? (
                        <div>
                            <input
                                type="text"
                                value={editingCalculator.name}
                                onChange={(e) => setEditingCalculator({ ...editingCalculator, name: e.target.value })}
                            />
                            <input
                                type="text"
                                value={editingCalculator.type}
                                onChange={(e) => setEditingCalculator({ ...editingCalculator, type: e.target.value })}
                            />
                            <input
                                type="text"
                                value={editingCalculator.description}
                                onChange={(e) => setEditingCalculator({ ...editingCalculator, description: e.target.value })}
                            />
                            <button onClick={() => handleEditCalculator(calculator._id)}>Сохранить</button>
                            <button onClick={() => setEditingCalculator(null)}>Отмена</button>
                        </div>
                    ) : (
                        <div className="calculator-item-content">
                            <h3>{calculator.name}</h3>
                            <p>Тип: {calculator.type}</p>
                            <p>Описание: {calculator.description}</p>
                            <div className="calculator-item-buttons">
                                <button
                                    className="edit-button"
                                    onClick={() => setEditingCalculator(calculator)}
                                >
                                    Редактировать
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDeleteCalculator(calculator._id)}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <h2>Расчеты</h2>
            <div className="calculations-controls">
                <button onClick={fetchCalculations}>Загрузить расчеты</button>
                <button onClick={handleExportCalculations}>Экспортировать расчеты</button>
            </div>

            <ul className="calculations-list">
                {calculations.map((calc, index) => (
                    <li key={index}>
                        <strong>Тип:</strong> {calc.type}, <strong>Дата:</strong> {new Date(calc.createdAt).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminModule;
