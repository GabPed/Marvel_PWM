import NavButton from './NavButton';
import Sidebar from './Sidebar';

function Container({ className = 'w-100 p-2', children = '' }) {
  return (
    <div className="container-fluid d-flex p-0">
      <div>
        <NavButton />
        <Sidebar />
      </div>
      <div className={' '+className}>
        {children}
      </div>
    </div>
  );
}

export default Container;
