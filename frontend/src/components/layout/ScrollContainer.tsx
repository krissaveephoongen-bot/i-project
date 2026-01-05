import React, { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

interface ScrollContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const ScrollContainer: React.FC<ScrollContainerProps> = ({ children, className = '' }) => {
    const [showScrollButton, setShowScrollButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show button when page is scrolled down
            setShowScrollButton(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {children}

            {/* Scroll to Top Button */}
            {showScrollButton && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-300 z-40 hover:shadow-xl"
                    title="Scroll to top"
                    aria-label="Scroll to top"
                >
                    <ChevronUp className="h-5 w-5" />
                </button>
            )}
        </>
    );
};

export default ScrollContainer;
