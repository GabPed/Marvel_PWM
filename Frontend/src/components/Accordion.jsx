import React from "react";

function Accordion({ id, items }) {
    return (        
        <div className="accordion accordion-flush" id={id}>
            {
                items.map((item, index) => (
                    <AccordionItem 
                        key={index}
                        idParent={id}
                        title={item.title}
                        quantity={item.quantity}
                        content={item.content}
                    />
                ))
            }
        </div>          
    );
}


export default Accordion;

function AccordionItem({idParent, title, quantity, content}) {
    if(quantity == 0) return <></>
    return (
        <div className="accordion-item border-0">
            <h2 className="accordion-header">
                <button
                    className="btn btn-link link-primary link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover collapsed p-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={"#"+idParent+title}
                    aria-expanded="false"
                    aria-controls={title}
                >
                    {title} ({quantity})
                </button>
            </h2>
            <div
                id={idParent+title}
                className="accordion-collapse collapse"
                data-bs-parent={"#"+idParent}
            >
                <div className="accordion-body fst-italic p-0 fs-6">
                    {content}
                </div>
            </div>
        </div>
    );
}