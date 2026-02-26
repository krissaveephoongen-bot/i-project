function ClockInWidget() {
  try {
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [isClockedIn, setIsClockedIn] = React.useState(false);

    React.useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    return (
      <div
        className="card"
        data-name="clockin-widget"
        data-file="components/ClockInWidget.js"
      >
        <div className="text-center">
          <div className="text-5xl font-bold text-[var(--primary-color)] mb-4">
            {formatTime(currentTime)}
          </div>
          <button
            onClick={() => setIsClockedIn(!isClockedIn)}
            className={`w-full py-4 rounded-lg font-medium text-lg transition-all ${
              isClockedIn
                ? "bg-[var(--danger-color)] text-white hover:bg-opacity-90"
                : "bg-[var(--primary-color)] text-white hover:bg-opacity-90"
            }`}
          >
            <div
              className={`icon-${isClockedIn ? "log-out" : "log-in"} text-xl mr-2`}
            ></div>
            {isClockedIn ? "Clock Out" : "Clock In"}
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error("ClockInWidget component error:", error);
    return null;
  }
}
