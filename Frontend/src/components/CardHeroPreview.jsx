
import React from "react";

function CardHeroPreview({children = '', option, hero, image, className = ''}) {
  return (
    <>
      <div
        className={`card h-100 shadow border-0 ${className}`}
        style={{ width: "12rem" }}
        {...(option && { onClick: option })}
      >
        <img
          src={image}
          className="card-img-top object-fit-cover rounded-top shadow-sm"
          alt={`${hero} image`}  
        />
        <div className="card-body">
          <h5 className="card-title">{hero}</h5>
        </div>
        {children} 
      </div>
    </>
  );
}

export default CardHeroPreview;
