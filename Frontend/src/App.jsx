import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import Home from './pages/Home';
import Login from './pages/Login';
import Baratto from './pages/Baratto';
import SignUp from './pages/SignUp';
import EditProfile from './pages/EditProfile';
import EditPassword from './pages/EditPassword';
import Settings from './pages/Settings';
import Album from './pages/Album';
import NewOffers from './pages/NewOffers';
import OldOffers from './pages/OldOffers';
import Home from './pages/Home';
import UserAlbum from './pages/UserAlbum';
import Searchusers from './pages/SearchUser';
import Payment from './pages/Payment';
import ResetPassword from './pages/ResetPassword';
import AuthGuard from './auth/AuthGuard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp/>} />
            <Route path="/settings" element={<AuthGuard><Settings/></AuthGuard>} />
            <Route path="/settings/edit-profile" element={<AuthGuard><EditProfile/></AuthGuard>} />
            <Route path="/settings/edit-password" element={<AuthGuard><EditPassword/></AuthGuard>} />
            <Route path="/reset-password" element={<ResetPassword/>} />
            <Route path="/reset-password/:token" element={<ResetPassword/>} />
            <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
            <Route path="/album" element={<Album />} />
            <Route path="/baratto" element={<Baratto />}/>
            <Route path="/new-offers" element={<NewOffers />}/>
            <Route path="/old-offers" element={<OldOffers />}/>
            <Route path="/search-users" element={<Searchusers />}/>
            <Route path="/user/:username" element={<UserAlbum />}/>
            <Route path="/payment/:status" element={<Payment />}/>

            {/* Route di fallback per gestire le pagine non trovate */}
            <Route path="*" element={<AuthGuard><Home /></AuthGuard>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

