export default function SuccessPopup() {
  return (
    <div className="success-popup">
      <div className="success-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
      </div>
      <div>
        <h4>Заявка отправлена!</h4>
        <p>Мы свяжемся с вами в ближайшее время</p>
      </div>
    </div>
  );
}
