import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from '../assets/logo-2.png';
import './navbar.css';

const Navbar = () => {
      
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false)

    return(
        <div className={`navbar ${menuOpen ? 'menu-open' : ''}`}>
            <Link to='/'>
              <img src={Logo} alt="Quizza"/>
            </Link>
            <div className="menu" onClick={() => {
                setMenuOpen(!menuOpen)
            }}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul className={menuOpen ? "open" : ""}>
                <NavLink to='/'><li>Início</li></NavLink>
                <NavLink to='/about'><li className='about'>Sobre</li></NavLink>
                <NavLink to='/contact'><li>Contatos</li></NavLink>
                <NavLink to='/jobs'><li>Vagas</li></NavLink>
            </ul>
            <button onClick={()=> navigate('/quizza', {replace:true})}>Começar</button>
        </div>
    )
}

export default Navbar