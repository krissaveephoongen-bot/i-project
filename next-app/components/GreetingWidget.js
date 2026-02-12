function GreetingWidget() {
  try {
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
      const hour = currentTime.getHours();
      if (hour < 12) return 'สวัสดีตอนเช้า';
      if (hour < 18) return 'สวัสดีตอนบ่าย';
      return 'สวัสดีตอนเย็น';
    };

    return (
      <div className="card" data-name="greeting-widget" data-file="components/GreetingWidget.js">
        <h2 className="text-3xl font-medium text-[var(--text-primary)] mb-2">
          {getGreeting()}, Alex
        </h2>
        <p className="text-[var(--text-secondary)]">
          {currentTime.toLocaleDateString('th-TH', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    );
  } catch (error) {
    console.error('GreetingWidget component error:', error);
    return null;
  }
}