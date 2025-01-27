import { Link } from 'react-router-dom';
import Modal from 'bootstrap/js/dist/modal';

function UsersAvatar({user, size = 'md', className = ''}) {
  
  const getSize = () => {
    switch(size) {
      case 'sm':
        return { width: '30px', textSize: 'h6' };
      case 'md':
        return { width: '55px', textSize: 'h4' };
      case 'lg':
        return { width: '70px', textSize: 'h2' };
    }
  };

  const handleClick = (e) => {
    e.stopPropagation(); 
    const modalElement = document.querySelector('.modal.show');
    if (modalElement) {
      const modalInstance = new Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    
  };

  return (
    <Link 
      className={"d-flex justify-content-center justify-content-center align-items-center text-body link-offset-2 link-offset-3-hover link-underline-primary link-underline-secondary link-underline-opacity-0 link-underline-opacity-75-hover " + className}
      to={`/user/${user.username}`}
      onClick={handleClick}
    >
       <img
        className="rounded-circle shadow"
        src={"../src/assets/avatars/"+user.favoriteHero_img}
        alt="avatar"
        width={getSize().width}
      /> 
      <h4 className={"ms-3 m-0 "+getSize().textSize}>
        {user.username}
      </h4>                     
     </Link>
  );
}

export default UsersAvatar;
