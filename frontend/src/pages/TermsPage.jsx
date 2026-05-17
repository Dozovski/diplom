import React from 'react';

export default function TermsPage({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 24, width: '100%', maxWidth: 680,
        maxHeight: '85vh', overflowY: 'auto', padding: 40,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Условия аренды</h2>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card)',
            border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {[
          { title: '1. Общие положения', text: 'Настоящие условия регулируют отношения между арендатором и компанией Pail Rental при аренде автомобилей. Факт бронирования означает полное согласие с данными условиями.' },
          { title: '2. Требования к арендатору', text: 'Для аренды автомобиля необходимо: наличие паспорта гражданина РБ или загранпаспорта, водительское удостоверение с опытом вождения не менее 2 лет, возраст не менее 21 года.' },
          { title: '3. Стоимость и оплата', text: 'Стоимость аренды указана в белорусских рублях (BYN) за сутки. Оплата производится при получении автомобиля. Принимаются наличные и банковские карты.' },
          { title: '4. Страхование', text: 'В стоимость аренды включена базовая страховка КАСКО и ОСАГО. Расширенная страховка доступна за дополнительную плату. Арендатор несёт ответственность за ущерб, не покрытый страховкой.' },
          { title: '5. Использование автомобиля', text: 'Автомобиль передаётся в чистом состоянии с полным баком топлива. Возврат осуществляется в том же состоянии. Запрещается курение в салоне, перевозка животных без чехлов, использование в соревнованиях.' },
          { title: '6. Пробег', text: 'Базовый тариф включает 300 км в сутки. Превышение оплачивается по тарифу 0.30 BYN за каждый дополнительный километр.' },
          { title: '7. Выезд за пределы Минска', text: 'Поездки по территории Республики Беларусь разрешены. Выезд за пределы страны требует предварительного согласования и оформления дополнительных документов.' },
          { title: '8. Возврат автомобиля', text: 'Автомобиль возвращается в место получения в согласованное время. Опоздание более 2 часов считается дополнительными сутками аренды.' },
          { title: '9. Отмена бронирования', text: 'Отмена бронирования более чем за 24 часа — без штрафа. Отмена менее чем за 24 часа — удерживается 50% стоимости первых суток аренды.' },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>{item.title}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}