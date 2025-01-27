import './ScrollableCards.css';
import UsersAvatar from "./UsersAvatar";
import SearchBar from "./SearchBar";
import { useEffect, useRef} from "react";

function ScrollableCards({search, searchString, removeSearch, children = '',user, title, hasMore = false, action}) {

    const scrollableRef = useRef(null);
    const doActionRef = useRef(true); // Flag per gestire l'azione una sola volta ogni volta che supera il 90%

    const handleScroll = () => {
        const scrollable = scrollableRef.current;
        const scrollLeft = scrollable.scrollLeft;
        const scrollWidth = scrollable.scrollWidth;
        const clientWidth = scrollable.clientWidth;

        // Calcola la percentuale di scorrimento
        const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;

        // Se la percentuale è >= 90% e l'azione è consentita
        if (scrollPercentage >= 90 && hasMore && doActionRef.current) {
            doActionRef.current = false; // Impedisce esecuzioni continue
            action(); // Esegui l'azione
        }

        // Riabilita l'azione una volta che il 90% non è più raggiunto
        if (scrollPercentage < 90) {
            doActionRef.current = true;
        }
    };

    useEffect(() => {
        const scrollable = scrollableRef.current;
        scrollable.addEventListener('scroll', handleScroll);

        // Cleanup dell'event listener
        return () => {
            scrollable.removeEventListener('scroll', handleScroll);
        };
    }, [hasMore, action]);

    return (
        <div className="card bg-body-tertiary shadow-sm border-0 rounded d-inline-block scrollable-cards d-flex justify-content-center p-2 w-100">
            <div className="card-title d-flex flex-column justify-content-center py-2 my-2">
                {user && <UsersAvatar user = {user}/>}
                {search && 
                    <div className="d-flex justify-content-center mt-3 mx-2">
                        <SearchBar hint = "Search by name..." action={search}/>
                    </div>
                }
                {title &&
                    <div className="d-flex justify-content-center mt-3 mx-2">
                        <p className="h5 m-0">{title}</p>
                    </div>
                }
                {searchString !== '' && removeSearch &&
                    <div className='d-flex justify-content-start mt-2 mx-2'>
                        <div className="my-0">
                        <span className="badge rounded-pill d-flex flex-row align-items-center justify-content-center bg-body-tertiary text-wrap text-body shadow m-0">
                            <p className='m-2 fs-6 fw-normal text-break'>{searchString}</p>
                            <button type="button" className="btn-close btn-sm m-2" aria-label="Close" onClick={removeSearch}/>
                        </span>
                        </div>
                    </div>
                }
            </div> 
            <div 
                ref={scrollableRef}
                className='card-body d-flex flex-row align-item-center overflow-x-auto py-3 hide-scrollbar column-gap-4'
            >
                {children}
            </div>        
        </div>
    );
}

export default ScrollableCards;