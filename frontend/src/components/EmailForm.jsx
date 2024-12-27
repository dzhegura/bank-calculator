import React, { useState } from 'react';

function EmailForm({ result, subject, calculatorType }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');

    const handleSendEmail = async () => {
        setStatus('');
        try {
            const response = await fetch('http://localhost:5000/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    subject,
                    result,
                    calculatorType,
                }),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.error || 'Ошибка при отправке письма.');
            }

            setStatus('Письмо успешно отправлено. Проверьте терминал для предпросмотра ссылки.');
        } catch (error) {
            console.error('Ошибка при отправке письма:', error);
            setStatus('Ошибка при отправке письма');
        }
    };

    return (
        <div>
            <h3>Отправить результаты на почту</h3>
            <input
                type="email"
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSendEmail}>Отправить</button>
            {status && <p>{status}</p>}
        </div>
    );
}

export default EmailForm;
