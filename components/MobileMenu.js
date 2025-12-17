function MobileMenu() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-lg"
      >
        <div className={`icon-${isOpen ? 'x' : 'menu'} text-2xl text-gray-900`}></div>
      </button>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}