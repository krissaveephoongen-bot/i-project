function HelpButton() {
    const [showMenu, setShowMenu] = React.useState(false);

    const openGuide = () => {
        window.open('https://da3oan9d8ljv.trickle.host/trickle/notes/user-guide.md', '_blank');
    };

    return (
        <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 shadow-lg">
                <div className="icon-help-circle text-xl"></div>
            </button>
            
            {showMenu && (
                <div className="absolute bottom-12 right-0 bg-white rounded-lg shadow-xl p-4 w-64 border border-gray-200">
                    <button onClick={openGuide} className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-3">
                        <div className="icon-book-open text-blue-500"></div>
                        <span>คู่มือการใช้งาน</span>
                    </button>
                </div>
            )}
        </div>
    );
}