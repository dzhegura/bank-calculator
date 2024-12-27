const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const fs = require('fs');
const app = express();
const PORT = 5000;

// Настройка CORS и JSON
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/calculator-admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Модель калькуляторов
const CalculatorSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Название калькулятора
    type: { type: String, required: true }, // Тип (например: ипотека, автокредит и т.д.)
    description: String,                   // Описание
});

const Calculator = mongoose.model('Calculator', CalculatorSchema);

// Модель расчетов
const CalculationSchema = new mongoose.Schema({
    type: { type: String, required: true }, // Тип калькулятора
    input: { type: Object, required: true }, // Входные данные расчета
    result: { type: Object, required: true }, // Результаты расчета
    createdAt: { type: Date, default: Date.now }, // Время сохранения
});

const Calculation = mongoose.model('Calculation', CalculationSchema);

// CRUD API для калькуляторов
app.get('/api/calculators', async (req, res) => {
    try {
        const calculators = await Calculator.find();
        res.json(calculators);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка получения списка калькуляторов.' });
    }
});

app.post('/api/calculators', async (req, res) => {
    try {
        const { name, type, description } = req.body;
        const newCalculator = new Calculator({ name, type, description });
        await newCalculator.save();
        res.json(newCalculator);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка добавления калькулятора.' });
    }
});

app.put('/api/calculators/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, description } = req.body;
        const updatedCalculator = await Calculator.findByIdAndUpdate(
            id,
            { name, type, description },
            { new: true }
        );
        res.json(updatedCalculator);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка обновления калькулятора.' });
    }
});

app.delete('/api/calculators/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Calculator.findByIdAndDelete(id);
        res.json({ message: 'Калькулятор удалён.' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления калькулятора.' });
    }
});

// Эндпоинт для получения всех расчетов
app.get('/api/calculations', async (req, res) => {
    try {
        const calculations = await Calculation.find();
        res.json(calculations);
    } catch (err) {
        console.error('Ошибка при получении расчетов:', err);
        res.status(500).json({ error: 'Ошибка при получении расчетов.' });
    }
});

// Эндпоинт для сохранения расчета
app.post('/api/save-calculation', async (req, res) => {
    try {
        const { type, input, result } = req.body;

        if (!type || !input || !result) {
            return res.status(400).json({ error: 'Некорректные данные для сохранения.' });
        }

        const newCalculation = new Calculation({ type, input, result });
        await newCalculation.save();

        res.status(201).json({ message: 'Расчет успешно сохранен.' });
    } catch (error) {
        console.error('Ошибка при сохранении расчета:', error);
        res.status(500).json({ error: 'Ошибка при сохранении расчета.' });
    }
});

// Эндпоинты для всех калькуляторов
// Ипотека
app.post('/api/calculate/mortgage', (req, res) => {
    const { propertyCost, downPayment, annualRate, termYears } = req.body;

    if (!propertyCost || !downPayment || !annualRate || !termYears) {
        return res.status(400).json({ error: 'Некорректные данные для расчёта ипотеки.' });
    }

    const loanAmount = propertyCost - downPayment;
    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = termYears * 12;
    const commonRate = Math.pow(1 + monthlyRate, totalMonths);
    const monthlyPayment = loanAmount * monthlyRate * commonRate / (commonRate - 1);

    res.json({
        loanAmount: Math.round(loanAmount),
        monthlyPayment: Math.round(monthlyPayment),
        requiredIncome: Math.round(monthlyPayment * 2.5),
    });
});

// Автокредит
app.post('/api/calculate/auto', (req, res) => {
    const { carCost, downPayment, annualRate = 3.5, termYears } = req.body;

    if (!carCost || !downPayment || !annualRate || !termYears) {
        return res.status(400).json({ error: 'Некорректные данные для расчёта автокредита.' });
    }

    const loanAmount = carCost - downPayment;
    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = termYears * 12;
    const commonRate = Math.pow(1 + monthlyRate, totalMonths);
    const monthlyPayment = loanAmount * monthlyRate * commonRate / (commonRate - 1);

    res.json({
        loanAmount: Math.round(loanAmount),
        monthlyPayment: Math.round(monthlyPayment),
        requiredIncome: Math.round(monthlyPayment * 2.5),
    });
});

// Пенсия
app.post('/api/calculate/pension', (req, res) => {
    const { currentSavings, monthlyContribution, annualRate, years } = req.body;

    if (!currentSavings || !monthlyContribution || !annualRate || !years) {
        return res.status(400).json({ error: 'Некорректные данные для расчёта пенсионных накоплений.' });
    }

    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = years * 12;
    let totalSavings = currentSavings;
    for (let i = 0; i < totalMonths; i++) {
        totalSavings = totalSavings * (1 + monthlyRate) + monthlyContribution;
    }

    res.json({ totalSavings: Math.round(totalSavings) });
});

// Вклад
app.post('/api/calculate/deposit', (req, res) => {
    const { initialDeposit, monthlyContribution, annualRate, years } = req.body;

    if (!initialDeposit || !monthlyContribution || !annualRate || !years) {
        return res.status(400).json({ error: 'Некорректные данные для расчёта вклада.' });
    }

    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = years * 12;
    let totalAmount = initialDeposit;
    for (let i = 0; i < totalMonths; i++) {
        totalAmount = totalAmount * (1 + monthlyRate) + monthlyContribution;
    }

    res.json({ totalAmount: Math.round(totalAmount) });
});

// Пользовательский кредит
app.post('/api/calculate/custom', (req, res) => {
    const { loanAmount, annualRate, termYears } = req.body;

    if (!loanAmount || !annualRate || !termYears) {
        return res.status(400).json({ error: 'Некорректные данные для расчёта пользовательского кредита.' });
    }

    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = termYears * 12;
    const commonRate = Math.pow(1 + monthlyRate, totalMonths);
    const monthlyPayment = loanAmount * monthlyRate * commonRate / (commonRate - 1);

    res.json({
        monthlyPayment: Math.round(monthlyPayment),
        requiredIncome: Math.round(monthlyPayment * 2.5),
    });
});

// Настройка Ethereal Email
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Ошибка при создании тестового аккаунта:', err);
        return;
    }
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass,
        },
    });
    console.log('Ethereal test account created.');
    console.log(`Login: ${account.user}`);
    console.log(`Password: ${account.pass}`);
});

app.post('/api/send-email', async (req, res) => {
    const { email, subject, result, calculatorType } = req.body;

    if (!email || !subject || !result || !calculatorType) {
        return res.status(400).json({ error: 'Некорректные данные для отправки письма.' });
    }

    try {
        let text = '';
        switch (calculatorType) {
            case 'mortgage':
                text = `Сумма кредита: ${result.loanAmount || '—'} руб.\nЕжемесячный платёж: ${result.monthlyPayment || '—'} руб.\nНеобходимый доход: ${result.requiredIncome || '—'} руб.`;
                break;
            case 'auto':
                text = `Сумма кредита: ${result.loanAmount || '—'} руб.\nЕжемесячный платёж: ${result.monthlyPayment || '—'} руб.\nНеобходимый доход: ${result.requiredIncome || '—'} руб.`;
                break;
            case 'pension':
                text = `Итоговые накопления: ${result.totalSavings || '—'} руб.`;
                break;
            case 'deposit':
                text = `Итоговая сумма: ${result.totalAmount || '—'} руб.`;
                break;
            case 'custom':
                text = `Ежемесячный платёж: ${result.monthlyPayment || '—'} руб.\nНеобходимый доход: ${result.requiredIncome || '—'} руб.`;
                break;
            default:
                text = 'Неизвестный тип калькулятора.';
        }

        const info = await transporter.sendMail({
            from: 'test@example.com',
            to: email,
            subject,
            text,
        });

        console.log('Письмо отправлено:', info.messageId);
        console.log('Предпросмотр доступен по ссылке:', nodemailer.getTestMessageUrl(info));

        res.json({
            message: 'Письмо успешно отправлено',
            preview: nodemailer.getTestMessageUrl(info),
        });
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
        res.status(500).json({ error: 'Ошибка при отправке письма.' });
    }
});

app.get('/api/export-calculations', async (req, res) => {
    try {
        // Получение данных расчетов из базы
        const calculations = await Calculation.find();

        // Преобразование данных в JSON-формат с русскими обозначениями
        const jsonData = calculations.map(calc => ({
            "ID": calc._id.toString(),
            "Тип расчета": {
                mortgage: 'Ипотека',
                auto: 'Автокредит',
                pension: 'Пенсия',
                deposit: 'Вклад',
                custom: 'Пользовательский кредит',
            }[calc.type] || calc.type, // Перевод типа расчета
            "Входные данные": JSON.stringify(
                Object.entries(calc.input).reduce((acc, [key, value]) => {
                    const translations = {
                        propertyCost: 'Стоимость недвижимости',
                        downPayment: 'Первоначальный взнос',
                        annualRate: 'Годовая ставка',
                        termYears: 'Срок (лет)',
                        carCost: 'Стоимость автомобиля',
                        currentSavings: 'Текущие накопления',
                        monthlyContribution: 'Ежемесячный вклад',
                        loanAmount: 'Сумма кредита',
                        initialDeposit: 'Начальный вклад',
                    };
                    acc[translations[key] || key] = value;
                    return acc;
                }, {}),
                null,
                2
            ),
            "Результат": JSON.stringify(
                Object.entries(calc.result).reduce((acc, [key, value]) => {
                    const translations = {
                        loanAmount: 'Сумма кредита',
                        monthlyPayment: 'Ежемесячный платеж',
                        requiredIncome: 'Необходимый доход',
                        totalSavings: 'Итоговые накопления',
                        totalAmount: 'Итоговая сумма',
                    };
                    acc[translations[key] || key] = value;
                    return acc;
                }, {}),
                null,
                2
            ),
            "Дата создания": new Date(calc.createdAt).toLocaleString(),
        }));

        // Создание нового Excel-файл
        const worksheet = XLSX.utils.json_to_sheet(jsonData, {
            header: ["ID", "Тип расчета", "Входные данные", "Результат", "Дата создания"]
        });
        const workbook = XLSX.utils.book_new();

        // Добавление листа в книгу
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Расчеты');

        // Ширина столбцов
        const columnWidths = [
            { wch: 30 }, // ID
            { wch: 20 }, // Тип расчета
            { wch: 60 }, // Входные данные
            { wch: 60 }, // Результат
            { wch: 20 }, // Дата создания
        ];
        worksheet['!cols'] = columnWidths;

        // Указание временное место для сохранения файла
        const filePath = './calculations.xlsx';
        XLSX.writeFile(workbook, filePath);

        // Отправление файла клиенту
        res.setHeader('Content-Disposition', 'attachment; filename="calculations.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        fs.createReadStream(filePath).pipe(res).on('finish', () => {
            // Удаление файла после отправки
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('Ошибка при экспорте расчетов:', error);
        res.status(500).json({ error: 'Ошибка при экспорте расчетов.' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
